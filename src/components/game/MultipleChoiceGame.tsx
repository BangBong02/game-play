import { useEffect, useRef, useState } from 'react';
import { advanceGame, getScore, type GameState, type MultipleChoiceQuestion } from '../../game/multiple-choice';

interface Props {
  questions: MultipleChoiceQuestion[];
  initialState: GameState;
  onStateChange: (state: GameState) => void;
  backHref: string;
}

export default function MultipleChoiceGame({ questions, initialState, onStateChange, backHref }: Props) {
  const [state, setState] = useState(initialState);
  const heading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  useEffect(() => onStateChange(state), [state, onStateChange]);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    heading.current?.focus();
  }, [state.index]);

  if (!questions.length) return <p className="notice">No questions available yet. <a href={backHref}>Back to topics</a></p>;
  const finished = state.index >= questions.length;
  const score = getScore(state.answers, questions);
  const answer = state.answers[state.index];
  const question = questions[state.index];

  if (finished) return <section className="game-result" aria-labelledby="result-heading">
    <span className="result-art" aria-hidden="true">✦</span><span className="eyebrow">ONE LITTLE ADVENTURE, COMPLETE</span>
    <h2 id="result-heading" ref={heading} tabIndex={-1}>{score === questions.length ? 'Look at you grow!' : 'A little wiser already.'}</h2>
    <p>Every word is a step forward. Keep that curiosity going.</p>
    <div className="result-score"><strong>{score}<span> / {questions.length}</span></strong><span>correct answers</span></div>
    <div className="result-actions"><button className="primary-button" onClick={() => { setState(advanceGame(state, { type: 'restart' }, questions)); }}>Play again <span aria-hidden="true">↻</span></button><a className="secondary-button" href={backHref}>Back to topics</a></div>
  </section>;

  return <section className="game-shell" aria-labelledby="question-heading">
    <div className="game-progress-label"><span>YOUR LITTLE WORD ADVENTURE</span><strong>{state.index + 1} / {questions.length}</strong></div>
    <progress className="progress-bar" value={state.answers.length} max={questions.length} aria-label={`${state.answers.length} of ${questions.length} questions answered`} />
    <div className="question-card"><span className="question-tag">CHOOSE THE MEANING</span><h3 id="question-heading" ref={heading} tabIndex={-1}>{question.prompt}</h3><p>What does this word mean in Vietnamese?</p></div>
    <div className="answer-grid">{question.options.map((option, index) => {
      const correct = answer !== undefined && option === question.correctAnswer;
      const wrong = answer === option && !correct;
      return <button key={option} disabled={answer !== undefined} className={`answer-button${correct ? ' correct' : ''}${wrong ? ' incorrect' : ''}`} onClick={() => setState(advanceGame(state, { type: 'answer', answer: option }, questions))}>
        <span className="answer-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span><span lang="vi">{option}</span><span className="answer-symbol" aria-hidden="true">{correct ? '✓' : wrong ? '×' : ''}</span>
      </button>;
    })}</div>
    <div className="game-controls"><div className="answer-feedback" role="status">{answer !== undefined ? <><strong>{answer === question.correctAnswer ? '✓ Nicely done!' : '↗ A new word to remember.'}</strong><span>{answer === question.correctAnswer ? 'That’s the right meaning.' : <>The answer is <span lang="vi">{question.correctAnswer}</span>.</>}</span></> : <span>Take your time. You've got this.</span>}</div>
      <button className="primary-button" disabled={answer === undefined} onClick={() => setState(advanceGame(state, { type: 'next' }, questions))}>{state.index === questions.length - 1 ? 'See results' : 'Next word'} <span aria-hidden="true">→</span></button>
    </div>
    <p className="keyboard-note">Use Tab to move between answers and Enter to choose.</p>
  </section>;
}
