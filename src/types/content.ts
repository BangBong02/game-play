export interface Word {
  id: number;
  language: string;
  word: string;
  meaning: string;
  rank: number;
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
