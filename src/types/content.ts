import type { LevelId } from '../config/course';

export interface Word {
  id: string;
  language: string;
  word: string;
  meaning: string;
  level: LevelId;
  learningRank: number;
  frequencyRank?: number;
  phonetic?: string;
  partOfSpeech?: string;
  example?: string;
  imageUrl?: string;
  imageAlt?: string;
  audioUrl?: string;
  visual?: boolean;
  topics: string[];
}

export interface Topic {
  id: string;
  language: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}
