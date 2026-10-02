import { useEffect, useRef, useState } from 'react';
import VocabularyGame from './VocabularyGame';
import { advanceGame, createSession, gameModes, getStats, isGameMode, type GameAction, type GameMode, type Question, type SessionConfig, type VocabularySession } from '../../game/vocabulary';
import { createSavedProgress, progressStore, readStoredSession } from '../../services/progress';

interface Props { banks: Record<GameMode, Question[]>; topicName: string; levelName: string; progressKey: Pick<SessionConfig, 'language' | 'level' | 'topic'> }

export default function GameSession({ banks, topicName, levelName, progressKey }: Props) {
  const [session, setSession] = useState<VocabularySession | null>(null);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const focusPicker = useRef(false);

  useEffect(() => {
    const recent = progressStore.get(progressKey);
    const mode = recent && typeof recent === 'object' && 'mode' in recent && isGameMode(recent.mode) ? recent.mode : 'word-to-meaning';
    setSession(readStoredSession(progressStore.get({ ...progressKey, mode }), progressKey, mode, banks[mode]));
    setReady(true);
  }, [progressKey, banks]);

  function save(next: VocabularySession, previous: unknown = progressStore.get({ ...progressKey, mode: next.config.mode })) {
    setStorageError(!progressStore.save(createSavedProgress(next, previous)));
    setSession(next);
  }

  function start(mode: GameMode) {
    const existing = readStoredSession(progressStore.get({ ...progressKey, mode }), progressKey, mode, banks[mode]);
    const next = existing && !getStats(existing).finished ? existing : createSession({ ...progressKey, mode, questionCount: 10 }, banks[mode]);
    if (next) save(next, existing && getStats(existing).finished ? createSavedProgress(existing) : progressStore.get({ ...progressKey, mode }));
  }

  function act(action: GameAction) {
    if (!session) return;
    const state = advanceGame(session.state, action, session.questions);
    if (state !== session.state) save({ ...session, state }, createSavedProgress(session, progressStore.get({ ...progressKey, mode: session.config.mode })));
  }

  return <div className={`game-session${session ? ' is-playing' : ''}`}>
    {!ready ? <p className="game-loading" role="status">Getting your game ready…</p> : session ? <VocabularyGame session={session} topicName={topicName} levelName={levelName} onAction={act} onBack={() => { focusPicker.current = true; setSession(null); }} /> : <section className="game-picker" aria-labelledby="game-picker-heading">
      <h3 id="game-picker-heading" className="visually-hidden" tabIndex={-1} ref={node => { if (node && focusPicker.current) { node.focus(); focusPicker.current = false; } }}>Choose a game</h3>
      <div className="game-mode-grid">{gameModes.map(mode => {
        const saved = readStoredSession(progressStore.get({ ...progressKey, mode: mode.id }), progressKey, mode.id, banks[mode.id]);
        const continueRound = saved && !getStats(saved).finished;
        const count = continueRound ? saved.questions.length : Math.min(10, banks[mode.id].length);
        return <button className={`game-mode-card mode-${mode.id}`} key={mode.id} disabled={!count} onClick={() => start(mode.id)}>
          <span className="mode-icon" aria-hidden="true">{mode.id === 'image-to-word' ? <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="9" cy="8" r="1" /><path d="m3 17 5-5 4 4 4-6 5 7" /></svg> : mode.icon}</span><strong>{mode.name}</strong><span>{mode.description}</span><small>{count ? `${count} words` : 'More pictures or words needed'}</small><span className="mode-action">{!count ? 'Coming soon' : continueRound ? 'Continue' : saved ? 'Play again' : 'Play'} <span aria-hidden="true">→</span></span>
        </button>;
      })}</div>
    </section>}
    {storageError && <p className="notice" role="status">Your browser couldn't save progress. You can keep playing, but this round won't be remembered after reload.</p>}
  </div>;
}
