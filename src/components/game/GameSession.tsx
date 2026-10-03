import { useEffect, useRef, useState } from 'react';
import VocabularyGame from './VocabularyGame';
import { advanceGame, createSession, generateQuestions, getStats, type GameAction, type VocabularySession } from '../../game/vocabulary';
import { createSavedProgress, migrateLevelProgress, progressStore, readStoredSession } from '../../services/progress';
import { getWordsForGame } from '../../repositories/queries';
import { learningLanguage, messages, topicLabel, type Locale } from '../../i18n';
import type { GameDefinition } from '../../config/games';
import type { Topic, Word } from '../../types/content';

interface Props { locale: Locale; game: GameDefinition; words: Word[]; topics: Topic[] }
export default function GameSession({ locale, game, words, topics }: Props) {
  const t = messages[locale];
  const [topic, setTopic] = useState('all');
  const [session, setSession] = useState<VocabularySession | null>(null);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const picker = useRef<HTMLSelectElement>(null);
  const pool = words;
  const ranks = new Map(pool.map(word => [word.id, word.learningRank]));
  const answerPool = pool.map(word => game.id === 'word-to-meaning' ? word.meaning : word.word);
  const key = (selected: string) => ({ language: learningLanguage, game: game.slug, topic: selected, mode: game.id });
  const targets = (selected: string, startRank: number, count?: number) => getWordsForGame(pool, { game: game.id, startRank, count, topic: selected });
  const questionsForRound = (selected: string, startRank: number) => generateQuestions(targets(selected, startRank, 10), game.id, pool);

  function restore(selected: string): VocabularySession | null {
    const saved = progressStore.get(key(selected));
    if (!saved) {
      return migrateLevelProgress(key(selected), game.id, generateQuestions(targets(selected, 1), game.id, pool), answerPool, ranks);
    }
    const startRank = typeof saved === 'object' && 'startRank' in saved && typeof saved.startRank === 'number' ? saved.startRank : 1;
    const bank = generateQuestions(targets(selected, 1), game.id, pool);
    return readStoredSession(saved, { ...key(selected), startRank }, game.id, bank, answerPool);
  }
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('topic');
    const selected = topics.some(item => item.id === requested) ? requested! : 'all';
    setTopic(selected);
    const saved = restore(selected);
    if (saved) { setSession(saved); setStorageError(!progressStore.save(createSavedProgress(saved, progressStore.get(key(selected))))); }
    setReady(true);
    // Props are static for the lifetime of an Astro page; a locale switch loads a new page.
  }, []);

  function save(next: VocabularySession) {
    setStorageError(!progressStore.save(createSavedProgress(next, progressStore.get(key(next.config.topic)))));
    setSession(next);
  }
  function start(newWords = false) {
    const existing = session ?? restore(topic);
    if (existing && !newWords) { save(existing); return; }
    let startRank = existing ? Math.max(...existing.questions.map(question => ranks.get(question.id) ?? 0)) + 1 : 1;
    if (!targets(topic, startRank, 1).length) startRank = 1;
    const bank = questionsForRound(topic, startRank);
    const next = createSession({ ...key(topic), startRank, questionCount: 10 }, bank);
    if (next) save(next);
  }
  function act(action: GameAction) {
    if (!session) return;
    const state = advanceGame(session.state, action, session.questions);
    if (state !== session.state) save({ ...session, state });
  }
  const moreWords = session && getStats(session).finished && questionsForRound(topic, Math.max(...session.questions.map(question => ranks.get(question.id) ?? 0)) + 1).length > 0;
  const canPlay = !session && questionsForRound(topic, 1).length > 0;
  return <div className={`game-session${session ? ' is-playing' : ''}`}>
    {!ready ? <p className="game-loading" role="status">{t.loading}</p> : session ? <VocabularyGame session={session} topicName={topicLabel(locale, topic)} gameName={game.title[locale]} locale={locale} onAction={act} onNewRound={moreWords ? () => start(true) : undefined} onBack={() => { setSession(null); requestAnimationFrame(() => picker.current?.focus()); }} /> : <section className="topic-picker">
      <label htmlFor="game-topic">{t.topic}</label>
      <select id="game-topic" ref={picker} value={topic} onChange={event => {
        const selected = event.target.value; setTopic(selected);
        const url = new URL(window.location.href); if (selected === 'all') url.searchParams.delete('topic'); else url.searchParams.set('topic', selected);
        window.history.replaceState(null, '', url);
        document.querySelectorAll<HTMLAnchorElement>('[data-locale]').forEach(link => { const target = new URL(link.href); target.search = url.search; link.href = target.href; });
      }}><option value="all">{t.allTopics}</option>{topics.map(item => <option key={item.id} value={item.id}>{topicLabel(locale, item.id)}</option>)}</select>
      <button className="primary-button" onClick={() => start()} disabled={!canPlay}>{t.play} →</button>
      {!canPlay && <p className="notice" role="status">{t.notEnoughContent}</p>}
    </section>}
    {storageError && <p className="notice" role="status">{t.storageError}</p>}
  </div>;
}
