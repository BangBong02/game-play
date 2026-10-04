import type { Word } from '../types/content';
import type { GameMode } from './vocabulary';

// The generic listening alias and Listen/Word remain eligibility rules, not playable games.
export type WordActivity = GameMode | 'listening' | 'listen-to-word';

// Content supplies URLs; games do not infer filenames, extensions or storage providers.
export function isMediaUrl(url: string | undefined): boolean {
  if (typeof url !== 'string' || !url || /[\s\\]/.test(url)) return false;
  if (url.startsWith('/') && !url.startsWith('//')) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && !parsed.username && !parsed.password;
  } catch { return false; }
}

export function isWordEligible(word: Word, activity: WordActivity): boolean {
  if (!word.word.trim() || !word.meaning.trim()) return false;
  if (activity === 'listening' || activity === 'listen-to-word') return isMediaUrl(word.audioUrl);
  if (activity === 'image-to-word' || activity === 'image-match' || activity === 'listen-to-image') {
    return isMediaUrl(word.imageUrl) && !!word.imageAlt?.trim() &&
      (activity === 'image-to-word' ? word.visual !== false : word.visual === true) &&
      (activity !== 'listen-to-image' || isMediaUrl(word.audioUrl));
  }
  return true;
}
