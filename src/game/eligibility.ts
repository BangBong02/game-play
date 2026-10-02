import type { Word } from '../types/content';
import type { GameMode } from './vocabulary';

// Future activities are eligibility rules only, not playable game modes.
export type WordActivity = GameMode | 'image-match' | 'listening';
export const isLocalImage = (url: string) => /^\/images\/vocabulary\/[a-z0-9-]+\.svg$/.test(url);

export function isWordEligible(word: Word, activity: WordActivity): boolean {
  if (!word.word.trim() || !word.meaning.trim()) return false;
  if (activity === 'listening') return !!word.audioUrl?.trim();
  if (activity === 'image-to-word' || activity === 'image-match') {
    return !!word.imageUrl && isLocalImage(word.imageUrl) && !!word.imageAlt?.trim() &&
      (activity === 'image-match' ? word.visual === true : word.visual !== false);
  }
  return true;
}
