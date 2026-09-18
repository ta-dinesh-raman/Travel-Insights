import React, { useState, useMemo } from "react";
import { TourismVisit, Landmark } from "../types";
import { US_LANDMARKS } from "../data/landmarks";
import {
  Calendar,
  MapPin,
  Star,
  Users,
  Clock,
  Sun,
  Trash2,
  Download,
  PlusCircle,
  Search,
  Filter,
  BookOpen,
  Award,
  Heart
} from "lucide-react";

interface VisitHistoryProps {
  visits: TourismVisit[];
  onDeleteVisit: (id: string) => void;
  onOpenLogModal: () => void;
  onSelectLandmark: (landmark: Landmark) => void;
}

export const VisitHistory: React.FC<VisitHistoryProps> = ({
  visits,
  onDeleteVisit,
  onOpenLogModal,
  onSelectLandmark,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStateFilter, setSelectedStateFilter] = useState("all");
  const [selectedRatingFilter, setSelectedRatingFilter] = useState("all");

  const uniqueStates = useMemo(() => {
    return Array.from(new Set(visits.map((v) => v.state))).sort();
  }, [visits]);

  // Filtered visits
  const filteredVisits = useMemo(() => {
    return visits
      .filter((v) => {
        const matchesSearch =
          v.landmarkName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (v.historicalTakeaway && v.historicalTakeaway.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesState = selectedStateFilter === "all" || v.state === selectedStateFilter;
        const matchesRating = selectedRatingFilter === "all" || v.rating >= parseInt(selectedRatingFilter, 10);

        return matchesSearch && matchesState && matchesRating;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [visits, searchTerm, selectedStateFilter, selectedRatingFilter]);

  // Export JSON file
  const handleExportJournal = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(visits, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `US_Heritage_Travel_Journal_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-display text-stone-900">
              Your Daily Tourism Log & Journal
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Chronological log of historic sites visited, personal takeaways, and travel impressions
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="export-journal-btn"
              onClick={handleExportJournal}
              disabled={visits.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 disabled:opacity-50 text-stone-700 font-semibold text-xs sm:text-sm transition-colors"
            >
              <Download className="w-4 h-4 text-stone-500" />
              <span>Export Journal</span>
            </button>

            <button
              id="log-new-visit-history-btn"
              onClick={onOpenLogModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-stone-950" />
              <span>Log New Visit</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-100">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search visits, landmarks, impressions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400 shrink-0" />
            <select
              value={selectedStateFilter}
              onChange={(e) => setSelectedStateFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Visited States ({uniqueStates.length})</option>
              {uniqueStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedRatingFilter}
              onChange={(e) => setSelectedRatingFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars Only</option>
              <option value="4">4 Stars and Above</option>
              <option value="3">3 Stars and Above</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visits List / Empty State */}
      {filteredVisits.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-900">No Visits Found</h3>
          <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
            {visits.length === 0
              ? "You haven't recorded any historic visits yet. Click 'Log New Visit' above to start tracking your daily journey!"
              : "No logged visits match your current search and filters. Try adjusting your search query."}
          </p>
          {visits.length === 0 && (
            <button
              onClick={onOpenLogModal}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs sm:text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Your First Visit</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredVisits.map((visit) => {
            const matchedLandmark = US_LANDMARKS.find(
              (lm) => lm.name.toLowerCase() === visit.landmarkName.toLowerCase() || lm.id === visit.landmarkId
            );

            return (
              <div
                key={visit.id}
                id={`visit-card-${visit.id}`}
                className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs hover:shadow-sm transition-shadow space-y-4"
              >
                {/* Card Top Row: Date, Title, Rating, Delete */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      <span>{new Date(visit.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "long", day: "numeric" })}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-stone-500">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        {visit.city}, {visit.state}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold font-serif-display text-stone-900">
                      {visit.landmarkName}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    {/* Rating stars */}
                    <div className="flex items-center space-x-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= visit.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-stone-200"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => {
                        if (confirm(`Remove "${visit.landmarkName}" visit from your log?`)) {
                          onDeleteVisit(visit.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Visit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Meta Pills: Duration, Companions, Weather */}
                <div className="flex flex-wrap gap-2 text-xs text-stone-600">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 border border-stone-200">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    {visit.duration}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 border border-stone-200">
                    <Users className="w-3.5 h-3.5 text-stone-400" />
                    {visit.companions}
                  </span>
                  {visit.weather && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 border border-stone-200">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      {visit.weather}
                    </span>
                  )}
                </div>

                {/* Personal Notes */}
                {visit.notes && (
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-stone-50/70 p-3 rounded-lg border border-stone-200/60">
                    "{visit.notes}"
                  </p>
                )}

                {/* Callout highlights: favorite moment & takeaway */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {visit.favoriteMoment && (
                    <div className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-200/50 flex items-start gap-2">
                      <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-amber-950 block">Highlight / Artifact:</span>
                        <span className="text-stone-700">{visit.favoriteMoment}</span>
                      </div>
                    </div>
                  )}

                  {visit.historicalTakeaway && (
                    <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200/50 flex items-start gap-2">
                      <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-emerald-950 block">Historical Takeaway:</span>
                        <span className="text-stone-700">{visit.historicalTakeaway}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* View Landmark Link */}
                {matchedLandmark && (
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-end">
                    <button
                      onClick={() => onSelectLandmark(matchedLandmark)}
                      className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Review Historical Insights for {matchedLandmark.name} →</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
