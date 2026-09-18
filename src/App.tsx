import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { ExploreDirectory } from "./components/ExploreDirectory";
import { PersonalizedRecommendations } from "./components/PersonalizedRecommendations";
import { VisitHistory } from "./components/VisitHistory";
import { TravelerStats } from "./components/TravelerStats";
import { LandmarkDetailModal } from "./components/LandmarkDetailModal";
import { VisitLogModal } from "./components/VisitLogModal";
import { Landmark, TourismVisit, UserPreferences } from "./types";
import {
  getStoredVisits,
  saveStoredVisits,
  getStoredPreferences,
  saveStoredPreferences,
} from "./utils/storage";
import { CheckCircle2, Compass, ShieldAlert } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"explore" | "recommendations" | "log" | "stats">("explore");
  const [visits, setVisits] = useState<TourismVisit[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(() => getStoredPreferences());

  // Modals state
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [preselectedForLog, setPreselectedForLog] = useState<Landmark | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadedVisits = getStoredVisits();
    setVisits(loadedVisits);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSaveVisit = (newVisit: TourismVisit) => {
    const updated = [newVisit, ...visits];
    setVisits(updated);
    saveStoredVisits(updated);
    showToast(`Visit to ${newVisit.landmarkName} recorded in your daily journal!`);
  };

  const handleDeleteVisit = (id: string) => {
    const updated = visits.filter((v) => v.id !== id);
    setVisits(updated);
    saveStoredVisits(updated);
    showToast("Visit removed from travel journal.");
  };

  const handleUpdatePreferences = (updatedPrefs: UserPreferences) => {
    setPreferences(updatedPrefs);
    saveStoredPreferences(updatedPrefs);
  };

  const handleOpenLogForLandmark = (landmark: Landmark) => {
    setPreselectedForLog(landmark);
    setIsLogModalOpen(true);
  };

  const handleOpenGenericLog = () => {
    setPreselectedForLog(null);
    setIsLogModalOpen(true);
  };

  const isLandmarkVisited = (landmarkId: string, name: string) => {
    return visits.some(
      (v) => v.landmarkId === landmarkId || v.landmarkName.toLowerCase().trim() === name.toLowerCase().trim()
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-100/60 text-stone-900 selection:bg-amber-100 selection:text-amber-900">
      {/* Navigation & Status Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        visits={visits}
        preferences={preferences}
        onOpenLogModal={handleOpenGenericLog}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-stone-900 text-stone-100 shadow-xl border border-stone-800 text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === "explore" && (
          <ExploreDirectory
            visits={visits}
            onSelectLandmark={setSelectedLandmark}
            onLogVisitForLandmark={handleOpenLogForLandmark}
            onOpenLogModal={handleOpenGenericLog}
          />
        )}

        {activeTab === "recommendations" && (
          <PersonalizedRecommendations
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
            visits={visits}
            onSelectLandmark={setSelectedLandmark}
            onLogVisitForLandmark={handleOpenLogForLandmark}
          />
        )}

        {activeTab === "log" && (
          <VisitHistory
            visits={visits}
            onDeleteVisit={handleDeleteVisit}
            onOpenLogModal={handleOpenGenericLog}
            onSelectLandmark={setSelectedLandmark}
          />
        )}

        {activeTab === "stats" && (
          <TravelerStats
            visits={visits}
            onSelectLandmark={setSelectedLandmark}
          />
        )}
      </main>

      {/* Modals */}
      {selectedLandmark && (
        <LandmarkDetailModal
          landmark={selectedLandmark}
          onClose={() => setSelectedLandmark(null)}
          onLogVisit={handleOpenLogForLandmark}
          isVisited={isLandmarkVisited(selectedLandmark.id, selectedLandmark.name)}
        />
      )}

      <VisitLogModal
        isOpen={isLogModalOpen}
        preselectedLandmark={preselectedForLog}
        onClose={() => {
          setIsLogModalOpen(false);
          setPreselectedForLog(null);
        }}
        onSaveVisit={handleSaveVisit}
      />

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 border-t border-stone-800 py-8 px-4 sm:px-6 lg:px-8 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-amber-500" />
            <span className="font-serif-display font-semibold text-stone-200">
              US Heritage & Tourism Visit Tracker
            </span>
          </div>
          <p className="text-center sm:text-right text-stone-400">
            Dedicated to the study, preservation, and remembrance of foundational American places and turning points.
          </p>
        </div>
      </footer>
    </div>
  );
}
