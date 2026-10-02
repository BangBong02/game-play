import { topics, words } from '../data/content';
import { wordBelongsToLevel, type LevelId } from '../config/course';
import type { Topic, Word } from '../types/content';

export interface WordRepository {
  list(language: string, level: LevelId, topic: string): Promise<Word[]>;
}

export interface TopicRepository {
  list(language: string): Promise<Topic[]>;
}

export const wordRepository: WordRepository = {
  async list(language, level, topic) {
    return words.filter(word => word.language === language && word.topics.includes(topic) && wordBelongsToLevel(word.rank, level));
  },
};

export const topicRepository: TopicRepository = {
  async list(language) {
    return topics.filter(topic => topic.language === language);
  },
};
