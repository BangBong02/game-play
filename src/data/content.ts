import type { Topic, Word } from '../types/content';

export const topics: Topic[] = [
  { id: 'animals', language: 'en', name: 'Animals', icon: '🐾', description: 'Meet your furry, feathered & finned friends.', color: 'green' },
  { id: 'food', language: 'en', name: 'Food', icon: '🍓', description: 'A tasty little world of everyday words.', color: 'pink' },
  { id: 'colors', language: 'en', name: 'Colors', icon: '🎨', description: 'Add a splash of color to your vocabulary.', color: 'purple' },
  { id: 'numbers', language: 'en', name: 'Numbers', icon: '🔢', description: 'Make every little number count.', color: 'blue' },
  { id: 'family', language: 'en', name: 'Family', icon: '🏡', description: 'Words for the people closest to you.', color: 'orange' },
  { id: 'days-months', language: 'en', name: 'Days & Months', icon: '🗓️', description: 'A new day, a new word to learn.', color: 'yellow' },
];

// Curriculum levels and teaching order are illustrative, not frequency rankings.
const imageDescriptions: Record<string, string> = {
  dog: 'A brown pet with floppy ears, a round nose and a wagging tail.',
  cat: 'A pet with triangular ears, whiskers and a curled tail.',
  bird: 'A small feathered animal perched on a branch.',
  fish: 'An underwater animal with fins and a forked tail.',
  cow: 'A black-and-white farm animal with horns and an udder.',
  horse: 'A tall brown farm animal with a mane and hooves.',
  chicken: 'A farm bird with a red comb and short beak.',
  duck: 'A yellow water bird with a broad orange bill.',
  rabbit: 'A small animal with long upright ears and a fluffy tail.',
  elephant: 'A large gray animal with big ears, tusks and a long trunk.',
  apple: 'A round red fruit with a stem and a green leaf.',
  bread: 'A golden baked loaf with three cuts across its crust.',
  milk: 'A carton pouring white liquid into a glass.',
  rice: 'A bowl filled with small white grains.',
  red: 'A solid color swatch like a ripe tomato.',
  blue: 'A solid color swatch like a clear daytime sky.',
  green: 'A solid color swatch like fresh leaves.',
  yellow: 'A solid color swatch like bright sunshine.',
  banana: 'A curved yellow fruit with a peeled end.',
  egg: 'An oval white shell beside a cracked shell and a golden yolk.',
};

export const words: Word[] = ([
  // Explicit IDs preserve the question IDs in existing localStorage rounds.
  // Keep each ID when spelling, order or curriculum metadata changes.
  { id: 'en-1', language: 'en', word: 'dog', meaning: 'Con chó', level: 'easy', learningRank: 1, topics: ['animals'] },
  { id: 'en-2', language: 'en', word: 'cat', meaning: 'Con mèo', level: 'easy', learningRank: 2, topics: ['animals'] },
  { id: 'en-3', language: 'en', word: 'bird', meaning: 'Con chim', level: 'easy', learningRank: 3, topics: ['animals'] },
  { id: 'en-4', language: 'en', word: 'fish', meaning: 'Con cá', level: 'easy', learningRank: 8, topics: ['animals'] },
  { id: 'en-5', language: 'en', word: 'cow', meaning: 'Con bò', level: 'easy', learningRank: 9, topics: ['animals'] },
  { id: 'en-6', language: 'en', word: 'horse', meaning: 'Con ngựa', level: 'medium', learningRank: 301, topics: ['animals'] },
  { id: 'en-7', language: 'en', word: 'chicken', meaning: 'Con gà', level: 'easy', learningRank: 11, topics: ['animals', 'food'] },
  { id: 'en-8', language: 'en', word: 'duck', meaning: 'Con vịt', level: 'medium', learningRank: 304, topics: ['animals'] },
  { id: 'en-9', language: 'en', word: 'rabbit', meaning: 'Con thỏ', level: 'medium', learningRank: 306, topics: ['animals'] },
  { id: 'en-10', language: 'en', word: 'elephant', meaning: 'Con voi', level: 'hard', learningRank: 1201, topics: ['animals'] },
  { id: 'en-11', language: 'en', word: 'apple', meaning: 'Quả táo', level: 'easy', learningRank: 4, topics: ['food'] },
  { id: 'en-12', language: 'en', word: 'bread', meaning: 'Bánh mì', level: 'easy', learningRank: 5, topics: ['food'] },
  { id: 'en-13', language: 'en', word: 'milk', meaning: 'Sữa', level: 'easy', learningRank: 6, topics: ['food'] },
  { id: 'en-14', language: 'en', word: 'rice', meaning: 'Cơm / gạo', level: 'easy', learningRank: 7, topics: ['food'] },
  { id: 'en-15', language: 'en', word: 'red', meaning: 'Màu đỏ', level: 'medium', learningRank: 302, topics: ['colors'] },
  { id: 'en-16', language: 'en', word: 'blue', meaning: 'Màu xanh dương', level: 'medium', learningRank: 303, topics: ['colors'] },
  { id: 'en-17', language: 'en', word: 'green', meaning: 'Màu xanh lá', level: 'medium', learningRank: 307, topics: ['colors'] },
  { id: 'en-18', language: 'en', word: 'yellow', meaning: 'Màu vàng', level: 'hard', learningRank: 1202, topics: ['colors'] },
  { id: 'en-19', language: 'en', word: 'banana', meaning: 'Quả chuối', level: 'medium', learningRank: 305, topics: ['food'] },
  { id: 'en-20', language: 'en', word: 'egg', meaning: 'Quả trứng', level: 'easy', learningRank: 10, topics: ['food'] },
] satisfies Word[]).map(word => ({ ...word, visual: true, imageUrl: `/images/vocabulary/${word.word}.svg`, imageAlt: imageDescriptions[word.word] }));
