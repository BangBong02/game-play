import type { Topic, Word } from '../types/content';

export const topics: Topic[] = [
  { id: 'animals', language: 'en', name: 'Animals', icon: '🐾', description: 'Meet your furry, feathered & finned friends.', color: 'green' },
  { id: 'food', language: 'en', name: 'Food', icon: '🍓', description: 'A tasty little world of everyday words.', color: 'pink' },
  { id: 'colors', language: 'en', name: 'Colors', icon: '🎨', description: 'Add a splash of color to your vocabulary.', color: 'purple' },
  { id: 'numbers', language: 'en', name: 'Numbers', icon: '🔢', description: 'Make every little number count.', color: 'blue' },
  { id: 'family', language: 'en', name: 'Family', icon: '🏡', description: 'Words for the people closest to you.', color: 'orange' },
  { id: 'days-months', language: 'en', name: 'Days & Months', icon: '🗓️', description: 'A new day, a new word to learn.', color: 'yellow' },
];

// Demo ranks illustrate the level filter; they are not researched frequency rankings.
export const words: Word[] = [
  { id: 1, language: 'en', word: 'dog', meaning: 'Con chó', rank: 10, topics: ['animals'] },
  { id: 2, language: 'en', word: 'cat', meaning: 'Con mèo', rank: 20, topics: ['animals'] },
  { id: 3, language: 'en', word: 'bird', meaning: 'Con chim', rank: 30, topics: ['animals'] },
  { id: 4, language: 'en', word: 'fish', meaning: 'Con cá', rank: 40, topics: ['animals'] },
  { id: 5, language: 'en', word: 'cow', meaning: 'Con bò', rank: 50, topics: ['animals'] },
  { id: 6, language: 'en', word: 'horse', meaning: 'Con ngựa', rank: 60, topics: ['animals'] },
  { id: 7, language: 'en', word: 'chicken', meaning: 'Con gà', rank: 70, topics: ['animals'] },
  { id: 8, language: 'en', word: 'duck', meaning: 'Con vịt', rank: 80, topics: ['animals'] },
  { id: 9, language: 'en', word: 'rabbit', meaning: 'Con thỏ', rank: 90, topics: ['animals'] },
  { id: 10, language: 'en', word: 'elephant', meaning: 'Con voi', rank: 100, topics: ['animals'] },
  { id: 11, language: 'en', word: 'apple', meaning: 'Quả táo', rank: 110, topics: ['food'] },
  { id: 12, language: 'en', word: 'bread', meaning: 'Bánh mì', rank: 120, topics: ['food'] },
  { id: 13, language: 'en', word: 'milk', meaning: 'Sữa', rank: 130, topics: ['food'] },
  { id: 14, language: 'en', word: 'rice', meaning: 'Cơm / gạo', rank: 140, topics: ['food'] },
  { id: 15, language: 'en', word: 'red', meaning: 'Màu đỏ', rank: 150, topics: ['colors'] },
  { id: 16, language: 'en', word: 'blue', meaning: 'Màu xanh dương', rank: 160, topics: ['colors'] },
  { id: 17, language: 'en', word: 'green', meaning: 'Màu xanh lá', rank: 170, topics: ['colors'] },
  { id: 18, language: 'en', word: 'yellow', meaning: 'Màu vàng', rank: 180, topics: ['colors'] },
];
