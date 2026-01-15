/**
 * Storage layer for persisting incident and user data.
 * 
 * Uses localStorage when available, with an in-memory fallback for
 * environments where localStorage is not accessible (e.g., jsdom tests).
 * 
 * Data is automatically seeded with defaults on first access.
 */

import type { Incident, User } from "./types";
import { defaultIncidents, defaultUsers } from "./seedData";

/** localStorage key for incidents data */
const STORAGE_KEY_INCIDENTS = "incidents";
/** localStorage key for users data */
const STORAGE_KEY_USERS = "users";

/** In-memory storage fallback for when localStorage isn't available */
let memoryIncidents: Incident[] | null = null;
let memoryUsers: User[] | null = null;

/**
 * Checks if localStorage is available and functional.
 * Some environments (like jsdom in tests) may have localStorage
 * that throws errors on access.
 * 
 * @returns true if localStorage can be used, false otherwise
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/** Cached result of localStorage availability check */
const useLocalStorage = isLocalStorageAvailable();

/**
 * Loads data from storage (localStorage or memory fallback).
 * Returns a deep copy of default data if no stored data exists.
 * 
 * @typeParam T - The type of data being loaded
 * @param key - Storage key to load from
 * @param defaultValue - Default value if no data exists
 * @param memoryValue - Current in-memory value (for fallback mode)
 * @returns The loaded data or a deep copy of defaults
 */
function loadFromStorage<T>(key: string, defaultValue: T, memoryValue: T | null): T {
  if (useLocalStorage) {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored) as T;
      }
    } catch (error) {
      console.error(`Failed to load ${key} from storage:`, error);
    }
  } else if (memoryValue !== null) {
    return memoryValue;
  }
  // Return a deep copy of default to prevent mutation
  return JSON.parse(JSON.stringify(defaultValue)) as T;
}

/**
 * Saves data to storage (localStorage or memory fallback).
 * 
 * @typeParam T - The type of data being saved
 * @param key - Storage key to save to
 * @param data - Data to save
 * @param setMemory - Function to update memory fallback
 */
function saveToStorage<T>(key: string, data: T, setMemory: (val: T) => void): void {
  if (useLocalStorage) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save ${key} to storage:`, error);
    }
  } else {
    setMemory(data);
  }
}

/**
 * Retrieves all incidents from storage.
 * @returns Array of incidents
 */
export function getIncidents(): Incident[] {
  return loadFromStorage(STORAGE_KEY_INCIDENTS, defaultIncidents, memoryIncidents);
}

/**
 * Saves incidents to storage.
 * @param incidents - Array of incidents to save
 */
export function setIncidents(incidents: Incident[]): void {
  saveToStorage(STORAGE_KEY_INCIDENTS, incidents, (val) => { memoryIncidents = val; });
}

/**
 * Retrieves all users from storage.
 * @returns Array of users
 */
export function getUsers(): User[] {
  return loadFromStorage(STORAGE_KEY_USERS, defaultUsers, memoryUsers);
}

/**
 * Saves users to storage.
 * @param users - Array of users to save
 */
export function setUsers(users: User[]): void {
  saveToStorage(STORAGE_KEY_USERS, users, (val) => { memoryUsers = val; });
}

/**
 * Resets all data to default values.
 * Clears both localStorage and memory storage.
 * Useful for testing or resetting the application state.
 */
export function resetData(): void {
  if (useLocalStorage) {
    localStorage.removeItem(STORAGE_KEY_INCIDENTS);
    localStorage.removeItem(STORAGE_KEY_USERS);
  }
  memoryIncidents = null;
  memoryUsers = null;
}
