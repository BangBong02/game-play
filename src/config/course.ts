// Curriculum metadata stays available for data validation and old progress migration.
export const levels = [
  { id: 'easy', targetWordCount: 300 },
  { id: 'medium', targetWordCount: 1200 },
  { id: 'hard', targetWordCount: 3000 },
] as const;

export type LevelId = typeof levels[number]['id'];
export type Progression = 'cumulative' | 'new-only';

export function wordBelongsToLevel(wordLevel: LevelId, level: LevelId, progression: Progression = 'cumulative'): boolean {
  if (progression === 'new-only') return wordLevel === level;
  const index = levels.findIndex(item => item.id === level);
  return levels.slice(0, index + 1).some(item => item.id === wordLevel);
}

export function coursePath(locale: string, ...segments: string[]): string {
  return '/' + [locale, ...segments].map(encodeURIComponent).join('/');
}
