import { learningLanguage } from '../i18n.ts';
import { isWordEligible, type WordActivity } from '../game/eligibility.ts';
import type { Word } from '../types/content';

interface ProgressQuery { startRank: number; count: number; topic?: string }
// Omit count to load the eligible pool; a playing round explicitly requests up to 10.
export interface WordGameQuery { game: WordActivity; startRank: number; count?: number; topic?: string }

export function getWordsForProgress(dataset: Word[], { startRank, count, topic }: ProgressQuery): Word[] {
  if (!Number.isInteger(startRank) || startRank < 1 || !Number.isInteger(count) || count < 1) return [];
  return dataset.filter(word => word.language === learningLanguage && word.learningRank >= startRank && (!topic || topic === 'all' || word.topics.includes(topic)))
    .sort((a, b) => a.learningRank - b.learningRank).slice(0, count);
}

// Pure query shared by the source repository and the already-loaded React pool.
export function getWordsForGame(dataset: Word[], query: WordGameQuery): Word[] {
  const eligible = dataset.filter(word => isWordEligible(word, query.game));
  return getWordsForProgress(eligible, { ...query, count: query.count ?? eligible.length });
}
