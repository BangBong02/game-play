import { useEffect, useRef, useState } from 'react';
import { gameModes, getStats, isCorrectAnswer, type ChoiceQuestion, type GameAction, type TypingQuestion, type VocabularySession } from '../../game/vocabulary';

function MultipleChoiceRenderer({ question, answer, onAnswer }: { question: ChoiceQuestion; answer?: string; onAnswer: (answer: string) => void }) {
  return <div className="answer-grid">{question.options.map((option, index) => {
    const correct = answer !== undefined && option === question.correctAnswer;
    const wrong = answer === option && !correct;
    return <button key={option} disabled={answer !== undefined} className={`answer-button${correct ? ' correct' : ''}${wrong ? ' incorrect' : ''}`} onClick={() => onAnswer(option)}>
      <span className="answer-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span><span lang={question.answerLanguage}>{option}</span><span className="answer-symbol" aria-hidden="true">{correct ? '✓' : wrong ? '×' : ''}</span>
    </button>;
  })}</div>;
}

function TypingRenderer({ question, answer, onAnswer }: { question: TypingQuestion; answer?: string; onAnswer: (answer: string) => void }) {
  const [draft, setDraft] = useState(answer ?? '');
  return <form className="typing-answer" onSubmit={event => { event.preventDefault(); if (draft.trim() && answer === undefined) onAnswer(draft); }}>
    <label htmlFor="typed-answer">Your English word</label>
    <div className="typing-controls"><input id="typed-answer" lang={question.answerLanguage} value={draft} onChange={event => setDraft(event.target.value)} disabled={answer !== undefined} autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={100} />
      <button className="primary-button" type="submit" disabled={answer !== undefined || !draft.trim()}>Check answer</button></div>
    <p>Press Enter to check. Capital letters and spaces at the ends are okay.</p>
  </form>;
}

export default function VocabularyGame({ session, onAction, onBack }: { session: VocabularySession; onAction: (action: GameAction) => void; onBack: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const { state, questions, config } = session;
  const stats = getStats(session);
  const mode = gameModes.find(mode => mode.id === config.mode)!;
  useEffect(() => { heading.current?.focus(); }, [state.index]);

  if (stats.finished) return <section className="game-result" aria-labelledby="result-heading">
    <span className="result-art" aria-hidden="true">✦</span><span className="eyebrow">{mode.name} · COMPLETE</span>
    <h3 id="result-heading" ref={heading} tabIndex={-1}>{stats.correct === stats.total ? 'Look at you grow!' : 'A little wiser already.'}</h3>
    <p>Every word is a step forward. Keep that curiosity going.</p>
    <div className="result-score"><strong>{stats.correct}<span> / {stats.total}</span></strong><span>correct answers · {stats.percentage}% accuracy</span><span>{stats.incorrect} incorrect</span></div>
    <div className="result-actions"><button className="primary-button" onClick={() => onAction({ type: 'restart' })}>Play again <span aria-hidden="true">↻</span></button><button className="secondary-button" onClick={onBack}>Back to topic</button></div>
  </section>;

  const question = questions[state.index];
  const answer = state.answers[state.index];
  const correct = answer !== undefined && isCorrectAnswer(question, answer);
  return <section className="game-shell" aria-labelledby="question-heading">
    <div className="session-toolbar"><span>{mode.name}</span><button className="text-button" onClick={onBack}>Choose another game</button></div>
    <div className="game-progress-label"><span>YOUR LITTLE WORD ADVENTURE</span><strong>{state.index + 1} / {stats.total}</strong></div>
    <progress className="progress-bar" value={stats.completed} max={stats.total} aria-label={`${stats.completed} of ${stats.total} questions answered`} />
    <p className="game-score">Correct: {stats.correct} · Incorrect: {stats.incorrect}</p>
    <div className={`question-card${question.kind === 'choice' && question.image ? ' image-question' : ''}`}>
      <span className="question-tag">{config.mode === 'type-the-word' ? 'TYPE THE ENGLISH WORD' : config.mode === 'word-to-meaning' ? 'CHOOSE THE MEANING' : 'CHOOSE THE ENGLISH WORD'}</span>
      <h3 id="question-heading" ref={heading} tabIndex={-1} lang={question.promptLanguage}>{question.prompt}</h3>
      {question.kind === 'choice' && question.image && <img className="question-image" src={question.image.url} alt={question.image.alt} width="240" height="180" />}
    </div>
    {question.kind === 'choice' ? <MultipleChoiceRenderer question={question} answer={answer} onAnswer={answer => onAction({ type: 'answer', answer })} /> : <TypingRenderer key={`${question.id}-${state.index}`} question={question} answer={answer} onAnswer={answer => onAction({ type: 'answer', answer })} />}
    <div className="game-controls"><div className="answer-feedback" role="status">{answer !== undefined ? <><strong>{correct ? '✓ Correct! Nicely done.' : '× Incorrect. A new word to remember.'}</strong><span>{correct ? 'Keep going!' : <>The answer is <span lang={question.answerLanguage}>{question.correctAnswer}</span>.</>}</span></> : <span>Take your time. You've got this.</span>}</div>
      <button className="primary-button" disabled={answer === undefined} onClick={() => onAction({ type: 'next' })}>{state.index === stats.total - 1 ? 'See results' : 'Next word'} <span aria-hidden="true">→</span></button>
    </div>
    <p className="keyboard-note">Use Tab to move between controls and Enter to choose or check.</p>
  </section>;
}
