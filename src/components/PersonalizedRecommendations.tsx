import React, { useState, useEffect, useMemo } from "react";
import { Landmark, TourismVisit, UserPreferences, RecommendationItem, ItineraryPlan } from "../types";
import { US_LANDMARKS, US_STATES, ALL_INTEREST_TAGS } from "../data/landmarks";
import {
  Sparkles,
  MapPin,
  Compass,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  Loader2,
  ChevronRight,
  Route,
  Tag,
  LocateFixed
} from "lucide-react";

interface PersonalizedRecommendationsProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
  visits: TourismVisit[];
  onSelectLandmark: (landmark: Landmark) => void;
  onLogVisitForLandmark: (landmark: Landmark) => void;
}

export const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({
  preferences,
  onUpdatePreferences,
  visits,
  onSelectLandmark,
  onLogVisitForLandmark,
}) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(preferences.interests || []);
  const [currentState, setCurrentState] = useState<string>(preferences.state || "Pennsylvania");
  const [currentCity, setCurrentCity] = useState<string>(preferences.city || "Philadelphia");
  const [travelPace, setTravelPace] = useState(preferences.preferredPace || "Balanced");
  const [travelStyle, setTravelStyle] = useState(preferences.travelStyle || "Cultural Enthusiast");

  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [recommendationsSummary, setRecommendationsSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Itinerary state
  const [itinerary, setItinerary] = useState<ItineraryPlan | null>(null);
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState(false);

  const visitedNames = useMemo(() => new Set(visits.map((v) => v.landmarkName.toLowerCase().trim())), [visits]);

  // Sync back to storage when preferences change
  const handleSaveProfile = () => {
    const updated: UserPreferences = {
      ...preferences,
      state: currentState,
      city: currentCity,
      interests: selectedInterests,
      preferredPace: travelPace,
      travelStyle,
    };
    onUpdatePreferences(updated);
  };

  // Toggle interest
  const toggleInterest = (tagId: string) => {
    let next: string[];
    if (selectedInterests.includes(tagId)) {
      next = selectedInterests.filter((t) => t !== tagId);
    } else {
      next = [...selectedInterests, tagId];
    }
    setSelectedInterests(next);
    onUpdatePreferences({ ...preferences, interests: next });
  };

  // Geolocation detector
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        // Find nearest landmark to guess the state/region
        let closestLandmark = US_LANDMARKS[0];
        let minDistance = Infinity;

        for (const lm of US_LANDMARKS) {
          const d = Math.hypot(lm.coordinates.lat - latitude, lm.coordinates.lng - longitude);
          if (d < minDistance) {
            minDistance = d;
            closestLandmark = lm;
          }
        }

        setCurrentState(closestLandmark.state);
        setCurrentCity(closestLandmark.city);
        onUpdatePreferences({
          ...preferences,
          state: closestLandmark.state,
          city: closestLandmark.city,
          lat: latitude,
          lng: longitude,
        });
      },
      (err) => {
        setIsLocating(false);
        console.warn("Location error:", err);
      },
      { timeout: 8000 }
    );
  };

  // Fallback / Initial Recommendation Generator
  const generateCuratedRecommendations = (): RecommendationItem[] => {
    return US_LANDMARKS.map((lm) => {
      let score = 70;
      // Boost if in same state or nearby region
      if (lm.state.toLowerCase() === currentState.toLowerCase()) score += 20;
      // Boost for matching interests
      const matchedCategories = lm.category.filter((c) => selectedInterests.includes(c));
      score += matchedCategories.length * 8;
      // Penalize if already visited
      if (visitedNames.has(lm.name.toLowerCase())) score -= 35;
      score = Math.min(99, Math.max(65, score));

      return {
        id: lm.id,
        name: lm.name,
        city: lm.city,
        state: lm.state,
        historicalEra: lm.era,
        matchScore: score,
        matchReason: `Matches your passion for ${matchedCategories.join(" & ") || "American history"} situated conveniently for ${currentState} travelers.`,
        keyHistoricalFact: lm.historicalSignificance.slice(0, 160) + "...",
        recommendedTimeHours: lm.typicalDuration,
        bestTimeToVisit: "Morning hours before main tour groups arrive",
        mustSeeFeature: lm.mustSeeArtifact,
        imageUrl: lm.imageUrl,
        category: lm.category,
      };
    })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6);
  };

  // Live API Recommendation generator
  const handleFetchRecommendations = async () => {
    setIsLoading(true);
    setRecommendationsSummary("");

    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userLocation: { state: currentState, city: currentCity },
          interests: selectedInterests,
          travelStyle,
          tripDurationDays: 1,
          visitedPlaceNames: Array.from(visitedNames),
        }),
      });

      if (!res.ok) throw new Error("API call failed");

      const data = await res.json();
      if (data.recommendations && data.recommendations.length > 0) {
        // Hydrate with local landmark images/ids if matched
        const hydrated: RecommendationItem[] = data.recommendations.map((item: any) => {
          const matchLocal = US_LANDMARKS.find(
            (l) => l.name.toLowerCase().includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(l.name.toLowerCase())
          );
          return {
            ...item,
            id: matchLocal?.id,
            imageUrl: matchLocal?.imageUrl || "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
            category: matchLocal?.category || ["Historic American Landmark"],
          };
        });
        setRecommendations(hydrated);
        setRecommendationsSummary(data.summary || "");
      } else {
        setRecommendations(generateCuratedRecommendations());
        setRecommendationsSummary(`Curated top historical sites for ${currentState} travelers passionate about ${selectedInterests.slice(0, 2).join(" & ") || "American heritage"}.`);
      }
    } catch (err) {
      console.warn("Using fallback curated recommendations:", err);
      setRecommendations(generateCuratedRecommendations());
      setRecommendationsSummary(`Curated top historical sites for ${currentState} travelers passionate about ${selectedInterests.slice(0, 2).join(" & ") || "American heritage"}.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Itinerary
  const handleGenerateItinerary = async () => {
    setIsGeneratingItinerary(true);
    setItinerary(null);

    const topLandmarks = recommendations.slice(0, 3).map((r) => `${r.name} in ${r.city}, ${r.state}`);

    try {
      const res = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startLocation: `${currentCity}, ${currentState}`,
          targetLandmarks: topLandmarks.length > 0 ? topLandmarks : ["Independence Hall", "Gettysburg Battlefield"],
          pace: travelPace,
          interests: selectedInterests,
        }),
      });

      if (!res.ok) throw new Error("Itinerary generation failed");
      const data = await res.json();
      setItinerary(data);
    } catch (err) {
      console.error(err);
      // Client-side fallback itinerary
      setItinerary({
        title: `Historic Heritage Excursion from ${currentState}`,
        subtitle: `Customized day tour focused on ${selectedInterests[0] || "Foundational History"}`,
        estimatedTotalHours: "6 to 8 hours",
        schedule: [
          {
            timeSlot: "09:00 AM - 11:30 AM",
            period: "Morning",
            landmark: recommendations[0]?.name || "Historic Assembly Grounds",
            action: "Early arrival for quiet self-guided tour and architectural viewing",
            historicalNote: "Experience the site before midday heat and large group tours.",
            proTip: "Check for ranger talks scheduled right after the morning bell.",
          },
          {
            timeSlot: "12:00 PM - 01:30 PM",
            period: "Midday",
            landmark: "Historic District Commons",
            action: "Lunch and visit to surrounding colonial tavern or heritage marketplace",
            historicalNote: "Sample regional cuisine rooted in 18th-century recipes.",
          },
          {
            timeSlot: "02:00 PM - 04:30 PM",
            period: "Afternoon",
            landmark: recommendations[1]?.name || "National Memorial Grounds",
            action: "Exploration of primary exhibits and museum artifacts",
            historicalNote: "Examine authentic documents and primary source battle maps.",
            proTip: "Wear comfortable walking shoes for outdoor trail loops.",
          },
        ],
        insiderAdvice: "Reserve National Park timed passes in advance and purchase an audio guide at the visitor center for personal immersion.",
      });
    } finally {
      setIsGeneratingItinerary(false);
    }
  };

  // Initial load
  useEffect(() => {
    handleFetchRecommendations();
  }, [currentState]);

  return (
    <div className="space-y-8">
      {/* Top Banner / User Location & Interests Control */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-7 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Personalized Heritage Intelligence</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-display text-stone-900 mt-1">
              Recommendations Tailored to Your Location & Passions
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Select your current location and historical interests to reveal curated US destinations with personalized visit rationales.
            </p>
          </div>

          <button
            id="refresh-recommendations-btn"
            onClick={handleFetchRecommendations}
            disabled={isLoading}
            className="self-start md:self-auto px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95 shrink-0"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> : <Sparkles className="w-4 h-4 text-amber-400" />}
            <span>Refresh Recommendations</span>
          </button>
        </div>

        {/* Location & Travel Profile Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* State Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-500" />
                Current State
              </label>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="text-[11px] text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
                title="Detect Nearest State"
              >
                <LocateFixed className="w-3 h-3" />
                <span>{isLocating ? "Locating..." : "Auto-Detect"}</span>
              </button>
            </div>
            <select
              value={currentState}
              onChange={(e) => {
                setCurrentState(e.target.value);
                onUpdatePreferences({ ...preferences, state: e.target.value });
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {US_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">Home City / Hub</label>
            <input
              type="text"
              value={currentCity}
              onChange={(e) => {
                setCurrentCity(e.target.value);
                onUpdatePreferences({ ...preferences, city: e.target.value });
              }}
              placeholder="e.g. Philadelphia"
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Travel Style */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-stone-500" />
              Travel Archetype
            </label>
            <select
              value={travelStyle}
              onChange={(e) => {
                setTravelStyle(e.target.value);
                onUpdatePreferences({ ...preferences, travelStyle: e.target.value });
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="Cultural Enthusiast">Cultural Enthusiast</option>
              <option value="Road Tripper">Road Tripper & Explorer</option>
              <option value="Family Historian">Family Historical Explorer</option>
              <option value="Architectural Scholar">Architectural & Engineering Buff</option>
              <option value="Sole Contemplator">Solitary Historic Wanderer</option>
            </select>
          </div>

          {/* Travel Pace */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              Preferred Pace
            </label>
            <select
              value={travelPace}
              onChange={(e) => {
                const pace = e.target.value as "Relaxed" | "Balanced" | "Intensive";
                setTravelPace(pace);
                onUpdatePreferences({ ...preferences, preferredPace: pace });
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="Relaxed">Relaxed (1 landmark / day)</option>
              <option value="Balanced">Balanced (2 landmarks / day)</option>
              <option value="Intensive">Intensive (3+ landmarks / day)</option>
            </select>
          </div>
        </div>

        {/* Interests Multi-Select Pills */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              Your Historical Passions & Curiosities ({selectedInterests.length} active)
            </span>
            <span className="text-xs text-stone-400">Click to toggle preferences</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {ALL_INTEREST_TAGS.map((tag) => {
              const isSelected = selectedInterests.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleInterest(tag.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-amber-700 text-amber-50 shadow-xs border border-amber-800"
                      : "bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200"
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-200" />}
                  <span>{tag.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recommendations Feed Section */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xl font-bold font-serif-display text-stone-900">
              Recommended Historic Sites for You
            </h3>
            {recommendationsSummary && (
              <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-3xl">
                {recommendationsSummary}
              </p>
            )}
          </div>

          <button
            id="build-itinerary-btn"
            onClick={handleGenerateItinerary}
            disabled={isGeneratingItinerary || recommendations.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold text-xs sm:text-sm shadow-sm transition-all"
          >
            {isGeneratingItinerary ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Route className="w-4 h-4" />
            )}
            <span>Generate 1-Day Heritage Itinerary</span>
          </button>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="py-16 flex flex-col items-center justify-center space-y-3 text-stone-500 bg-white rounded-2xl border border-stone-200">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            <p className="text-sm font-medium">Synthesizing personalized historical recommendations via Gemini...</p>
          </div>
        )}

        {/* Generated Itinerary Card (if requested) */}
        {itinerary && (
          <div className="bg-stone-900 text-stone-100 rounded-2xl border border-stone-800 p-6 shadow-lg space-y-5 animate-in fade-in duration-300">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Route className="w-3.5 h-3.5 text-amber-400" />
                  AI Curated Day Plan
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-serif-display text-white mt-2">
                  {itinerary.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-400 mt-0.5">{itinerary.subtitle} • Est. Time: {itinerary.estimatedTotalHours}</p>
              </div>

              <button
                onClick={() => setItinerary(null)}
                className="text-stone-400 hover:text-white text-xs p-1"
              >
                Close Plan
              </button>
            </div>

            {/* Schedule Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {itinerary.schedule.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
                    <span>{item.period}</span>
                    <span className="text-stone-400 font-normal">{item.timeSlot}</span>
                  </div>
                  <div className="font-bold text-sm text-stone-100">{item.landmark}</div>
                  <div className="text-xs text-stone-300">{item.action}</div>
                  <div className="text-xs text-stone-400 italic pt-1 border-t border-stone-700/50">
                    {item.historicalNote}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-stone-800 border border-stone-700 text-xs text-stone-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span><strong>Insider Advice:</strong> {itinerary.insiderAdvice}</span>
            </div>
          </div>
        )}

        {/* Recommendations Cards Grid */}
        {!isLoading && recommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((item, idx) => {
              const localMatch = US_LANDMARKS.find(
                (l) => l.name.toLowerCase() === item.name.toLowerCase() || (item.id && l.id === item.id)
              );
              const isVisited = visitedNames.has(item.name.toLowerCase());

              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Image / Header */}
                    <div className="relative h-44 w-full bg-stone-900 overflow-hidden">
                      <img
                        src={item.imageUrl || localMatch?.imageUrl || "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80"}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />

                      {/* Top Match Badge */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-600 text-stone-950 shadow-sm">
                          <Sparkles className="w-3 h-3 text-stone-950" />
                          {item.matchScore}% Match
                        </span>

                        {isVisited && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-600 text-white backdrop-blur">
                            Visited
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <p className="text-xs text-amber-300 font-medium">
                          {item.city}, {item.state}
                        </p>
                        <h4 className="text-base font-bold font-serif-display line-clamp-1">
                          {item.name}
                        </h4>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3 text-stone-800">
                      {/* Personalized Match Rationale */}
                      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/70 text-xs text-amber-950">
                        <span className="font-bold block mb-0.5">Why for you:</span>
                        <p className="line-clamp-2">{item.matchReason}</p>
                      </div>

                      {/* Historical Fact */}
                      <div className="text-xs text-stone-600 space-y-1">
                        <span className="font-semibold text-stone-900 block">Historical Context:</span>
                        <p className="line-clamp-2 leading-relaxed">{item.keyHistoricalFact}</p>
                      </div>

                      {/* Visit Details */}
                      <div className="pt-2 border-t border-stone-100 grid grid-cols-2 gap-2 text-[11px] text-stone-500">
                        <div>
                          <span className="block font-medium text-stone-700">Time to Spend</span>
                          <span>{item.recommendedTimeHours}</span>
                        </div>
                        <div>
                          <span className="block font-medium text-stone-700">Must-See</span>
                          <span className="line-clamp-1">{item.mustSeeFeature}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 pt-2 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        if (localMatch) {
                          onLogVisitForLandmark(localMatch);
                        } else {
                          // Generic landmark trigger
                          onLogVisitForLandmark({
                            id: "custom-" + item.name.toLowerCase().replace(/\s+/g, "-"),
                            name: item.name,
                            city: item.city,
                            state: item.state,
                            region: "Mid-Atlantic",
                            category: ["Historic Landmark"],
                            era: item.historicalEra,
                            yearEstablished: "Historic",
                            description: item.keyHistoricalFact,
                            historicalSignificance: item.keyHistoricalFact,
                            architecturalStyle: "Historic",
                            keyHighlights: [item.mustSeeFeature],
                            mustSeeArtifact: item.mustSeeFeature,
                            imageUrl: item.imageUrl || "",
                            coordinates: { lat: 39.8, lng: -98.5 },
                            visitorTips: item.bestTimeToVisit,
                            typicalDuration: item.recommendedTimeHours,
                          });
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-800 hover:bg-amber-100 border border-amber-300 transition-colors"
                    >
                      + Log Visit
                    </button>

                    {localMatch && (
                      <button
                        onClick={() => onSelectLandmark(localMatch)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white transition-colors"
                      >
                        <span>Deep Insights</span>
                        <ChevronRight className="w-3 h-3 text-stone-400" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
