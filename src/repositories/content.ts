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
