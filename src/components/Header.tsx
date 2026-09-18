import React from "react";
import { Compass, CalendarCheck, Sparkles, Award, PlusCircle, MapPin } from "lucide-react";
import { TourismVisit, UserPreferences } from "../types";

interface HeaderProps {
  activeTab: "explore" | "recommendations" | "log" | "stats";
  onSelectTab: (tab: "explore" | "recommendations" | "log" | "stats") => void;
  visits: TourismVisit[];
  preferences: UserPreferences;
  onOpenLogModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  visits,
  preferences,
  onOpenLogModal,
}) => {
  const uniqueStates = new Set(visits.map((v) => v.state.trim().toLowerCase())).size;

  return (
    <header className="sticky top-0 z-30 bg-stone-900/95 backdrop-blur border-b border-stone-800 text-stone-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab("explore")}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-amber-100 shadow-inner">
              <Compass className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-stone-100 font-serif-display">
                  Heritage Trail
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-950/80 text-amber-300 border border-amber-800/50">
                  US Landmark Tracker
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden sm:block">
                Daily tourism visit tracking & deep historical insights
              </p>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="hidden lg:flex items-center space-x-4 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-stone-800/80 border border-stone-700/60 text-stone-300">
              <CalendarCheck className="w-4 h-4 text-amber-400" />
              <span>
                <strong className="text-stone-100">{visits.length}</strong> Visits Logged
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-stone-800/80 border border-stone-700/60 text-stone-300">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>
                <strong className="text-stone-100">{uniqueStates}</strong> / 50 States
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-stone-800/80 border border-stone-700/60 text-stone-300">
              <span className="text-stone-400">Home:</span>
              <strong className="text-amber-200">{preferences.city ? `${preferences.city}, ` : ""}{preferences.state}</strong>
            </div>
          </div>

          {/* Right Action: Log Visit Button */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              id="log-visit-header-btn"
              onClick={onOpenLogModal}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold text-xs sm:text-sm shadow-sm transition-colors duration-150 active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-stone-950" />
              <span>Log Visit</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 border-t border-stone-800/80 py-2 overflow-x-auto scrollbar-none">
          <button
            id="tab-explore"
            onClick={() => onSelectTab("explore")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === "explore"
                ? "bg-stone-800 text-amber-300 shadow-sm"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Explore US Landmarks</span>
          </button>

          <button
            id="tab-recommendations"
            onClick={() => onSelectTab("recommendations")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === "recommendations"
                ? "bg-stone-800 text-amber-300 shadow-sm"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Personalized For You</span>
          </button>

          <button
            id="tab-log"
            onClick={() => onSelectTab("log")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === "log"
                ? "bg-stone-800 text-amber-300 shadow-sm"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Daily Visit Log ({visits.length})</span>
          </button>

          <button
            id="tab-stats"
            onClick={() => onSelectTab("stats")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === "stats"
                ? "bg-stone-800 text-amber-300 shadow-sm"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>State Map & Badges</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
