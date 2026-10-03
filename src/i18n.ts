export const locales = ['en', 'vi'] as const;
export type Locale = typeof locales[number];
export const learningLanguage = 'en';
export const localePath = (locale: Locale, path: string) => path.replace(/^\/(en|vi)(?=\/|$)/, `/${locale}`);
export const messages = {
  en: {
    games: 'Games', learn: 'Learn', all: 'All', vocabulary: 'Vocabulary', spelling: 'Spelling',
    hero: 'Learn English through games.', intro: 'Pick a game and play.', play: 'Play', continue: 'Continue',
    skip: 'Skip to content', navigation: 'Main navigation', uiLanguage: 'Interface language', footer: 'A little play. A lot of English.',
    topic: 'Choose a topic', allTopics: 'All topics', topics: { animals: 'Animals', food: 'Food', colors: 'Colors' },
    loading: 'Getting your game ready…', storageError: 'Your browser could not save progress. You can keep playing, but this round will not be remembered after reload.',
    notEnoughContent: 'Not enough content for this game yet. Try another topic or game.',
    correctAnswer: 'Correct answer', wrongAnswer: 'Your answer · Not quite', typedAnswer: 'Your English word', check: 'Check answer',
    typingHint: 'Enter to check · Capital letters are okay.', complete: 'ROUND COMPLETE', perfect: 'You know your words!', nice: 'Nice practice!',
    wordsCorrect: 'words answered correctly', correct: 'Correct', incorrect: 'Incorrect', accuracy: 'Accuracy', again: 'Play again', nextRound: 'New words',
    back: 'Choose topic', word: 'Word', completed: 'completed', current: 'current', upcoming: 'up next', roundWords: 'Words in this round',
    typeInstruction: 'Type the English word', meaningInstruction: 'Choose the meaning', wordInstruction: 'Choose the English word',
    pictureInstruction: 'Which word matches this picture?', yes: '✓ Correct!', no: '× Not quite', results: 'See results', next: 'Next word',
    keyboardHint: 'Tab to move between controls. Enter to answer or continue.', empty: 'No playable words in this topic yet.',
    wordList: 'English vocabulary', meaning: 'Vietnamese meaning', wordListIntro: 'Review the English words used in these games.',
    library: 'Learning library', libraryIntro: 'Read, learn, play.', read: 'Read article', more: 'More articles',
    sections: { blog: 'Blog', grammar: 'Grammar', guides: 'Guides' },
    sectionDescriptions: { blog: 'Small ideas for daily English practice.', grammar: 'Learn how English words fit together.', guides: 'Get more from your games and practice.' },
    articleLanguage: 'Lessons are written in English.', filterCount: 'games',
  },
  vi: {
    games: 'Game', learn: 'Học', all: 'Tất cả', vocabulary: 'Từ vựng', spelling: 'Chính tả',
    hero: 'Học tiếng Anh qua game.', intro: 'Chọn một game và chơi thôi.', play: 'Chơi', continue: 'Tiếp tục',
    skip: 'Đến nội dung', navigation: 'Điều hướng chính', uiLanguage: 'Ngôn ngữ giao diện', footer: 'Chơi một chút. Học thêm tiếng Anh.',
    topic: 'Chọn chủ đề', allTopics: 'Tất cả chủ đề', topics: { animals: 'Động vật', food: 'Đồ ăn', colors: 'Màu sắc' },
    loading: 'Đang chuẩn bị game…', storageError: 'Trình duyệt không lưu được tiến trình. Bạn vẫn có thể chơi, nhưng lượt này sẽ không được nhớ sau khi tải lại.',
    notEnoughContent: 'Game này chưa đủ nội dung để chơi. Bạn thử chủ đề hoặc game khác nhé.',
    correctAnswer: 'Đáp án đúng', wrongAnswer: 'Bạn chọn · Chưa đúng', typedAnswer: 'Nhập từ tiếng Anh', check: 'Kiểm tra',
    typingHint: 'Enter để kiểm tra · Có thể dùng chữ hoa.', complete: 'HOÀN THÀNH LƯỢT CHƠI', perfect: 'Bạn nhớ từ rất tốt!', nice: 'Luyện tập tốt lắm!',
    wordsCorrect: 'từ trả lời đúng', correct: 'Đúng', incorrect: 'Sai', accuracy: 'Độ chính xác', again: 'Chơi lại', nextRound: 'Từ mới',
    back: 'Chọn chủ đề', word: 'Từ', completed: 'đã hoàn thành', current: 'hiện tại', upcoming: 'tiếp theo', roundWords: 'Các từ trong lượt chơi',
    typeInstruction: 'Gõ từ tiếng Anh', meaningInstruction: 'Chọn nghĩa của từ', wordInstruction: 'Chọn từ tiếng Anh',
    pictureInstruction: 'Từ nào phù hợp với hình này?', yes: '✓ Chính xác!', no: '× Chưa đúng', results: 'Xem kết quả', next: 'Từ tiếp theo',
    keyboardHint: 'Tab để chuyển giữa các nút. Enter để trả lời hoặc tiếp tục.', empty: 'Chủ đề này chưa có từ để chơi.',
    wordList: 'Từ vựng tiếng Anh', meaning: 'Nghĩa tiếng Việt', wordListIntro: 'Ôn lại các từ tiếng Anh được dùng trong game.',
    library: 'Thư viện học tập', libraryIntro: 'Đọc, học và chơi.', read: 'Đọc bài', more: 'Các bài khác',
    sections: { blog: 'Blog', grammar: 'Ngữ pháp', guides: 'Hướng dẫn' },
    sectionDescriptions: { blog: 'Ý tưởng nhỏ để luyện tiếng Anh mỗi ngày.', grammar: 'Hiểu cách kết hợp các từ tiếng Anh.', guides: 'Học hiệu quả hơn từ game và luyện tập.' },
    articleLanguage: 'Nội dung bài học được viết bằng tiếng Anh.', filterCount: 'game',
  },
};
export type Messages = typeof messages[Locale];
export function topicLabel(locale: Locale, id: string): string {
  return messages[locale].topics[id as keyof typeof messages.en.topics] ?? messages[locale].allTopics;
}
