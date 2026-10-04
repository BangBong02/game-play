export const locales = ['en', 'vi'] as const;
export type Locale = typeof locales[number];
export const learningLanguage = 'en';
export const localePath = (locale: Locale, path: string) => path.replace(/^\/(en|vi)(?=\/|$)/, `/${locale}`);
export const messages = {
  en: {
    masteryAcrossGames: 'Mastery is shared across games', playableHere: 'playable in this game', imageError: 'Picture unavailable. Text description:', extraWordsNote: 'Extra practice words: duck and rabbit. They are outside the Oxford target.', learningProgress: 'Your vocabulary', progressIntro: 'See what you remember and what is ready to review.', topicProgress: 'Your topics', remembered: 'mastered', due: 'due for review', topicComplete: 'Completed', availableDemo: 'Oxford-aligned words available in this demo.', practiceType: 'Practice type', study: 'Learn & review', review: 'Due reviews', free: 'Free practice', noReviews: 'No playable reviews are due for this game. Try Learn & review, Free practice or another game.', studyDone: 'No playable study round is ready. Try Free practice or another game; scheduled words return when due.', reviewNow: 'Review now', nextReview: 'Next review', localOnly: 'Saved on this browser. No account needed.', studiedWords: 'Words you have practiced', howMemoryWorks: 'How learning progress works', memoryRule: 'A word becomes mastered after three correct scheduled attempts on different UTC days. Reviews are spaced 1 day, 7 days and then 60 days apart. A mistake brings the word back after 5 hours. Early repeats earn a game score but do not advance mastery.', curriculumNote: 'The 300, 1,200 and 3,000 targets are cumulative groups curated by Lingoplay from Oxford 3000. This demo has 50 verified core words; larger groups are planned. Definitions and examples are authored by Lingoplay. Editorial priority is not an official frequency ranking.', learningStates: { unseen: 'New', learning: 'Learning', correct: 'Answered correctly', review: 'Review due', mastered: 'Mastered' }, matching: 'Matching', pairs: 'Pairs', matchInstruction: 'Connect words and pictures.', pickWord: 'Pick a word.', pickImage: 'Now pick its picture.', nextBoard: 'Next board', boardComplete: 'Board complete!', matchCorrection: 'Marked pictures show the correct matches for:', listening: 'Listening', imageBased: 'Pictures', listen: 'Listen / replay', replay: 'Replay', audioVoice: 'English US · Demo voice', audioError: 'Audio could not play. Try Listen again or choose another topic.', listenInstruction: 'Listen. Which picture matches?', games: 'Games', learn: 'Learn', all: 'All', vocabulary: 'Vocabulary', spelling: 'Spelling',
    hero: 'Learn English through games.', intro: 'Pick a game and play.', play: 'Play', continue: 'Continue',
    skip: 'Skip to content', navigation: 'Main navigation', uiLanguage: 'Interface language', footer: 'A little play. A lot of English.',
    topic: 'Choose a topic', allTopics: 'All topics', topics: { animals: 'Animals', food: 'Food', colors: 'Colors', home: 'Home', school: 'School', family: 'Family', body: 'Body', clothing: 'Clothing', transport: 'Travel', time: 'Time', numbers: 'Numbers', weather: 'Weather', 'daily-life': 'Daily life', 'days-months': 'Days & Months' },
    loading: 'Getting your game ready…', storageError: 'Progress could not be saved completely. You can keep playing, but recent changes may be lost after reload.',
    notEnoughContent: 'Not enough content for this game yet. Try another topic or game.',
    correctAnswer: 'Correct answer', wrongAnswer: 'Your answer · Not quite', typedAnswer: 'Your English word', check: 'Check answer',
    typingHint: 'Enter to check · Capital letters are okay.', complete: 'ROUND COMPLETE', perfect: 'You know your words!', nice: 'Nice practice!',
    wordsCorrect: 'words answered correctly', correct: 'Correct', incorrect: 'Incorrect', accuracy: 'Accuracy', again: 'Play again', nextRound: 'Next round',
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
    masteryAcrossGames: 'Tính mức nhớ chung giữa các game', playableHere: 'từ chơi được trong game này', imageError: 'Không tải được hình. Mô tả bằng chữ:', extraWordsNote: 'Từ luyện thêm: duck và rabbit. Hai từ này không tính vào mốc Oxford.', learningProgress: 'Vốn từ của bạn', progressIntro: 'Xem các từ đã nhớ và những từ đến lịch ôn.', topicProgress: 'Tiến trình chủ đề', remembered: 'đã nhớ', due: 'đến lịch ôn', topicComplete: 'Hoàn thành', availableDemo: 'từ thuộc Oxford 3000 có sẵn trong bản demo.', practiceType: 'Cách luyện tập', study: 'Học & ôn', review: 'Ôn đến hạn', free: 'Chơi tự do', noReviews: 'Game này chưa có từ chơi được đến hạn ôn. Bạn có thể Học & ôn, Chơi tự do hoặc chọn game khác.', studyDone: 'Hiện chưa có lượt học phù hợp. Bạn thử Chơi tự do hoặc game khác; từ đã học sẽ trở lại khi đến lịch ôn.', reviewNow: 'Ôn ngay', nextReview: 'Lần ôn tiếp theo', localOnly: 'Lưu trên trình duyệt này. Không cần tài khoản.', studiedWords: 'Các từ đã luyện', howMemoryWorks: 'Cách tính tiến trình học', memoryRule: 'Một từ được tính đã nhớ sau ba lần đúng khi đến lịch ôn ở các ngày UTC khác nhau. Lịch ôn tăng 1 ngày, 7 ngày rồi 60 ngày. Trả lời sai hẹn lại sau 5 giờ. Chơi lại sớm vẫn có score nhưng không tăng mastery.', curriculumNote: 'Các mốc 300, 1.200 và 3.000 là nhóm cộng dồn do Lingoplay chọn từ Oxford 3000. Demo có 50 từ cốt lõi đã đối chiếu; các nhóm lớn sẽ được bổ sung sau. Nghĩa và ví dụ do Lingoplay viết. Thứ tự ưu tiên không phải frequency rank chính thức.', learningStates: { unseen: 'Chưa học', learning: 'Đang học', correct: 'Đã trả lời đúng', review: 'Cần ôn', mastered: 'Đã nhớ' }, matching: 'Ghép cặp', pairs: 'Cặp', matchInstruction: 'Ghép từ với hình.', pickWord: 'Chọn một từ.', pickImage: 'Chọn hình tương ứng.', nextBoard: 'Bảng tiếp theo', boardComplete: 'Đã xong bảng!', matchCorrection: 'Các hình được đánh dấu là cặp đúng của:', listening: 'Nghe', imageBased: 'Hình ảnh', listen: 'Nghe / nghe lại', replay: 'Nghe lại', audioVoice: 'Giọng US · Audio demo', audioError: 'Không phát được audio. Bấm nghe lại hoặc chọn chủ đề khác.', listenInstruction: 'Nghe rồi chọn hình phù hợp.', games: 'Game', learn: 'Học', all: 'Tất cả', vocabulary: 'Từ vựng', spelling: 'Chính tả',
    hero: 'Học tiếng Anh qua game.', intro: 'Chọn một game và chơi thôi.', play: 'Chơi', continue: 'Tiếp tục',
    skip: 'Đến nội dung', navigation: 'Điều hướng chính', uiLanguage: 'Ngôn ngữ giao diện', footer: 'Chơi một chút. Học thêm tiếng Anh.',
    topic: 'Chọn chủ đề', allTopics: 'Tất cả chủ đề', topics: { animals: 'Động vật', food: 'Đồ ăn', colors: 'Màu sắc', home: 'Nhà cửa', school: 'Trường học', family: 'Gia đình', body: 'Cơ thể', clothing: 'Quần áo', transport: 'Đi lại', time: 'Thời gian', numbers: 'Số đếm', weather: 'Thời tiết', 'daily-life': 'Đời sống', 'days-months': 'Ngày & tháng' },
    loading: 'Đang chuẩn bị game…', storageError: 'Trình duyệt chưa lưu đầy đủ tiến trình. Bạn vẫn có thể chơi, nhưng thay đổi gần đây có thể bị mất sau khi tải lại.',
    notEnoughContent: 'Game này chưa đủ nội dung để chơi. Bạn thử chủ đề hoặc game khác nhé.',
    correctAnswer: 'Đáp án đúng', wrongAnswer: 'Bạn chọn · Chưa đúng', typedAnswer: 'Nhập từ tiếng Anh', check: 'Kiểm tra',
    typingHint: 'Enter để kiểm tra · Có thể dùng chữ hoa.', complete: 'HOÀN THÀNH LƯỢT CHƠI', perfect: 'Bạn nhớ từ rất tốt!', nice: 'Luyện tập tốt lắm!',
    wordsCorrect: 'từ trả lời đúng', correct: 'Đúng', incorrect: 'Sai', accuracy: 'Độ chính xác', again: 'Chơi lại', nextRound: 'Lượt tiếp theo',
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
