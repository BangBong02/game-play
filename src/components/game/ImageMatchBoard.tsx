import { useEffect, useRef, useState } from 'react';
import { isCorrectAnswer, matchBoardEnd, type GameAction, type MatchingQuestion, type VocabularySession } from '../../game/vocabulary';
import type { Messages } from '../../i18n';
import VocabularyImage from './VocabularyImage';

export default function ImageMatchBoard({ session, onAction, t }: { session: VocabularySession; onAction: (action: GameAction) => void; t: Messages }) {
  const [selected, setSelected] = useState<string | null>(null);
  const wordsGroup = useRef<HTMLDivElement>(null);
  const imagesGroup = useRef<HTMLDivElement>(null);
  const { state } = session;
  const board = session.questions.slice(state.index, matchBoardEnd(state.index, session.questions.length)) as MatchingQuestion[];
  const answerFor = (id: string) => state.answers[session.questions.findIndex(question => question.id === id)];
  const images = [...board].sort((a, b) => session.imageOrder!.indexOf(a.id) - session.imageOrder!.indexOf(b.id));
  const corrections = board.filter(question => answerFor(question.id) && !isCorrectAnswer(question, answerFor(question.id)));
  useEffect(() => { wordsGroup.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus(); }, [state.index, state.answers]);
  return <div className="matching-game">
    <p className="match-instruction" role="status">{selected ? t.pickImage : t.pickWord}</p>
    <div className="match-board">
      <div ref={wordsGroup} className="match-words" role="group" aria-label={t.pickWord}>{board.map(question => {
        const answer = answerFor(question.id);
        const status = answer ? isCorrectAnswer(question, answer) ? ' correct' : ' incorrect' : '';
        return <button key={question.id} className={`match-word${status}`} aria-pressed={selected === question.id} disabled={!!answer} onClick={() => { const next = selected === question.id ? null : question.id; setSelected(next); if (next) requestAnimationFrame(() => imagesGroup.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus()); }}><span lang="en">{question.correctAnswer}</span>{answer && <span aria-hidden="true">{status === ' correct' ? ' ✓' : ' ×'}</span>}</button>;
      })}</div>
      <div ref={imagesGroup} className="match-images" role="group" aria-label={t.pickImage}>{images.map(question => {
        const answer = answerFor(question.id);
        const status = answer ? isCorrectAnswer(question, answer) ? ' correct' : ' incorrect' : '';
        return <button key={question.id} className={`match-image${status}`} disabled={!selected || !!answer} onClick={() => { onAction({ type: 'match', id: selected!, answer: question.correctAnswer }); setSelected(null); }}><VocabularyImage key={question.image.url} source={question.image} t={t} width={160} height={120} />{answer && <span lang="en">{question.correctAnswer} {status === ' correct' ? '✓' : '×'}</span>}</button>;
      })}</div>
    </div>
    {corrections.length > 0 && <p className="notice" role="status">{t.matchCorrection} <strong lang="en">{corrections.map(question => question.correctAnswer).join(', ')}</strong></p>}
  </div>;
}
