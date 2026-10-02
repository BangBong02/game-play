import { learningLanguage } from '../i18n.ts';
import { topics, words } from '../data/content.ts';
import { wordBelongsToLevel, type LevelId, type Progression } from '../config/course.ts';
import type { Topic, Word } from '../types/content';

export interface WordRepository {
  list(language: string, level: LevelId, topic?: string, progression?: Progression): Promise<Word[]>;
}

export interface TopicRepository {
  list(language: string): Promise<Topic[]>;
}

export function filterWords(dataset: Word[], language: string, level: LevelId, topic?: string, progression: Progression = 'cumulative'): Word[] {
  return dataset
    .filter(word => word.language === language && (!topic || word.topics.includes(topic)) && wordBelongsToLevel(word.level, level, progression))
    .sort((a, b) => a.learningRank - b.learningRank);
}

export const wordRepository: WordRepository = {
  async list(language, level, topic, progression) {
    return filterWords(words, language, level, topic, progression);
  },
};

export const topicRepository: TopicRepository = {
  async list(language) {
    return topics.filter(topic => topic.language === language);
  },
};

export function getWordsForProgress(dataset: Word[], { startRank, count, topic }: { startRank: number; count: number; topic?: string }): Word[] {
  if (!Number.isInteger(startRank) || startRank < 1 || !Number.isInteger(count) || count < 1) return [];
  return dataset.filter(word => word.language === learningLanguage && word.learningRank >= startRank && (!topic || topic === 'all' || word.topics.includes(topic)))
    .sort((a, b) => a.learningRank - b.learningRank).slice(0, count);
}
