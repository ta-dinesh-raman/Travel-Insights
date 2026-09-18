import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI client lazily or safely with User-Agent header
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", hasApiKey: Boolean(process.env.GEMINI_API_KEY) });
});

// Personalized recommendations API
app.post("/api/recommendations", async (req, res) => {
  try {
    const { userLocation, interests, travelStyle, tripDurationDays, visitedPlaceNames } = req.body;
    const ai = getAI();

    if (!ai) {
      return res.json({
        source: "curated_fallback",
        message: "Using curated intelligent recommendations engine.",
        recommendations: [],
      });
    }

    const prompt = `You are an expert United States historic preservationist and travel guide.
Based on the traveler's profile below, recommend 4 to 6 standout historical landmarks in the United States that best fit their interests and location:
- Traveler Current Location or Starting Region: ${userLocation?.state || "Any US Region"} (${userLocation?.city || "All Regions"})
- Preferred Travel Interests: ${Array.isArray(interests) && interests.length > 0 ? interests.join(", ") : "General American History & Landmark Architecture"}
- Travel Style: ${travelStyle || "Cultural explorer"}
- Trip Duration: ${tripDurationDays || 1} day(s)
- Destinations Already Visited (do NOT recommend these): ${Array.isArray(visitedPlaceNames) && visitedPlaceNames.length > 0 ? visitedPlaceNames.join(", ") : "None yet"}

For each recommended US destination, provide detailed historical significance and personalized rationale.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an authority on American heritage sites, National Historic Landmarks, and National Parks. Provide historically accurate, culturally respectful, and enticing recommendations.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A warm, personalized 1-2 sentence overview of why this selection was curated." },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  city: { type: Type.STRING },
                  state: { type: Type.STRING },
                  historicalEra: { type: Type.STRING },
                  matchScore: { type: Type.NUMBER, description: "Percentage score 80-99 indicating match to user interests" },
                  matchReason: { type: Type.STRING, description: "Direct explanation linking user interests and location to this place" },
                  keyHistoricalFact: { type: Type.STRING, description: "One compelling historical fact or event" },
                  recommendedTimeHours: { type: Type.STRING, description: "e.g. 2-3 hours or Half-day" },
                  bestTimeToVisit: { type: Type.STRING, description: "e.g. Morning before crowds or Late afternoon" },
                  mustSeeFeature: { type: Type.STRING, description: "Specific monument, room, trail, or artifact to see" }
                },
                required: ["name", "city", "state", "historicalEra", "matchScore", "matchReason", "keyHistoricalFact", "mustSeeFeature"]
              }
            }
          },
          required: ["summary", "recommendations"]
        }
      }
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return res.json({ source: "gemini", ...parsed });
  } catch (err: any) {
    console.error("Recommendations error:", err?.message || err);
    return res.status(500).json({ error: "Failed to generate recommendations", details: err?.message });
  }
});

// Deep Historical Insights API
app.post("/api/historical-insight", async (req, res) => {
  try {
    const { landmarkName, cityState, eraContext } = req.body;
    const ai = getAI();

    if (!ai) {
      return res.status(503).json({ error: "Gemini API key is not configured" });
    }

    const prompt = `Provide an authoritative, vivid historical dossier for the following United States historic landmark:
Landmark: ${landmarkName}
Location: ${cityState || "United States"}
Context/Era: ${eraContext || "All historical eras"}

Provide an immersive breakdown covering founding context, key figures, turning point moments, architectural engineering feats, and lesser-known historical secrets.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a senior historian at the Smithsonian Institution or National Park Service. Write with narrative richness, precision, and historical depth.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            era: { type: Type.STRING },
            foundedYear: { type: Type.STRING },
            overview: { type: Type.STRING, description: "Comprehensive 2-3 paragraph historical background and context." },
            pivotalEvents: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  year: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["year", "title", "description"]
              }
            },
            keyFigures: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  impact: { type: Type.STRING }
                },
                required: ["name", "role", "impact"]
              }
            },
            architecturalSignificance: { type: Type.STRING },
            lesserKnownTrivia: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            visitorEtiquetteAndTips: { type: Type.STRING }
          },
          required: ["title", "era", "foundedYear", "overview", "pivotalEvents", "keyFigures", "architecturalSignificance", "lesserKnownTrivia"]
        }
      }
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (err: any) {
    console.error("Historical insight error:", err?.message || err);
    return res.status(500).json({ error: "Failed to generate historical insight", details: err?.message });
  }
});

// Interactive "Ask the Historian" Q&A
app.post("/api/ask-historian", async (req, res) => {
  try {
    const { landmarkName, question, conversationHistory } = req.body;
    const ai = getAI();

    if (!ai) {
      return res.status(503).json({ error: "Gemini API key is not configured" });
    }

    const systemInstruction = `You are "Dr. Eleanor Vance", a distinguished American historian specializing in US landmarks, National Parks, battlefield conservation, and architectural history.
Answer the user's question specifically about "${landmarkName}". Be engaging, grounded in verified primary history, avoid myths, and provide context about the people and times. Keep answers concise yet illuminating (2 to 4 paragraphs).`;

    const contents = [];
    if (Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        contents.push(`${msg.role === "user" ? "User" : "Historian"}: ${msg.content}`);
      }
    }
    contents.push(`User Question regarding ${landmarkName}: ${question}`);

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: contents.join("\n\n"),
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({ answer: response.text || "No response generated." });
  } catch (err: any) {
    console.error("Ask historian error:", err?.message || err);
    return res.status(500).json({ error: "Failed to answer question", details: err?.message });
  }
});

// Personalized Day Itinerary Generator
app.post("/api/generate-itinerary", async (req, res) => {
  try {
    const { startLocation, targetLandmarks, pace, interests } = req.body;
    const ai = getAI();

    if (!ai) {
      return res.status(503).json({ error: "Gemini API key is not configured" });
    }

    const prompt = `Create a cohesive daily historic tourism itinerary for a traveler based in or visiting: ${startLocation}
Target Destinations/Landmarks: ${Array.isArray(targetLandmarks) ? targetLandmarks.join(", ") : targetLandmarks}
Travel Pace: ${pace || "Balanced"}
Key Historical Focus: ${Array.isArray(interests) ? interests.join(", ") : "General American History"}

Structure a morning, afternoon, and evening plan with logistical pacing, historic highlights, and walking/driving advice.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite travel concierge and historian designing memorable, high-value cultural excursions in the US.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            estimatedTotalHours: { type: Type.STRING },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timeSlot: { type: Type.STRING, description: "e.g. 09:00 AM - 11:30 AM" },
                  period: { type: Type.STRING, description: "Morning, Midday, Afternoon, or Evening" },
                  landmark: { type: Type.STRING },
                  action: { type: Type.STRING },
                  historicalNote: { type: Type.STRING },
                  proTip: { type: Type.STRING }
                },
                required: ["timeSlot", "period", "landmark", "action", "historicalNote"]
              }
            },
            insiderAdvice: { type: Type.STRING }
          },
          required: ["title", "subtitle", "schedule", "insiderAdvice"]
        }
      }
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (err: any) {
    console.error("Itinerary error:", err?.message || err);
    return res.status(500).json({ error: "Failed to generate itinerary", details: err?.message });
  }
});

// Setup Vite middleware or static serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Heritage Tracker server running on http://0.0.0.0:${PORT}`);
  });
}

start();
