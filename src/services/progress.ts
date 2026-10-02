import type { GameState } from '../game/multiple-choice';

export interface ProgressKey {
  language: string;
  level: string;
  topic: string;
}

export interface SavedProgress extends ProgressKey {
  state: GameState;
  signature: string;
  completed: number;
  total: number;
  score: number;
  updatedAt: string;
}

export interface ProgressStore {
  get(key: ProgressKey): unknown;
  save(progress: SavedProgress): boolean;
}

const storageKey = (key: ProgressKey) => `lingoplay:v1:${key.language}:${key.level}:${key.topic}`;

export const progressStore: ProgressStore = {
  get(key) {
    try {
      const value = localStorage.getItem(storageKey(key));
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },
  save(progress) {
    try {
      localStorage.setItem(storageKey(progress), JSON.stringify(progress));
      return true;
    } catch {
      return false;
    }
  },
};
