import type { GameMode } from '../game/vocabulary.ts';
import type { Locale } from '../i18n.ts';
export type GameSkill = 'vocabulary' | 'spelling';
export interface GameDefinition {
  id: GameMode; slug: string; title: Record<Locale, string>; description: Record<Locale, string>;
  skills: GameSkill[]; status: 'available' | 'coming-soon'; order: number; color: string; preview: string; previewCaption: string;
}
export const games: GameDefinition[] = [
  { id: 'word-to-meaning', slug: 'word-match', title: { en: 'Word Match', vi: 'Ghép nghĩa' }, description: { en: 'Match English words with their meanings.', vi: 'Ghép từ tiếng Anh với nghĩa đúng.' }, skills: ['vocabulary'], status: 'available', order: 1, color: 'green', preview: 'dog', previewCaption: 'dog → con chó' },
  { id: 'meaning-to-word', slug: 'find-the-word', title: { en: 'Find the Word', vi: 'Tìm từ' }, description: { en: 'Read the meaning. Find the English word.', vi: 'Đọc nghĩa và tìm từ tiếng Anh.' }, skills: ['vocabulary'], status: 'available', order: 2, color: 'purple', preview: 'apple', previewCaption: 'quả táo → apple' },
  { id: 'image-to-word', slug: 'picture-pick', title: { en: 'Picture Pick', vi: 'Nhìn hình đoán từ' }, description: { en: 'Look at the picture and pick a word.', vi: 'Nhìn hình và chọn từ phù hợp.' }, skills: ['vocabulary'], status: 'available', order: 3, color: 'orange', preview: 'cat', previewCaption: 'cat · dog · bird' },
  { id: 'type-the-word', slug: 'spell-the-word', title: { en: 'Spell the Word', vi: 'Đánh vần' }, description: { en: 'Recall and type the English word.', vi: 'Nhớ và gõ đúng từ tiếng Anh.' }, skills: ['vocabulary', 'spelling'], status: 'available', order: 4, color: 'blue', preview: 'bird', previewCaption: 'b _ r d' },
];
export function getGames(skill: GameSkill | 'all' = 'all', registry = games): GameDefinition[] {
  return registry.filter(game => game.status === 'available' && (skill === 'all' || game.skills.includes(skill))).sort((a, b) => a.order - b.order);
}
export const gameSkills = [...new Set(getGames().flatMap(game => game.skills))];
