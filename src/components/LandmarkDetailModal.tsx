import React, { useState, useEffect } from "react";
import { Landmark, HistoricalDossier } from "../types";
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  Award,
  Layers,
  Info
} from "lucide-react";

interface LandmarkDetailModalProps {
  landmark: Landmark | null;
  onClose: () => void;
  onLogVisit: (landmark: Landmark) => void;
  isVisited: boolean;
}

export const LandmarkDetailModal: React.FC<LandmarkDetailModalProps> = ({
  landmark,
  onClose,
  onLogVisit,
  isVisited,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "dossier" | "ask">("overview");

  // Audio Speech state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Gemini AI Dossier state
  const [dossier, setDossier] = useState<HistoricalDossier | null>(null);
  const [isLoadingDossier, setIsLoadingDossier] = useState(false);
  const [dossierError, setDossierError] = useState<string | null>(null);

  // Ask Historian state
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [isAsking, setIsAsking] = useState(false);

  useEffect(() => {
    // Reset state when landmark changes
    setDossier(null);
    setDossierError(null);
    setChatHistory([]);
    setQuestion("");
    if (isPlayingAudio) {
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
    }
  }, [landmark?.id]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!landmark) return null;

  // Audio Speech toggle
  const toggleAudioGuide = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Audio narration is not supported in this browser.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const textToRead = `${landmark.name}, located in ${landmark.city}, ${landmark.state}. Established in ${landmark.yearEstablished}. Historical Era: ${landmark.era}. ${landmark.description}. Historical significance: ${landmark.historicalSignificance}. Key Highlights include: ${landmark.keyHighlights.join(". ")}. Must see artifact: ${landmark.mustSeeArtifact}.`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  // Fetch AI Dossier
  const handleFetchDossier = async () => {
    if (dossier || isLoadingDossier) return;
    setIsLoadingDossier(true);
    setDossierError(null);

    try {
      const res = await fetch("/api/historical-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landmarkName: landmark.name,
          cityState: `${landmark.city}, ${landmark.state}`,
          eraContext: landmark.era,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate historical dossier");
      }

      const data = await res.json();
      setDossier(data);
    } catch (err: any) {
      console.error(err);
      setDossierError(err?.message || "Could not retrieve live dossier");
    } finally {
      setIsLoadingDossier(false);
    }
  };

  // Handle Ask Historian
  const handleAskHistorian = async (customQ?: string) => {
    const query = customQ || question.trim();
    if (!query || isAsking) return;

    const newHistory = [...chatHistory, { role: "user" as const, content: query }];
    setChatHistory(newHistory);
    setQuestion("");
    setIsAsking(true);

    try {
      const res = await fetch("/api/ask-historian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landmarkName: landmark.name,
          question: query,
          conversationHistory: chatHistory,
        }),
      });

      if (!res.ok) throw new Error("Failed to reach historian");
      const data = await res.json();
      setChatHistory([...newHistory, { role: "assistant", content: data.answer }]);
    } catch (err: any) {
      setChatHistory([
        ...newHistory,
        {
          role: "assistant",
          content: "I apologize, traveler. The historic archives could not be reached right now. Please check server connection and try again.",
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-sm overflow-y-auto">
      <div
        id="landmark-modal-container"
        className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Banner with Image */}
        <div className="relative h-56 sm:h-72 w-full shrink-0 bg-stone-900">
          <img
            src={landmark.imageUrl}
            alt={landmark.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent" />

          {/* Close Button */}
          <button
            id="close-landmark-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white backdrop-blur transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges and Top Info */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-900/80 backdrop-blur text-stone-100 border border-stone-700">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              {landmark.city}, {landmark.state} ({landmark.region})
            </span>
            {isVisited && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600/90 text-white backdrop-blur">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Visited
              </span>
            )}
          </div>

          {/* Title & Core Meta */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 text-xs text-amber-300 font-medium mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Established {landmark.yearEstablished}</span>
              <span>•</span>
              <span>{landmark.era}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-display text-white tracking-tight">
              {landmark.name}
            </h2>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="border-b border-stone-200 bg-stone-50 px-4 sm:px-6 py-2.5 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab("overview")}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                activeSubTab === "overview"
                  ? "bg-stone-900 text-amber-300 shadow-sm"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Historical Overview</span>
            </button>

            <button
              onClick={() => {
                setActiveSubTab("dossier");
                handleFetchDossier();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                activeSubTab === "dossier"
                  ? "bg-stone-900 text-amber-300 shadow-sm"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Deep AI Dossier</span>
            </button>

            <button
              onClick={() => setActiveSubTab("ask")}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                activeSubTab === "ask"
                  ? "bg-stone-900 text-amber-300 shadow-sm"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Ask the Historian</span>
            </button>
          </div>

          {/* Audio Guide Narration Button */}
          <button
            onClick={toggleAudioGuide}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isPlayingAudio
                ? "bg-amber-600 text-stone-950 border-amber-500 animate-pulse"
                : "bg-white text-stone-700 hover:bg-stone-100 border-stone-300"
            }`}
          >
            {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-600" />}
            <span>{isPlayingAudio ? "Stop Audio Tour" : "Play Audio Tour"}</span>
          </button>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-stone-800">
          {/* TAB 1: OVERVIEW */}
          {activeSubTab === "overview" && (
            <div className="space-y-6">
              {/* Historical Significance Callout */}
              <div className="p-4 sm:p-5 rounded-xl bg-amber-50/80 border border-amber-200/80">
                <h4 className="text-xs uppercase tracking-wider font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-700" />
                  National Historical Significance
                </h4>
                <p className="text-stone-800 text-sm sm:text-base leading-relaxed font-serif-display">
                  "{landmark.historicalSignificance}"
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider">About This Destination</h4>
                <p className="text-stone-600 text-sm leading-relaxed">{landmark.description}</p>
              </div>

              {/* Architecture & Engineering */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <h4 className="text-xs uppercase tracking-wider font-bold text-stone-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-stone-600" />
                  Architectural & Structural Style
                </h4>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  {landmark.architecturalStyle}
                </p>
              </div>

              {/* Key Highlights & Must-See Artifacts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-stone-200 bg-white shadow-xs space-y-2.5">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-amber-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    Key Historic Highlights
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-stone-600">
                    {landmark.keyHighlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 bg-white shadow-xs space-y-3">
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-bold text-amber-950 mb-1">
                      Must-See Artifact
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-700 font-medium">
                      {landmark.mustSeeArtifact}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-100">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-stone-900 mb-1 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-stone-500" />
                      Visitor Advice & Etiquette
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {landmark.visitorTips}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEEP AI DOSSIER */}
          {activeSubTab === "dossier" && (
            <div className="space-y-6">
              {isLoadingDossier && (
                <div className="py-12 flex flex-col items-center justify-center space-y-3 text-stone-500">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                  <p className="text-sm font-medium">Consulting Smithsonian & NPS historical archives via Gemini...</p>
                </div>
              )}

              {dossierError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
                  <p className="font-semibold mb-1">Notice</p>
                  <p>{dossierError}. You can still explore the comprehensive curated historical overview.</p>
                </div>
              )}

              {dossier && (
                <div className="space-y-6">
                  {/* Overview Text */}
                  <div className="prose prose-stone max-w-none text-sm leading-relaxed text-stone-700 bg-amber-50/40 p-4 rounded-xl border border-amber-200/50">
                    <h4 className="text-base font-bold text-stone-900 font-serif-display mb-2">
                      Comprehensive Historical Background
                    </h4>
                    <p>{dossier.overview}</p>
                  </div>

                  {/* Pivotal Events Timeline */}
                  {dossier.pivotalEvents && dossier.pivotalEvents.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-amber-600" />
                        Pivotal Events & Turning Points
                      </h4>
                      <div className="relative border-l-2 border-amber-300 ml-3 pl-4 space-y-4">
                        {dossier.pivotalEvents.map((evt, i) => (
                          <div key={i} className="relative group">
                            <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-amber-600 border-2 border-white" />
                            <div className="text-xs font-bold text-amber-800">{evt.year}</div>
                            <div className="text-sm font-semibold text-stone-900">{evt.title}</div>
                            <div className="text-xs text-stone-600 mt-0.5 leading-relaxed">{evt.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Historical Figures */}
                  {dossier.keyFigures && dossier.keyFigures.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                        Key Figures & Visionaries
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {dossier.keyFigures.map((fig, i) => (
                          <div key={i} className="p-3 rounded-lg border border-stone-200 bg-stone-50">
                            <div className="font-semibold text-sm text-stone-900">{fig.name}</div>
                            <div className="text-xs text-amber-700 font-medium mb-1">{fig.role}</div>
                            <div className="text-xs text-stone-600">{fig.impact}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lesser Known Trivia */}
                  {dossier.lesserKnownTrivia && dossier.lesserKnownTrivia.length > 0 && (
                    <div className="p-4 rounded-xl bg-stone-900 text-stone-100 space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        Lesser-Known Historical Secrets & Curiosities
                      </h4>
                      <ul className="space-y-2 text-xs sm:text-sm text-stone-300">
                        {dossier.lesserKnownTrivia.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ASK THE HISTORIAN */}
          {activeSubTab === "ask" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-800 text-amber-100 flex items-center justify-center font-serif font-bold text-sm shrink-0">
                  EV
                </div>
                <div className="text-xs text-stone-700 space-y-1">
                  <div className="font-semibold text-stone-900">Dr. Eleanor Vance, Senior Historian</div>
                  <p>
                    "Greetings. I specialize in the preservation and deep history of {landmark.name}. Ask me about any specific period, architectural choices, unsung figures, or historical controversies."
                  </p>
                </div>
              </div>

              {/* Sample Quick Questions */}
              {chatHistory.length === 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Suggested Inquiries:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => handleAskHistorian(`What was the most critical turning point in the history of ${landmark.name}?`)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 transition-colors"
                    >
                      Turning point moment?
                    </button>
                    <button
                      onClick={() => handleAskHistorian(`What were the engineering and architectural challenges when constructing ${landmark.name}?`)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 transition-colors"
                    >
                      Engineering challenges?
                    </button>
                    <button
                      onClick={() => handleAskHistorian(`What is a common myth or misconception about ${landmark.name}?`)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 transition-colors"
                    >
                      Common misconceptions?
                    </button>
                  </div>
                </div>
              )}

              {/* Messages container */}
              <div className="space-y-3 min-h-[160px] max-h-[300px] overflow-y-auto pr-1">
                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-4 py-2.5 text-xs sm:text-sm ${
                        msg.role === "user"
                          ? "bg-stone-900 text-white"
                          : "bg-stone-100 text-stone-800 border border-stone-200"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isAsking && (
                  <div className="flex justify-start">
                    <div className="bg-stone-100 rounded-xl px-4 py-2 text-xs text-stone-500 flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                      <span>Dr. Vance is reviewing historical archives...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Question Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskHistorian();
                }}
                className="flex items-center gap-2 pt-2 border-t border-stone-200"
              >
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={`Ask a question about ${landmark.name}...`}
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                />
                <button
                  type="submit"
                  disabled={!question.trim() || isAsking}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Modal Bottom Sticky Bar with Action */}
        <div className="p-4 sm:p-5 bg-stone-100 border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-stone-500 hidden sm:block">
            Estimated exploration time: <strong className="text-stone-800">{landmark.typicalDuration}</strong>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-stone-700 hover:bg-stone-200 transition-colors"
            >
              Close
            </button>

            <button
              id="modal-log-visit-btn"
              onClick={() => {
                onLogVisit(landmark);
                onClose();
              }}
              className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold text-xs sm:text-sm shadow-sm transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isVisited ? "Log Another Visit Here" : "Log Visit to This Landmark"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
