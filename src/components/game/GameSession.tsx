import { useEffect, useRef, useState } from 'react';
import VocabularyGame from './VocabularyGame';
import { advanceGame, createSession, generateQuestions, getStats, isCorrectAnswer, type GameAction, type VocabularySession } from '../../game/vocabulary';
import { emptyMemory, learningCounts, recordAttempt, selectLearningWords, type Practice } from '../../game/learning';
import { createSavedProgress, learningStore, migrateLevelProgress, progressStore, readStoredSession } from '../../services/progress';
import { getWordsForGame } from '../../repositories/queries';
import { learningLanguage, messages, topicLabel, type Locale } from '../../i18n';
import type { GameDefinition } from '../../config/games';
import type { Topic, Word } from '../../types/content';

interface Props { locale: Locale; game: GameDefinition; words: Word[]; topics: Topic[]; progressWords: Pick<Word, 'id' | 'topics' | 'curriculum'>[] }
export default function GameSession({ locale, game, words, topics, progressWords }: Props) {
  const t = messages[locale];
  const [topic, setTopic] = useState('all');
  const [session, setSession] = useState<VocabularySession | null>(null);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [memory, setMemory] = useState(emptyMemory);
  const [practice, setPractice] = useState<Practice>('study');
  const picker = useRef<HTMLSelectElement>(null);
  const pool = words;
  const ranks = new Map(pool.map(word => [word.id, word.learningRank]));
  const answerPool = pool.map(word => game.id === 'word-to-meaning' ? word.meaning : word.word);
  const key = (selected: string, selectedPractice = practice) => ({ language: learningLanguage, game: game.slug, topic: selected, mode: game.id, practice: selectedPractice });
  const targets = (selected: string, startRank: number, count?: number) => getWordsForGame(pool, { game: game.id, startRank, count, topic: selected });
  const questionsForRound = (selected: string, selectedMemory = memory, selectedPractice = practice, startRank = 1) => generateQuestions(selectLearningWords(targets(selected, selectedPractice === 'free' ? startRank : 1), selectedMemory, Date.now(), 10, selectedPractice), game.id, pool);

  function restore(selected: string, selectedPractice = practice): VocabularySession | null {
    const saved = progressStore.get(key(selected, selectedPractice));
    if (!saved) {
      return migrateLevelProgress(key(selected, selectedPractice), game.id, generateQuestions(targets(selected, 1), game.id, pool), answerPool, ranks);
    }
    const startRank = typeof saved === 'object' && 'startRank' in saved && typeof saved.startRank === 'number' ? saved.startRank : 1;
    const bank = generateQuestions(targets(selected, 1), game.id, pool);
    return readStoredSession(saved, { ...key(selected, selectedPractice), startRank }, game.id, bank, answerPool, pool.filter(word => word.imageUrl && word.imageAlt).map(word => ({ answer: word.word, url: word.imageUrl!, alt: word.imageAlt! })));
  }
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const requested = query.get('topic');
    const selectedPractice = query.get('practice') === 'review' ? 'review' : query.get('practice') === 'free' ? 'free' : 'study';
    const selected = topics.some(item => item.id === requested) ? requested! : 'all';
    setTopic(selected);
    setPractice(selectedPractice);
    setMemory(learningStore.get());
    const saved = restore(selected, selectedPractice);
    if (saved) { const resumed = { ...saved, id: saved.id ?? crypto.randomUUID() }; setSession(resumed); setStorageError(!progressStore.save(createSavedProgress(resumed, progressStore.get(key(selected, selectedPractice))))); }
    setReady(true);
    // Props are static for the lifetime of an Astro page; a locale switch loads a new page.
  }, []);

  useEffect(() => {
    if (!ready || session) return;
    const refresh = () => setMemory(current => learningStore.get(current));
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    const timer = window.setInterval(refresh, 60_000);
    return () => { window.removeEventListener('focus', refresh); window.removeEventListener('storage', refresh); window.clearInterval(timer); };
  }, [ready, session]);

  function save(next: VocabularySession, memorySaved = !storageError) {
    setStorageError(!progressStore.save(createSavedProgress(next, progressStore.get(next.config))) || !memorySaved);
    setSession(next);
  }
  function start(newWords = false) {
    const existing = session ?? restore(topic);
    if (existing && !newWords && !getStats(existing).finished) { save({ ...existing, id: existing.id ?? crypto.randomUUID() }); return; }
    const currentMemory = learningStore.get(memory); setMemory(currentMemory);
    let startRank = practice === 'free' && existing ? Math.max(...existing.questions.map(question => ranks.get(question.id) ?? 0)) + 1 : 1;
    if (!targets(topic, startRank, 1).length) startRank = 1;
    const bank = questionsForRound(topic, currentMemory, practice, startRank);
    const next = createSession({ ...key(topic), startRank, questionCount: 10 }, bank);
    if (next) save({ ...next, id: crypto.randomUUID() });
  }
  function act(action: GameAction) {
    if (!session) return;
    const state = advanceGame(session.state, action, session.questions);
    if (state === session.state) return;
    let memorySaved = !storageError;
    if (action.type === 'answer' || action.type === 'match') {
      const question = action.type === 'match' ? session.questions.find(question => question.id === action.id)! : session.questions[session.state.index];
      const updated = recordAttempt(learningStore.get(memory), question.id, isCorrectAnswer(question, action.answer), Date.now(), `${session.id}:${question.id}`);
      memorySaved = learningStore.save(updated); setMemory(updated);
    }
    save({ ...session, state, ...(action.type === 'restart' ? { id: crypto.randomUUID() } : {}) }, memorySaved);
  }
  const moreWords = session && getStats(session).finished && questionsForRound(topic, memory, practice, practice === 'free' ? Math.max(...session.questions.map(question => ranks.get(question.id) ?? 0)) + 1 : 1).length > 0;
  const resumable = ready && !session ? restore(topic) : null;
  const canResume = resumable && !getStats(resumable).finished;
  const canPlay = !session && (!!canResume || questionsForRound(topic).length > 0);
  const counts = learningCounts(progressWords.filter(word => word.curriculum !== 'supplemental' && (topic === 'all' || word.topics.includes(topic))), memory, Date.now());
  const playableCounts = learningCounts(targets(topic, 1).filter(word => word.curriculum !== 'supplemental'), memory, Date.now());
  function updateQuery(selected: string, selectedPractice: Practice) {
    const url = new URL(window.location.href);
    if (selected === 'all') url.searchParams.delete('topic'); else url.searchParams.set('topic', selected);
    if (selectedPractice === 'study') url.searchParams.delete('practice'); else url.searchParams.set('practice', selectedPractice);
    window.history.replaceState(null, '', url);
    document.querySelectorAll<HTMLAnchorElement>('[data-locale]').forEach(link => { const target = new URL(link.href); target.search = url.search; link.href = target.href; });
  }
  return <div className={`game-session${session ? ' is-playing' : ''}`}>
    {!ready ? <p className="game-loading" role="status">{t.loading}</p> : session ? <VocabularyGame session={session} topicName={topicLabel(locale, topic)} gameName={game.title[locale]} locale={locale} onAction={act} onNewRound={moreWords ? () => start(true) : undefined} onBack={() => { setSession(null); requestAnimationFrame(() => picker.current?.focus()); }} /> : <section className="topic-picker">
      <label htmlFor="game-topic">{t.topic}</label>
      <select id="game-topic" ref={picker} value={topic} onChange={event => {
        const selected = event.target.value; setTopic(selected);
        updateQuery(selected, practice); setMemory(learningStore.get(memory));
      }}><option value="all">{t.allTopics}</option>{topics.map(item => <option key={item.id} value={item.id}>{topicLabel(locale, item.id)}</option>)}</select>
      <button className="primary-button" onClick={() => start()} disabled={!canPlay}>{canResume ? t.continue : t.play} →</button>
      <div className="practice-options" role="group" aria-label={t.practiceType}>{(['study', 'review', 'free'] as const).map(value => <button className="secondary-button" key={value} aria-pressed={practice === value} onClick={() => { setPractice(value); updateQuery(topic, value); setMemory(learningStore.get(memory)); }}>{t[value]}</button>)}</div>
      <p className="topic-memory">{counts.mastered} / {counts.total} {t.remembered} · {playableCounts.statuses.review} {t.due}{counts.complete && ` · ✓ ${t.topicComplete}`}<br />{t.masteryAcrossGames} · {playableCounts.total} {t.playableHere}</p>
      {!canPlay && <p className="notice" role="status">{practice === 'review' ? t.noReviews : practice === 'study' && counts.total > 0 ? t.studyDone : t.notEnoughContent}</p>}
      <a className="progress-link" href={`/${locale}/progress`}>{t.learningProgress} →</a>
    </section>}
    {storageError && <p className="notice" role="status">{t.storageError}</p>}
  </div>;
}
