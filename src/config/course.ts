export const languages = [{ id: 'en', name: 'English', flag: '🇬🇧' }];

export const levels = [
  { id: 'easy', name: 'Easy', maxRank: 300, subtitle: '300 essential words', description: 'Start with everyday English', detail: 'Small steps. A strong foundation.', color: 'green', icon: 'sprout' },
  { id: 'medium', name: 'Medium', maxRank: 1200, subtitle: '1,200 common words', description: 'Build everyday communication', detail: 'More words. More possibilities.', color: 'orange', icon: 'plant' },
  { id: 'hard', name: 'Hard', maxRank: 3000, subtitle: '3,000 words', description: 'Advanced learning and academic vocabulary', detail: 'Grow beyond the everyday.', color: 'purple', icon: 'tree' },
] as const;

export type LevelId = typeof levels[number]['id'];
export type Progression = 'cumulative' | 'new-only';

export function getLevelRankRange(level: LevelId, progression: Progression = 'cumulative') {
  const index = levels.findIndex(item => item.id === level);
  return {
    minRank: progression === 'new-only' && index > 0 ? levels[index - 1].maxRank + 1 : 1,
    maxRank: levels[index].maxRank,
  };
}

export const skills = [
  { id: 'vocabulary', name: 'Vocabulary', icon: '🧩', description: 'Make new words stick, one game at a time.', available: true },
  { id: 'listening', name: 'Listening', icon: '🎧', description: 'Tune your ears to a new language.', available: false },
  { id: 'grammar', name: 'Grammar', icon: '✏️', description: 'Discover how words work together.', available: false },
  { id: 'reading', name: 'Reading', icon: '📖', description: 'Find a little adventure in every sentence.', available: false },
  { id: 'writing', name: 'Writing', icon: '💬', description: 'Turn your thoughts into words.', available: false },
];

export function wordBelongsToLevel(rank: number, level: LevelId, progression: Progression = 'cumulative'): boolean {
  const { minRank, maxRank } = getLevelRankRange(level, progression);
  return Number.isInteger(rank) && rank >= minRank && rank <= maxRank;
}

export function coursePath(language: string, ...segments: string[]): string {
  return '/' + [language, ...segments].map(encodeURIComponent).join('/');
}
