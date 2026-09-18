export type USRegion =
  | "Northeast"
  | "Mid-Atlantic"
  | "Southeast"
  | "Midwest"
  | "Southwest"
  | "Rocky Mountains"
  | "Pacific Coast"
  | "Alaska & Hawaii";

export interface Landmark {
  id: string;
  name: string;
  city: string;
  state: string;
  region: USRegion;
  category: string[];
  era: string;
  yearEstablished: string;
  description: string;
  historicalSignificance: string;
  architecturalStyle: string;
  keyHighlights: string[];
  mustSeeArtifact: string;
  imageUrl: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  visitorTips: string;
  typicalDuration: string;
}

export interface TourismVisit {
  id: string;
  date: string; // YYYY-MM-DD
  landmarkId?: string;
  landmarkName: string;
  city: string;
  state: string;
  rating: number; // 1 to 5
  duration: string; // e.g. "1-2 hours", "Half Day", "Full Day"
  companions: "Solo" | "Family" | "Couple" | "Friends" | "Tour Group";
  notes: string;
  favoriteMoment: string;
  historicalTakeaway?: string;
  weather?: "Sunny" | "Overcast" | "Rainy" | "Snowy" | "Crisp Autumn" | "Breezy";
  createdAt: number;
}

export interface UserPreferences {
  state: string;
  city: string;
  lat?: number;
  lng?: number;
  interests: string[];
  travelStyle: string;
  preferredPace: "Relaxed" | "Balanced" | "Intensive";
}

export interface HistoricalDossier {
  title: string;
  era: string;
  foundedYear: string;
  overview: string;
  pivotalEvents: Array<{
    year: string;
    title: string;
    description: string;
  }>;
  keyFigures: Array<{
    name: string;
    role: string;
    impact: string;
  }>;
  architecturalSignificance: string;
  lesserKnownTrivia: string[];
  visitorEtiquetteAndTips?: string;
}

export interface RecommendationItem {
  id?: string;
  name: string;
  city: string;
  state: string;
  historicalEra: string;
  matchScore: number;
  matchReason: string;
  keyHistoricalFact: string;
  recommendedTimeHours: string;
  bestTimeToVisit: string;
  mustSeeFeature: string;
  imageUrl?: string;
  category?: string[];
}

export interface ItineraryPlan {
  title: string;
  subtitle: string;
  estimatedTotalHours: string;
  schedule: Array<{
    timeSlot: string;
    period: string;
    landmark: string;
    action: string;
    historicalNote: string;
    proTip?: string;
  }>;
  insiderAdvice: string;
}
