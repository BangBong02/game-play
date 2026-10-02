import { topics, words } from '../data/content.ts';
import { wordBelongsToLevel, type LevelId } from '../config/course.ts';
import type { Topic, Word } from '../types/content';

export interface WordRepository {
  list(language: string, level: LevelId, topic?: string): Promise<Word[]>;
}

export interface TopicRepository {
  list(language: string): Promise<Topic[]>;
}

export function filterWords(dataset: Word[], language: string, level: LevelId, topic?: string): Word[] {
  return dataset.filter(word => word.language === language && (!topic || word.topics.includes(topic)) && wordBelongsToLevel(word.rank, level));
}

export const wordRepository: WordRepository = {
  async list(language, level, topic) {
    return filterWords(words, language, level, topic);
  },
};

export const topicRepository: TopicRepository = {
  async list(language) {
    return topics.filter(topic => topic.language === language);
  },
};
