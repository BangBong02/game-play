import { useEffect, useRef, useState } from 'react';
import { gameModes, getStats, isCorrectAnswer, type ChoiceQuestion, type GameAction, type TypingQuestion, type VocabularySession } from '../../game/vocabulary';

function MultipleChoiceRenderer({ question, answer, onAnswer }: { question: ChoiceQuestion; answer?: string; onAnswer: (answer: string) => void }) {
  return <div className="answer-grid">{question.options.map((option, index) => {
    const correct = answer !== undefined && option === question.correctAnswer;
    const wrong = answer === option && !correct;
    return <button key={option} disabled={answer !== undefined} className={`answer-button${correct ? ' correct' : ''}${wrong ? ' incorrect' : ''}`} onClick={() => onAnswer(option)}>
      <span className="answer-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span><span className="answer-content"><span lang={question.answerLanguage}>{option}</span>{(correct || wrong) && <small>{correct ? 'Correct answer' : 'Your answer · Not quite'}</small>}</span><span className="answer-symbol" aria-hidden="true">{correct ? '✓' : wrong ? '×' : ''}</span>
    </button>;
  })}</div>;
}

function TypingRenderer({ question, answer, onAnswer }: { question: TypingQuestion; answer?: string; onAnswer: (answer: string) => void }) {
  const [draft, setDraft] = useState(answer ?? '');
  return <form className="typing-answer" onSubmit={event => { event.preventDefault(); if (draft.trim() && answer === undefined) onAnswer(draft); }}>
    <label htmlFor="typed-answer">Your English word</label>
    <div className="typing-controls"><input id="typed-answer" lang={question.answerLanguage} value={draft} onChange={event => setDraft(event.target.value)} disabled={answer !== undefined} autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={100} />
      <button className="primary-button" type="submit" disabled={answer !== undefined || !draft.trim()}>Check answer</button></div>
    <p>Enter to check · Capital letters are okay.</p>
  </form>;
}

export default function VocabularyGame({ session, topicName, levelName, onAction, onBack }: { session: VocabularySession; topicName: string; levelName: string; onAction: (action: GameAction) => void; onBack: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const { state, questions, config } = session;
  const stats = getStats(session);
  const mode = gameModes.find(mode => mode.id === config.mode)!;
  useEffect(() => {
    if (state.answers[state.index] !== undefined) nextButton.current?.focus();
    else heading.current?.focus();
  }, [state.index, state.answers]);

  if (stats.finished) return <section className="game-result" aria-labelledby="result-heading">
    <span className="result-art" aria-hidden="true">★</span><span className="eyebrow">{topicName} · ROUND COMPLETE</span>
    <h3 id="result-heading" ref={heading} tabIndex={-1}>{stats.correct === stats.total ? 'You know your words!' : 'Nice practice!'}</h3>
    <p>{levelName} · Vocabulary · {mode.name}</p>
    <div className="result-score"><strong>{stats.correct}<span> / {stats.total}</span></strong><span>words answered correctly</span></div>
    <dl className="result-stats"><div><dt>Correct</dt><dd>{stats.correct}</dd></div><div><dt>Incorrect</dt><dd>{stats.incorrect}</dd></div><div><dt>Accuracy</dt><dd>{stats.percentage}%</dd></div></dl>
    <div className="result-actions"><button className="primary-button" onClick={() => onAction({ type: 'restart' })}>Play again <span aria-hidden="true">↻</span></button><button className="secondary-button" onClick={onBack}>Back to topic</button></div>
  </section>;

  const question = questions[state.index];
  const answer = state.answers[state.index];
  const correct = answer !== undefined && isCorrectAnswer(question, answer);
  return <section className="game-shell" aria-labelledby="question-heading">
    <div className="session-toolbar"><button className="text-button" onClick={onBack}>← Games</button><span className="session-topic">{topicName}<small>{levelName} · Vocabulary</small></span><span className="session-mode">{mode.name}</span></div>
    <div className="round-progress">
      <span className="round-count">Word <strong>{state.index + 1} / {stats.total}</strong></span>
      <progress className="visually-hidden" value={stats.completed} max={stats.total} aria-label={`${stats.completed} of ${stats.total} words completed`} />
      <ol className="word-steps" aria-label="Words in this round">{questions.map((_, index) => <li key={index} className={`${index < stats.completed ? 'completed' : 'upcoming'}${index === state.index ? ' current' : ''}`} aria-current={index === state.index ? 'step' : undefined}>
        <span aria-hidden="true">{index < stats.completed ? '✓' : index + 1}</span><span className="visually-hidden">Word {index + 1}: {index < stats.completed ? 'completed' : index === state.index ? 'current' : 'up next'}</span>
      </li>)}</ol>
    </div>
    <div className={`question-card${question.kind === 'choice' && question.image ? ' image-question' : ''}`}>
      <span className="visually-hidden">{config.mode === 'type-the-word' ? 'Type the English word' : config.mode === 'word-to-meaning' ? 'Choose the meaning' : 'Choose the English word'}</span>
      <h3 id="question-heading" ref={heading} tabIndex={-1} lang={question.promptLanguage}>{question.prompt}</h3>
      {question.kind === 'choice' && question.image && <img className="question-image" src={question.image.url} alt={question.image.alt} width="240" height="180" />}
    </div>
    {question.kind === 'choice' ? <MultipleChoiceRenderer question={question} answer={answer} onAnswer={answer => onAction({ type: 'answer', answer })} /> : <TypingRenderer key={`${question.id}-${state.index}`} question={question} answer={answer} onAnswer={answer => onAction({ type: 'answer', answer })} />}
    <div className="game-controls"><div className={`answer-feedback${answer === undefined ? '' : correct ? ' feedback-correct' : ' feedback-incorrect'}`} role="status">{answer !== undefined && <><strong>{correct ? '✓ Correct!' : '× Not quite'}</strong>{!correct && <span>Correct answer: <strong lang={question.answerLanguage}>{question.correctAnswer}</strong></span>}</>}</div>
      <button ref={nextButton} className="primary-button" disabled={answer === undefined} onClick={() => onAction({ type: 'next' })}>{state.index === stats.total - 1 ? 'See results' : 'Next word'} <span aria-hidden="true">→</span></button>
    </div>
    <p className="visually-hidden">Tab to move between controls. Enter to answer or continue.</p>
  </section>;
}
