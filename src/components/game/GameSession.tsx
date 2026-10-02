import { useCallback, useEffect, useState } from 'react';
import MultipleChoiceGame from './MultipleChoiceGame';
import { getScore, isValidGameState, type GameState, type MultipleChoiceQuestion } from '../../game/multiple-choice';
import { progressStore, type ProgressKey } from '../../services/progress';

interface Props { questions: MultipleChoiceQuestion[]; progressKey: ProgressKey; backHref: string }

export default function GameSession({ questions, progressKey, backHref }: Props) {
  const [initialState, setInitialState] = useState<GameState | null>(null);
  const [storageError, setStorageError] = useState(false);
  const signature = JSON.stringify(questions);

  useEffect(() => {
    const saved = progressStore.get(progressKey);
    if (saved && typeof saved === 'object' && 'signature' in saved && saved.signature === signature && 'state' in saved && isValidGameState(saved.state, questions)) {
      setInitialState(saved.state);
    } else {
      setInitialState({ index: 0, answers: [] });
    }
  }, [progressKey, questions, signature]);

  const save = useCallback((state: GameState) => {
    const success = progressStore.save({ ...progressKey, state, signature, completed: state.answers.length, total: questions.length, score: getScore(state.answers, questions), updatedAt: new Date().toISOString() });
    setStorageError(!success);
  }, [progressKey, questions, signature]);

  return <>
    {initialState ? <MultipleChoiceGame questions={questions} initialState={initialState} onStateChange={save} backHref={backHref} /> : <p className="game-loading" role="status">Getting your little adventure ready…</p>}
    {storageError && <p className="notice" role="status">Your browser couldn't save progress. You can keep playing, but this round won't be remembered after reload.</p>}
  </>;
}
