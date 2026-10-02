import { useEffect, useRef, useState } from 'react';
import VocabularyGame from './VocabularyGame';
import { advanceGame, createSession, gameModes, getStats, isGameMode, type GameAction, type GameMode, type Question, type SessionConfig, type VocabularySession } from '../../game/vocabulary';
import { createSavedProgress, progressStore, readStoredSession } from '../../services/progress';

interface Props { banks: Record<GameMode, Question[]>; progressKey: Pick<SessionConfig, 'language' | 'level' | 'topic'> }

export default function GameSession({ banks, progressKey }: Props) {
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

  return <>
    {!ready ? <p className="game-loading" role="status">Getting your little adventure ready…</p> : session ? <VocabularyGame session={session} onAction={act} onBack={() => { focusPicker.current = true; setSession(null); }} /> : <section className="game-picker" aria-labelledby="game-picker-heading">
      <h3 id="game-picker-heading" tabIndex={-1} ref={node => { if (node && focusPicker.current) { node.focus(); focusPicker.current = false; } }}>Choose a game</h3><p>Up to 10 words per round. Pick a game to start or continue your saved round.</p>
      <div className="game-mode-grid">{gameModes.map(mode => <button className="game-mode-card" key={mode.id} disabled={!banks[mode.id].length} onClick={() => start(mode.id)}>
        <span className="mode-icon" aria-hidden="true">{mode.icon}</span><strong>{mode.name}</strong><span>{mode.description}</span><small>{banks[mode.id].length ? `${Math.min(10, banks[mode.id].length)} questions · Start / continue →` : 'Not enough local data yet'}</small>
      </button>)}</div>
    </section>}
    {storageError && <p className="notice" role="status">Your browser couldn't save progress. You can keep playing, but this round won't be remembered after reload.</p>}
  </>;
}
