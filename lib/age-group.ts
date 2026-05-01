export const AGE_GROUP_STORAGE_KEY = "flavia_age_group";
export const AGE_GROUP_CHANGED_EVENT = "flavia:age-group-changed";

export type AgeGroup = "adult" | "teen";

export function readAgeGroup(): AgeGroup | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(AGE_GROUP_STORAGE_KEY);
    return value === "adult" || value === "teen" ? value : null;
  } catch {
    return null;
  }
}

export function writeAgeGroup(value: AgeGroup): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(AGE_GROUP_STORAGE_KEY, value);
    window.dispatchEvent(new Event(AGE_GROUP_CHANGED_EVENT));
  } catch {
    // ignore
  }
}
