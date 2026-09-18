import React, { useState, useMemo } from "react";
import { Landmark, TourismVisit, USRegion } from "../types";
import { US_LANDMARKS, ALL_INTEREST_TAGS } from "../data/landmarks";
import { LandmarkCard } from "./LandmarkCard";
import { Search, MapPin, Filter, SlidersHorizontal, Compass, Sparkles } from "lucide-react";

interface ExploreDirectoryProps {
  visits: TourismVisit[];
  onSelectLandmark: (landmark: Landmark) => void;
  onLogVisitForLandmark: (landmark: Landmark) => void;
  onOpenLogModal: () => void;
}

const REGIONS: Array<"All" | USRegion> = [
  "All",
  "Northeast",
  "Mid-Atlantic",
  "Southeast",
  "Midwest",
  "Southwest",
  "Rocky Mountains",
  "Pacific Coast",
  "Alaska & Hawaii",
];

export const ExploreDirectory: React.FC<ExploreDirectoryProps> = ({
  visits,
  onSelectLandmark,
  onLogVisitForLandmark,
  onOpenLogModal,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<"All" | USRegion>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"featured" | "oldest" | "az">("featured");

  const visitedMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of visits) {
      const name = v.landmarkName.toLowerCase().trim();
      map.set(name, (map.get(name) || 0) + 1);
      if (v.landmarkId) {
        map.set(v.landmarkId, (map.get(v.landmarkId) || 0) + 1);
      }
    }
    return map;
  }, [visits]);

  // Filtered and sorted landmarks
  const filteredLandmarks = useMemo(() => {
    return US_LANDMARKS.filter((lm) => {
      const matchesSearch =
        lm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lm.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lm.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lm.era.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lm.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRegion = selectedRegion === "All" || lm.region === selectedRegion;
      const matchesCategory = selectedCategory === "All" || lm.category.includes(selectedCategory);

      return matchesSearch && matchesRegion && matchesCategory;
    }).sort((a, b) => {
      if (sortBy === "oldest") {
        const getYear = (str: string) => {
          const m = str.match(/\d{3,4}/);
          return m ? parseInt(m[0], 10) : 2000;
        };
        return getYear(a.yearEstablished) - getYear(b.yearEstablished);
      }
      if (sortBy === "az") {
        return a.name.localeCompare(b.name);
      }
      return 0; // Default curated order
    });
  }, [searchTerm, selectedRegion, selectedCategory, sortBy]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-display text-stone-900">
              Explore Iconic US Historic Destinations
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Browse {US_LANDMARKS.length} nationally preserved monuments, ancestral ruins, battlefields, and architectural feats
            </p>
          </div>

          <button
            onClick={onOpenLogModal}
            className="self-start md:self-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow-sm transition-colors"
          >
            + Log Visit to Any Place
          </button>
        </div>

        {/* Search Input and Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-100">
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search landmarks, states, eras, figures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="All">All Historical Themes & Categories</option>
              {ALL_INTEREST_TAGS.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="featured">Sort: Curated Featured Order</option>
              <option value="oldest">Sort: Chronological (Oldest Era First)</option>
              <option value="az">Sort: Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Region Pills Filter */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pt-2 pb-1 scrollbar-none">
          <span className="text-xs text-stone-500 font-semibold mr-1 shrink-0 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-stone-400" />
            Region:
          </span>
          {REGIONS.map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedRegion === reg
                  ? "bg-stone-900 text-amber-300 shadow-xs"
                  : "bg-stone-100 hover:bg-stone-200 text-stone-700"
              }`}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      {/* Landmarks Count & Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-stone-600 px-1">
          <span>
            Showing <strong className="text-stone-900">{filteredLandmarks.length}</strong> landmarks
            {selectedRegion !== "All" && ` in ${selectedRegion}`}
          </span>
          <span>Click any card for deep historical insights or audio narration</span>
        </div>

        {filteredLandmarks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
            <Compass className="w-8 h-8 text-stone-400 mx-auto" />
            <h3 className="text-base font-bold text-stone-900">No Landmarks Found</h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
              We couldn't find any destinations matching "{searchTerm}". Try clearing your filters or search term.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedRegion("All");
                setSelectedCategory("All");
              }}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-800"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLandmarks.map((landmark) => {
              const visitCount =
                visitedMap.get(landmark.name.toLowerCase()) || visitedMap.get(landmark.id) || 0;
              const isVisited = visitCount > 0;

              return (
                <LandmarkCard
                  key={landmark.id}
                  landmark={landmark}
                  isVisited={isVisited}
                  visitCount={visitCount}
                  onSelectLandmark={onSelectLandmark}
                  onLogVisitForLandmark={onLogVisitForLandmark}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
