import React, { useState } from "react";
import { TourismVisit, Landmark } from "../types";
import { US_STATES, US_LANDMARKS } from "../data/landmarks";
import { Award, CheckCircle2, MapPin, Compass, Star, Trophy, Sparkles, BookOpen } from "lucide-react";

interface TravelerStatsProps {
  visits: TourismVisit[];
  onSelectLandmark: (landmark: Landmark) => void;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  earned: boolean;
}

export const TravelerStats: React.FC<TravelerStatsProps> = ({ visits, onSelectLandmark }) => {
  const [filterRegion, setFilterRegion] = useState<string>("all");

  const visitedStateMap = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const v of visits) {
      const st = v.state.trim();
      map.set(st, (map.get(st) || 0) + 1);
    }
    return map;
  }, [visits]);

  const uniqueVisitedStatesCount = visitedStateMap.size;
  const statePercentage = Math.round((uniqueVisitedStatesCount / 50) * 100);

  const averageRating =
    visits.length > 0
      ? (visits.reduce((acc, cur) => acc + cur.rating, 0) / visits.length).toFixed(1)
      : "5.0";

  // Badges Calculation
  const visitedNames = new Set(visits.map((v) => v.landmarkName.toLowerCase()));

  const badges: Badge[] = [
    {
      id: "liberty-bearer",
      name: "Liberty's Torchbearer",
      description: "Visited Independence Hall or Statue of Liberty & Ellis Island",
      category: "Foundations",
      icon: "🗽",
      earned: visitedNames.has("independence hall & liberty bell") || visitedNames.has("statue of liberty & ellis island"),
    },
    {
      id: "civil-war-scholar",
      name: "Battlefield Pilgrim",
      description: "Explored Gettysburg National Military Park or Fort Sumter",
      category: "Civil War",
      icon: "⚔️",
      earned: visitedNames.has("gettysburg national military park") || visitedNames.has("fort sumter national monument"),
    },
    {
      id: "ancient-pueblo",
      name: "Ancestral Chronicler",
      description: "Explored Mesa Verde Cliff Dwellings or Cahokia Mounds",
      category: "Ancient Civilizations",
      icon: "🏛️",
      earned: visitedNames.has("mesa verde ancient cliff dwellings") || visitedNames.has("cahokia mounds state historic site"),
    },
    {
      id: "civil-rights",
      name: "Civil Rights Witness",
      description: "Visited Dr. Martin Luther King Jr. Historical Park or National Mall",
      category: "Human Rights",
      icon: "✊",
      earned: visitedNames.has("martin luther king jr. national historical park") || visitedNames.has("the national mall & lincoln memorial"),
    },
    {
      id: "aeronautics",
      name: "Wings & Rockets",
      description: "Visited Kennedy Space Center or Wright Brothers Memorial",
      category: "Science & Aviation",
      icon: "🚀",
      earned: visitedNames.has("kennedy space center & complex 39") || visitedNames.has("wright brothers national memorial"),
    },
    {
      id: "park-rover",
      name: "Conservation Pioneer",
      description: "Explored Yellowstone National Park or Gateway Arch",
      category: "Wilderness & Frontier",
      icon: "🌲",
      earned: visitedNames.has("yellowstone old faithful & historic district") || visitedNames.has("gateway arch national park"),
    },
    {
      id: "state-explorer-3",
      name: "Tri-State Trailblazer",
      description: "Logged historic visits across at least 3 distinct US states",
      category: "Milestones",
      icon: "🗺️",
      earned: uniqueVisitedStatesCount >= 3,
    },
    {
      id: "state-explorer-5",
      name: "Continental Wanderer",
      description: "Logged historic visits across at least 5 distinct US states",
      category: "Milestones",
      icon: "⭐",
      earned: uniqueVisitedStatesCount >= 5,
    },
  ];

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="space-y-8">
      {/* Top Statistics Overview Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl border border-stone-800 p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Traveler Heritage Profile
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-display text-white">
              National Tourism Footprint
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 max-w-xl">
              Tracking your progress across all 50 US states, preservation milestones, and historical eras explored.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="p-3.5 rounded-xl bg-stone-800/90 border border-stone-700/60 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-serif-display">
                {uniqueVisitedStatesCount}
                <span className="text-xs text-stone-400 font-sans font-normal"> / 50</span>
              </div>
              <div className="text-[11px] font-medium text-stone-400 uppercase tracking-wider mt-0.5">
                States Explored
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-800/90 border border-stone-700/60 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-serif-display">
                {visits.length}
              </div>
              <div className="text-[11px] font-medium text-stone-400 uppercase tracking-wider mt-0.5">
                Visits Logged
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-800/90 border border-stone-700/60 text-center col-span-2 sm:col-span-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-serif-display flex items-center justify-center gap-1">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                {averageRating}
              </div>
              <div className="text-[11px] font-medium text-stone-400 uppercase tracking-wider mt-0.5">
                Avg Experience
              </div>
            </div>
          </div>
        </div>

        {/* State Completion Bar */}
        <div className="mt-6 pt-6 border-t border-stone-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-300">
            <span>50 US States Discovery Progress</span>
            <span className="font-bold text-amber-300">{statePercentage}% Complete</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-stone-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.max(4, statePercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges & Achievements Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-serif-display text-stone-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              Historical Badges & Achievements ({earnedCount}/{badges.length} Unlocked)
            </h3>
            <p className="text-xs text-stone-600">
              Earn badges by visiting landmark sites representing critical eras of American history
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-xl border transition-all ${
                badge.earned
                  ? "bg-white border-amber-300 shadow-sm"
                  : "bg-stone-50/70 border-stone-200 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-2xl">{badge.icon}</span>
                {badge.earned ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    <CheckCircle2 className="w-3 h-3 text-amber-700" />
                    Unlocked
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wider">
                    Locked
                  </span>
                )}
              </div>

              <div className="mt-3 space-y-1">
                <h4 className="text-sm font-bold text-stone-900">{badge.name}</h4>
                <p className="text-xs text-stone-600 leading-snug">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 50 States Explorer Grid */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div>
            <h3 className="text-lg font-bold font-serif-display text-stone-900">
              50 States & Territories Tracker
            </h3>
            <p className="text-xs text-stone-600">
              States highlighted in green represent destinations you have officially logged in your journal
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-stone-700">Visited ({uniqueVisitedStatesCount})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-stone-200 border border-stone-300" />
              <span className="text-stone-500">Unvisited ({50 - uniqueVisitedStatesCount})</span>
            </span>
          </div>
        </div>

        {/* States Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {US_STATES.map((stateName) => {
            const count = visitedStateMap.get(stateName) || 0;
            const isVisited = count > 0;
            const landmarksInState = US_LANDMARKS.filter((l) => l.state === stateName);

            return (
              <div
                key={stateName}
                className={`p-2.5 rounded-lg border text-xs transition-all ${
                  isVisited
                    ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 font-medium"
                    : "bg-stone-50/50 border-stone-200 text-stone-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold truncate">{stateName}</span>
                  {isVisited && (
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      {count}
                    </span>
                  )}
                </div>

                {landmarksInState.length > 0 && (
                  <div className="mt-1.5 pt-1.5 border-t border-stone-200/50 flex flex-wrap gap-1">
                    {landmarksInState.map((lm) => (
                      <button
                        key={lm.id}
                        onClick={() => onSelectLandmark(lm)}
                        className="text-[10px] text-stone-500 hover:text-amber-800 underline truncate block text-left"
                        title={lm.name}
                      >
                        {lm.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
