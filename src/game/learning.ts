import type { Word } from '../types/content';

const hour = 60 * 60 * 1000;
export const reviewIntervals = { wrong: 5 * hour, correct: [24 * hour, 7 * 24 * hour, 60 * 24 * hour] } as const;
export type Practice = 'study' | 'review' | 'free';
export type LearningStatus = 'unseen' | 'learning' | 'correct' | 'review' | 'mastered';
export interface WordMemory {
  successes: number;
  lastCorrectDay?: string;
  dueAt: number;
  lastAttemptAt: number;
  lastOutcome: boolean;
  lastAttemptId: string;
}
export interface LearningMemory { version: 1; words: Record<string, WordMemory> }
export const emptyMemory = (): LearningMemory => ({ version: 1, words: {} });
export const isMastered = (word: WordMemory | undefined) => !!word && word.successes === 3 && word.lastOutcome;
export function learningStatus(word: WordMemory | undefined, now: number): LearningStatus {
  if (!word) return 'unseen';
  if (word.dueAt <= now) return 'review';
  if (isMastered(word)) return 'mastered';
  return word.lastOutcome && word.successes > 0 ? 'correct' : 'learning';
}

// Injected time keeps scheduling testable. UTC days are used consistently on every device.
export function recordAttempt(memory: LearningMemory, id: string, correct: boolean, now: number, attemptId: string): LearningMemory {
  if (!id.trim() || !attemptId.trim() || !Number.isSafeInteger(now) || now < 0 || now > 8.64e15 - reviewIntervals.correct[2]) return memory;
  const old = Object.hasOwn(memory.words, id) ? memory.words[id] : undefined;
  if (old && (old.lastAttemptId === attemptId || now < old.lastAttemptAt)) return memory;
  const day = new Date(now).toISOString().slice(0, 10);
  const credit = correct && old?.lastCorrectDay !== day && (!old || old.dueAt <= now);
  const successes = correct ? Math.min(3, (old?.successes ?? 0) + Number(credit)) : 0;
  const dueAt = !correct ? now + reviewIntervals.wrong : credit ? now + reviewIntervals.correct[Math.max(0, successes - 1)] : old && old.dueAt > now ? old.dueAt : now + reviewIntervals.correct[Math.max(0, successes - 1)];
  return { version: 1, words: { ...memory.words, [id]: { successes, ...(credit ? { lastCorrectDay: day } : old?.lastCorrectDay ? { lastCorrectDay: old.lastCorrectDay } : {}), dueAt, lastAttemptAt: now, lastOutcome: correct, lastAttemptId: attemptId } } };
}

export function selectLearningWords(words: Word[], memory: LearningMemory, now: number, count = 10, practice: Practice = 'study'): Word[] {
  if (!Number.isInteger(count) || count < 1) return [];
  const ranked = words.filter(word => practice === 'free' || word.curriculum !== 'supplemental').sort((a, b) => a.learningRank - b.learningRank);
  if (practice === 'free') return ranked.slice(0, count);
  const due = ranked.filter(word => Object.hasOwn(memory.words, word.id) && memory.words[word.id].dueAt <= now).sort((a, b) => memory.words[a.id].dueAt - memory.words[b.id].dueAt || a.learningRank - b.learningRank);
  const unseen = practice === 'review' ? [] : ranked.filter(word => !Object.hasOwn(memory.words, word.id));
  return [...due, ...unseen].slice(0, count);
}

export function learningCounts(words: Pick<Word, 'id'>[], memory: LearningMemory, now: number) {
  const unique = [...new Map(words.map(word => [word.id, word])).values()];
  const statuses: Record<LearningStatus, number> = { unseen: 0, learning: 0, correct: 0, review: 0, mastered: 0 };
  for (const word of unique) statuses[learningStatus(Object.hasOwn(memory.words, word.id) ? memory.words[word.id] : undefined, now)]++;
  const mastered = unique.filter(word => Object.hasOwn(memory.words, word.id) && isMastered(memory.words[word.id])).length;
  return { total: unique.length, mastered, complete: unique.length > 0 && mastered === unique.length, statuses };
}
