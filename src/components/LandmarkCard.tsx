import React from "react";
import { Landmark } from "../types";
import { MapPin, Calendar, Clock, CheckCircle2, ChevronRight, BookOpen } from "lucide-react";

interface LandmarkCardProps {
  landmark: Landmark;
  isVisited: boolean;
  visitCount?: number;
  onSelectLandmark: (landmark: Landmark) => void;
  onLogVisitForLandmark: (landmark: Landmark) => void;
}

export const LandmarkCard: React.FC<LandmarkCardProps> = ({
  landmark,
  isVisited,
  visitCount = 0,
  onSelectLandmark,
  onLogVisitForLandmark,
}) => {
  return (
    <div
      id={`landmark-card-${landmark.id}`}
      className="group bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* Image Banner */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-stone-100">
        <img
          src={landmark.imageUrl}
          alt={landmark.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-900/80 backdrop-blur text-stone-100 border border-stone-700/50">
            <MapPin className="w-3 h-3 text-amber-400" />
            {landmark.city}, {landmark.state}
          </span>

          {isVisited ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-600/90 text-white shadow-sm backdrop-blur">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Visited {visitCount > 1 ? `(${visitCount}x)` : ""}
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/90 text-stone-950 font-sans backdrop-blur">
              {landmark.region}
            </span>
          )}
        </div>

        {/* Title over bottom of image */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <p className="text-xs text-amber-300 font-medium tracking-wide flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Est. {landmark.yearEstablished}</span>
            <span>•</span>
            <span className="truncate">{landmark.era}</span>
          </p>
          <h3 className="text-lg font-bold font-serif-display leading-snug line-clamp-1 drop-shadow-sm text-white">
            {landmark.name}
          </h3>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Categories */}
          <div className="flex flex-wrap gap-1.5">
            {landmark.category.slice(0, 2).map((cat) => (
              <span
                key={cat}
                className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-stone-100 text-stone-700 border border-stone-200"
              >
                {cat}
              </span>
            ))}
          </div>

          <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
            {landmark.description}
          </p>

          {/* Must-See Highlight */}
          <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/60 text-xs text-stone-700">
            <span className="font-semibold text-amber-900 block mb-0.5">Must-See Artifact / Area:</span>
            <span className="line-clamp-1 text-stone-800">{landmark.mustSeeArtifact}</span>
          </div>
        </div>

        {/* Footer Meta & Actions */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div className="flex items-center text-xs text-stone-500 gap-1">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>{landmark.typicalDuration}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id={`log-visit-btn-${landmark.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onLogVisitForLandmark(landmark);
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 transition-colors"
            >
              {isVisited ? "+ Log Again" : "Log Visit"}
            </button>

            <button
              id={`details-btn-${landmark.id}`}
              onClick={() => onSelectLandmark(landmark)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Insights</span>
              <ChevronRight className="w-3 h-3 text-stone-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
