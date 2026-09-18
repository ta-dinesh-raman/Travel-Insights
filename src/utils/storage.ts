import { TourismVisit, UserPreferences } from "../types";

const VISITS_STORAGE_KEY = "us_heritage_tourism_visits_v1";
const PREFS_STORAGE_KEY = "us_heritage_user_prefs_v1";

export const DEFAULT_PREFERENCES: UserPreferences = {
  state: "Pennsylvania",
  city: "Philadelphia",
  interests: ["Revolutionary & Independence", "Architecture, Bridges & Engineering", "National Parks & Wilderness"],
  travelStyle: "Cultural Enthusiast",
  preferredPace: "Balanced"
};

export const INITIAL_SAMPLE_VISITS: TourismVisit[] = [
  {
    id: "sample-visit-1",
    date: "2026-09-14",
    landmarkId: "independence-hall",
    landmarkName: "Independence Hall & Liberty Bell",
    city: "Philadelphia",
    state: "Pennsylvania",
    rating: 5,
    duration: "Half Day",
    companions: "Family",
    notes: "Remarkable experience standing in the very Assembly Room where the Declaration of Independence was debated. The wood detail and original Rising Sun chair gave chills.",
    favoriteMoment: "Seeing the hairline crack in the Liberty Bell up close and reading the Leviticus inscription.",
    historicalTakeaway: "56 men literally risked treason against King George III when signing their names.",
    weather: "Sunny",
    createdAt: Date.now() - 4 * 86400000
  },
  {
    id: "sample-visit-2",
    date: "2026-09-17",
    landmarkId: "gettysburg-battlefield",
    landmarkName: "Gettysburg National Military Park",
    city: "Gettysburg",
    state: "Pennsylvania",
    rating: 5,
    duration: "Full Day",
    companions: "Couple",
    notes: "Toured Little Round Top and walked across the field of Pickett's Charge. The massive Cyclorama painting in the visitor center was astonishingly immersive.",
    favoriteMoment: "Standing on the crest of Cemetery Ridge at sunset, reflecting on Lincoln's address.",
    historicalTakeaway: "Over 51,000 casualties occurred across three days that altered American history forever.",
    weather: "Crisp Autumn",
    createdAt: Date.now() - 1 * 86400000
  }
];

export function getStoredVisits(): TourismVisit[] {
  try {
    const data = localStorage.getItem(VISITS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(VISITS_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_VISITS));
      return INITIAL_SAMPLE_VISITS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_SAMPLE_VISITS;
  }
}

export function saveStoredVisits(visits: TourismVisit[]): void {
  try {
    localStorage.setItem(VISITS_STORAGE_KEY, JSON.stringify(visits));
  } catch (err) {
    console.error("Failed to save visits to localStorage", err);
  }
}

export function getStoredPreferences(): UserPreferences {
  try {
    const data = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!data) {
      return DEFAULT_PREFERENCES;
    }
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(data) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveStoredPreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch (err) {
    console.error("Failed to save preferences to localStorage", err);
  }
}
