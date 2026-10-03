import type { Topic, Word } from '../types/content';

export const topics: Topic[] = [
  { priority: 12, id: 'animals', language: 'en', name: 'Animals', icon: '🐾', description: 'Meet your furry, feathered & finned friends.', color: 'green' },
  { priority: 1, id: 'food', language: 'en', name: 'Food', icon: '🍓', description: 'A tasty little world of everyday words.', color: 'pink' },
  { priority: 13, id: 'colors', language: 'en', name: 'Colors', icon: '🎨', description: 'Add a splash of color to your vocabulary.', color: 'purple' },
  { priority: 10, id: 'numbers', language: 'en', name: 'Numbers', icon: '🔢', description: 'Make every little number count.', color: 'blue' },
  { priority: 2, id: 'family', language: 'en', name: 'Family', icon: '🏡', description: 'Words for the people closest to you.', color: 'orange' },
  { priority: 14, id: 'days-months', language: 'en', name: 'Days & Months', icon: '🗓️', description: 'A new day, a new word to learn.', color: 'yellow' },
  {"priority": 3, "id": "home", "language": "en", "name": "Home", "icon": "🏠", "description": "Everyday objects around your home.", "color": "green"},
  {"priority": 4, "id": "school", "language": "en", "name": "School", "icon": "📚", "description": "Useful words for class and study.", "color": "blue"},
  {"priority": 5, "id": "daily-life", "language": "en", "name": "Daily life", "icon": "☀️", "description": "Words for everyday activities.", "color": "orange"},
  {"priority": 6, "id": "body", "language": "en", "name": "Body", "icon": "✋", "description": "Get to know words for the body.", "color": "pink"},
  {"priority": 7, "id": "clothing", "language": "en", "name": "Clothing", "icon": "👕", "description": "Words for what you wear.", "color": "purple"},
  {"priority": 8, "id": "transport", "language": "en", "name": "Travel", "icon": "🚌", "description": "Getting from one place to another.", "color": "yellow"},
  {"priority": 9, "id": "time", "language": "en", "name": "Time", "icon": "🕓", "description": "Make time for everyday English.", "color": "blue"},
  {"priority": 11, "id": "weather", "language": "en", "name": "Weather", "icon": "🌤️", "description": "Talk about the sky and the weather.", "color": "orange"},
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

const illustratedWords: Word[] = ([
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

// Independently authored meanings/examples; membership checked against Oxford 3000.
const addedWords: Word[] = [
  {"id": "en-21", "language": "en", "word": "water", "meaning": "Nước", "level": "easy", "learningRank": 21, "topics": ["food"], "partOfSpeech": "noun", "example": "Please drink some water.", "visual": false},
  {"id": "en-22", "language": "en", "word": "tea", "meaning": "Trà", "level": "easy", "learningRank": 22, "topics": ["food"], "partOfSpeech": "noun", "example": "I drink tea in the morning.", "visual": false},
  {"id": "en-23", "language": "en", "word": "coffee", "meaning": "Cà phê", "level": "easy", "learningRank": 23, "topics": ["food"], "partOfSpeech": "noun", "example": "This coffee is hot.", "visual": false},
  {"id": "en-24", "language": "en", "word": "book", "meaning": "Quyển sách", "level": "easy", "learningRank": 24, "topics": ["school"], "partOfSpeech": "noun", "example": "This book has a blue cover.", "visual": true, "imageUrl": "/media/images/vocabulary/book.webp", "imageAlt": "An open book with two pages and a green cover."},
  {"id": "en-25", "language": "en", "word": "pen", "meaning": "Bút mực", "level": "easy", "learningRank": 25, "topics": ["school"], "partOfSpeech": "noun", "example": "May I borrow your pen?", "visual": true, "imageUrl": "/media/images/vocabulary/pen.webp", "imageAlt": "A blue writing pen with a pointed tip."},
  {"id": "en-26", "language": "en", "word": "bag", "meaning": "Túi / cặp", "level": "easy", "learningRank": 26, "topics": ["school"], "partOfSpeech": "noun", "example": "My book is in the bag.", "visual": true, "imageUrl": "/media/images/vocabulary/bag.webp", "imageAlt": "A blue backpack with a handle and front pocket."},
  {"id": "en-27", "language": "en", "word": "bed", "meaning": "Giường", "level": "easy", "learningRank": 27, "topics": ["home"], "partOfSpeech": "noun", "example": "The cat sleeps on the bed.", "visual": true, "imageUrl": "/media/images/vocabulary/bed.webp", "imageAlt": "A bed with a pillow and a green blanket."},
  {"id": "en-28", "language": "en", "word": "chair", "meaning": "Ghế", "level": "easy", "learningRank": 28, "topics": ["home"], "partOfSpeech": "noun", "example": "Please sit on this chair.", "visual": true, "imageUrl": "/media/images/vocabulary/chair.webp", "imageAlt": "A wooden chair with a backrest and four legs."},
  {"id": "en-29", "language": "en", "word": "table", "meaning": "Bàn", "level": "easy", "learningRank": 29, "topics": ["home"], "partOfSpeech": "noun", "example": "Put the milk on the table.", "visual": true, "imageUrl": "/media/images/vocabulary/table.webp", "imageAlt": "A wooden table with a flat top and four legs."},
  {"id": "en-30", "language": "en", "word": "door", "meaning": "Cửa", "level": "easy", "learningRank": 30, "topics": ["home"], "partOfSpeech": "noun", "example": "Please close the door.", "visual": true, "imageUrl": "/media/images/vocabulary/door.webp", "imageAlt": "A closed wooden door with a round handle."},
  {"id": "en-31", "language": "en", "word": "house", "meaning": "Ngôi nhà", "level": "easy", "learningRank": 31, "topics": ["home"], "partOfSpeech": "noun", "example": "Our house has a small garden.", "visual": true, "imageUrl": "/media/images/vocabulary/house.webp", "imageAlt": "A house with a roof, windows and a front door."},
  {"id": "en-32", "language": "en", "word": "school", "meaning": "Trường học", "level": "easy", "learningRank": 32, "topics": ["school"], "partOfSpeech": "noun", "example": "We walk to school together.", "visual": false},
  {"id": "en-33", "language": "en", "word": "mother", "meaning": "Mẹ", "level": "easy", "learningRank": 33, "topics": ["family"], "partOfSpeech": "noun", "example": "My mother likes tea.", "visual": false},
  {"id": "en-34", "language": "en", "word": "father", "meaning": "Bố / cha", "level": "easy", "learningRank": 34, "topics": ["family"], "partOfSpeech": "noun", "example": "My father is at home.", "visual": false},
  {"id": "en-35", "language": "en", "word": "brother", "meaning": "Anh / em trai", "level": "easy", "learningRank": 35, "topics": ["family"], "partOfSpeech": "noun", "example": "My brother has a new bag.", "visual": false},
  {"id": "en-36", "language": "en", "word": "sister", "meaning": "Chị / em gái", "level": "easy", "learningRank": 36, "topics": ["family"], "partOfSpeech": "noun", "example": "My sister reads every day.", "visual": false},
  {"id": "en-37", "language": "en", "word": "hand", "meaning": "Bàn tay", "level": "easy", "learningRank": 37, "topics": ["body"], "partOfSpeech": "noun", "example": "Raise your hand to ask a question.", "visual": false},
  {"id": "en-38", "language": "en", "word": "eye", "meaning": "Mắt", "level": "easy", "learningRank": 38, "topics": ["body"], "partOfSpeech": "noun", "example": "There is dust in my eye.", "visual": false},
  {"id": "en-39", "language": "en", "word": "head", "meaning": "Đầu", "level": "easy", "learningRank": 39, "topics": ["body"], "partOfSpeech": "noun", "example": "Wear a hat to protect your head.", "visual": false},
  {"id": "en-40", "language": "en", "word": "shirt", "meaning": "Áo sơ mi", "level": "easy", "learningRank": 40, "topics": ["clothing"], "partOfSpeech": "noun", "example": "I wear a blue shirt.", "visual": false},
  {"id": "en-41", "language": "en", "word": "shoe", "meaning": "Giày", "level": "easy", "learningRank": 41, "topics": ["clothing"], "partOfSpeech": "noun", "example": "There is a small stone in my shoe.", "visual": false},
  {"id": "en-42", "language": "en", "word": "car", "meaning": "Ô tô", "level": "easy", "learningRank": 42, "topics": ["transport"], "partOfSpeech": "noun", "example": "We travel to work by car.", "visual": true, "imageUrl": "/media/images/vocabulary/car.webp", "imageAlt": "A blue passenger car with four wheels."},
  {"id": "en-43", "language": "en", "word": "bus", "meaning": "Xe buýt", "level": "easy", "learningRank": 43, "topics": ["transport"], "partOfSpeech": "noun", "example": "The bus stops near my house.", "visual": true, "imageUrl": "/media/images/vocabulary/bus.webp", "imageAlt": "A long yellow bus with rows of windows."},
  {"id": "en-44", "language": "en", "word": "sun", "meaning": "Mặt trời", "level": "easy", "learningRank": 44, "topics": ["weather"], "partOfSpeech": "noun", "example": "The sun is bright today.", "visual": false},
  {"id": "en-45", "language": "en", "word": "rain", "meaning": "Mưa", "level": "easy", "learningRank": 45, "topics": ["weather"], "partOfSpeech": "noun", "example": "The rain makes the road wet.", "visual": false},
  {"id": "en-46", "language": "en", "word": "one", "meaning": "Một", "level": "easy", "learningRank": 46, "topics": ["numbers"], "partOfSpeech": "number", "example": "I have one pen.", "visual": false},
  {"id": "en-47", "language": "en", "word": "two", "meaning": "Hai", "level": "easy", "learningRank": 47, "topics": ["numbers"], "partOfSpeech": "number", "example": "There are two chairs.", "visual": false},
  {"id": "en-48", "language": "en", "word": "day", "meaning": "Ngày", "level": "easy", "learningRank": 48, "topics": ["time"], "partOfSpeech": "noun", "example": "Have a good day!", "visual": false},
  {"id": "en-49", "language": "en", "word": "time", "meaning": "Thời gian", "level": "easy", "learningRank": 49, "topics": ["time"], "partOfSpeech": "noun", "example": "We have time to read.", "visual": false},
  {"id": "en-50", "language": "en", "word": "work", "meaning": "Công việc", "level": "easy", "learningRank": 50, "topics": ["daily-life"], "partOfSpeech": "noun", "example": "I have some work to do.", "visual": false},
  {"id": "en-51", "language": "en", "word": "orange", "meaning": "Quả cam", "level": "easy", "learningRank": 51, "topics": ["food"], "partOfSpeech": "noun", "example": "Would you like an orange?", "visual": false},
  {"id": "en-52", "language": "en", "word": "potato", "meaning": "Khoai tây", "level": "easy", "learningRank": 52, "topics": ["food"], "partOfSpeech": "noun", "example": "Cut the potato into small pieces.", "visual": false},
 ];

// Editorial teaching order: useful daily objects/people before narrower animal sets.
const teachingOrder = 'water time day work house mother father brother sister school book pen bag chair table door bed tea coffee bread milk rice egg apple banana orange potato hand eye head shirt shoe car bus sun rain one two dog cat bird fish cow chicken horse red blue green yellow elephant duck rabbit'.split(' ');
const examples: Record<string, string> = { dog: 'The dog runs in the garden.', cat: 'The cat sits on a chair.', bird: 'A bird is singing outside.', fish: 'The fish swims in the water.', cow: 'The cow eats grass.', horse: 'The horse runs across the field.', chicken: 'The chicken is near the barn.', duck: 'The duck swims in the pond.', rabbit: 'The rabbit eats a carrot.', elephant: 'The elephant has a long trunk.', apple: 'I eat an apple after lunch.', bread: 'Would you like some bread?', milk: 'There is milk in the glass.', rice: 'We eat rice with our meal.', red: 'My bag is red.', blue: 'The sky is blue.', green: 'The leaves are green.', yellow: 'The shirt is yellow.', banana: 'She has a banana for breakfast.', egg: 'There is an egg on the plate.' };
export const words: Word[] = [...illustratedWords, ...addedWords].map(word => ({
  ...word, learningRank: teachingOrder.indexOf(word.word) + 1,
  partOfSpeech: word.partOfSpeech ?? (word.topics.includes('colors') ? 'adjective' : 'noun'),
  example: word.example ?? examples[word.word],
  curriculum: ['duck', 'rabbit'].includes(word.word) ? 'supplemental' : 'oxford-3000',
  audioUrl: `/media/audio/vocabulary/${word.word}-us.mp3`,
}));
