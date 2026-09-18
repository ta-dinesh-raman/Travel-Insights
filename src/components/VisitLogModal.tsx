import React, { useState, useEffect } from "react";
import { TourismVisit, Landmark } from "../types";
import { US_LANDMARKS, US_STATES } from "../data/landmarks";
import { X, Star, Calendar, MapPin, Clock, Users, Sun, Heart, Award, Check } from "lucide-react";

interface VisitLogModalProps {
  isOpen: boolean;
  preselectedLandmark?: Landmark | null;
  onClose: () => void;
  onSaveVisit: (visit: TourismVisit) => void;
}

export const VisitLogModal: React.FC<VisitLogModalProps> = ({
  isOpen,
  preselectedLandmark,
  onClose,
  onSaveVisit,
}) => {
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string>("");
  const [landmarkName, setLandmarkName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Pennsylvania");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [rating, setRating] = useState(5);
  const [duration, setDuration] = useState("Half Day");
  const [companions, setCompanions] = useState<TourismVisit["companions"]>("Solo");
  const [weather, setWeather] = useState<TourismVisit["weather"]>("Sunny");
  const [notes, setNotes] = useState("");
  const [favoriteMoment, setFavoriteMoment] = useState("");
  const [historicalTakeaway, setHistoricalTakeaway] = useState("");

  useEffect(() => {
    if (preselectedLandmark) {
      setSelectedLandmarkId(preselectedLandmark.id);
      setLandmarkName(preselectedLandmark.name);
      setCity(preselectedLandmark.city);
      setState(preselectedLandmark.state);
      setFavoriteMoment(preselectedLandmark.mustSeeArtifact);
    } else if (isOpen && !selectedLandmarkId) {
      // Default to first landmark
      const first = US_LANDMARKS[0];
      setSelectedLandmarkId(first.id);
      setLandmarkName(first.name);
      setCity(first.city);
      setState(first.state);
    }
  }, [preselectedLandmark, isOpen]);

  const handleLandmarkSelectChange = (id: string) => {
    setSelectedLandmarkId(id);
    if (id === "custom") {
      setLandmarkName("");
      setCity("");
      setFavoriteMoment("");
      return;
    }
    const found = US_LANDMARKS.find((l) => l.id === id);
    if (found) {
      setLandmarkName(found.name);
      setCity(found.city);
      setState(found.state);
      if (!favoriteMoment) {
        setFavoriteMoment(found.mustSeeArtifact);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!landmarkName.trim() || !city.trim() || !state) {
      alert("Please provide the landmark name, city, and state.");
      return;
    }

    const newVisit: TourismVisit = {
      id: "visit-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      date,
      landmarkId: selectedLandmarkId !== "custom" ? selectedLandmarkId : undefined,
      landmarkName: landmarkName.trim(),
      city: city.trim(),
      state: state.trim(),
      rating,
      duration,
      companions,
      weather,
      notes: notes.trim(),
      favoriteMoment: favoriteMoment.trim(),
      historicalTakeaway: historicalTakeaway.trim(),
      createdAt: Date.now(),
    };

    onSaveVisit(newVisit);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-sm overflow-y-auto">
      <div
        id="log-visit-modal-container"
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-6 max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 px-5 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div>
            <h3 className="text-lg font-bold font-serif-display text-white">
              Log Daily Tourism Visit
            </h3>
            <p className="text-xs text-stone-400">
              Record memories, ratings, and historical discoveries from your journey
            </p>
          </div>
          <button
            id="close-log-visit-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-stone-800 flex-1">
          {/* Landmark Selection / Custom */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-700">
              Select US Destination
            </label>
            <select
              value={selectedLandmarkId}
              onChange={(e) => handleLandmarkSelectChange(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <optgroup label="Iconic US Historic Landmarks">
                {US_LANDMARKS.map((lm) => (
                  <option key={lm.id} value={lm.id}>
                    {lm.name} ({lm.city}, {lm.state})
                  </option>
                ))}
              </optgroup>
              <option value="custom">-- Enter Another Historic Place / Custom Landmark --</option>
            </select>
          </div>

          {/* Place Name and Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1 space-y-1">
              <label className="text-xs font-semibold text-stone-700">Landmark Name</label>
              <input
                type="text"
                required
                value={landmarkName}
                onChange={(e) => setLandmarkName(e.target.value)}
                placeholder="e.g. Independence Hall"
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Philadelphia"
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {US_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date, Duration & Companions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                Date Visited
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                Duration Spent
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="1-2 hours">1-2 hours</option>
                <option value="Half Day">Half Day (3-4 hours)</option>
                <option value="Full Day">Full Day (5+ hours)</option>
                <option value="Multi-Day">Multi-Day Exploration</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-stone-500" />
                Travel Companions
              </label>
              <select
                value={companions}
                onChange={(e) => setCompanions(e.target.value as any)}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Solo">Solo Traveler</option>
                <option value="Family">Family</option>
                <option value="Couple">Couple</option>
                <option value="Friends">Friends</option>
                <option value="Tour Group">Tour Group</option>
              </select>
            </div>
          </div>

          {/* Rating & Weather */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">Experience Rating</label>
              <div className="flex items-center gap-2">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-stone-300 hover:text-amber-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-stone-600">
                  {rating === 5 ? "Exceptional" : rating === 4 ? "Great" : rating === 3 ? "Good" : "Fair"}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-stone-500" />
                Weather / Atmosphere
              </label>
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value as any)}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Sunny">Sunny & Clear</option>
                <option value="Crisp Autumn">Crisp Autumn</option>
                <option value="Breezy">Breezy / Coastal</option>
                <option value="Overcast">Overcast / Dramatic</option>
                <option value="Rainy">Rainy</option>
                <option value="Snowy">Snowy / Winter</option>
              </select>
            </div>
          </div>

          {/* Favorite Feature & Historical Takeaway */}
          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                Highlight / Favorite Artifact Seen
              </label>
              <input
                type="text"
                value={favoriteMoment}
                onChange={(e) => setFavoriteMoment(e.target.value)}
                placeholder="e.g. The original Liberty Bell crack or Washington's Rising Sun chair"
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                Key Historical Takeaway / Learning
              </label>
              <input
                type="text"
                value={historicalTakeaway}
                onChange={(e) => setHistoricalTakeaway(e.target.value)}
                placeholder="e.g. Learned how 56 delegates risked execution for signing the declaration"
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Travel Notes & Impressions */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">
                Personal Travel Journal Notes & Impressions
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe your thoughts, feelings, tours taken, advice for future visitors..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-visit-submit-btn"
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-sm shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Visit to Travel Log</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
