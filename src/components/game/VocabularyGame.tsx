import { messages, type Locale, type Messages } from '../../i18n';
import { useEffect, useRef, useState } from 'react';
import AudioPrompt from './AudioPrompt';
import { getStats, isCorrectAnswer, type ChoiceQuestion, type GameAction, type TypingQuestion, type VocabularySession } from '../../game/vocabulary';

function MultipleChoiceRenderer({ question, answer, onAnswer, t }: { question: ChoiceQuestion; answer?: string; onAnswer: (answer: string) => void; t: Messages }) {
  return <div className="answer-grid">{question.options.map((option, index) => {
    const correct = answer !== undefined && option === question.correctAnswer;
    const wrong = answer === option && !correct;
    const image = question.optionImages?.find(image => image.answer === option);
    return <button key={option} disabled={answer !== undefined} className={`answer-button${image ? ' image-answer' : ''}${correct ? ' correct' : ''}${wrong ? ' incorrect' : ''}`} onClick={() => onAnswer(option)}>
      <span className="answer-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span>{image && <img src={image.url} alt={image.alt} width="160" height="120" />}<span className="answer-content">{(!image || answer !== undefined) && <span lang={question.answerLanguage}>{option}</span>}{(correct || wrong) && <small>{correct ? t.correctAnswer : t.wrongAnswer}</small>}</span><span className="answer-symbol" aria-hidden="true">{correct ? '✓' : wrong ? '×' : ''}</span>
    </button>;
  })}</div>;
}

function TypingRenderer({ question, answer, onAnswer, t }: { question: TypingQuestion; answer?: string; onAnswer: (answer: string) => void; t: Messages }) {
  const [draft, setDraft] = useState(answer ?? '');
  return <form className="typing-answer" onSubmit={event => { event.preventDefault(); if (draft.trim() && answer === undefined) onAnswer(draft); }}>
    <label htmlFor="typed-answer">{t.typedAnswer}</label>
    <div className="typing-controls"><input id="typed-answer" lang={question.answerLanguage} value={draft} onChange={event => setDraft(event.target.value)} disabled={answer !== undefined} autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={100} />
      <button className="primary-button" type="submit" disabled={answer !== undefined || !draft.trim()}>{t.check}</button></div>
    <p>{t.typingHint}</p>
  </form>;
}

export default function VocabularyGame({ session, topicName, gameName, locale, onAction, onBack, onNewRound }: { session: VocabularySession; topicName: string; gameName: string; locale: Locale; onNewRound?: () => void; onAction: (action: GameAction) => void; onBack: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const { state, questions, config } = session;
  const stats = getStats(session);
  const t = messages[locale];
  useEffect(() => {
    if (state.answers[state.index] !== undefined) nextButton.current?.focus();
    else heading.current?.focus();
  }, [state.index, state.answers]);

  if (stats.finished) return <section className="game-result" aria-labelledby="result-heading">
    <span className="result-art" aria-hidden="true">★</span><span className="eyebrow">{topicName} · {t.complete}</span>
    <h3 id="result-heading" ref={heading} tabIndex={-1}>{stats.correct === stats.total ? t.perfect : t.nice}</h3>
    <p>{gameName}</p>
    <div className="result-score"><strong>{stats.correct}<span> / {stats.total}</span></strong><span>{t.wordsCorrect}</span></div>
    <dl className="result-stats"><div><dt>{t.correct}</dt><dd>{stats.correct}</dd></div><div><dt>{t.incorrect}</dt><dd>{stats.incorrect}</dd></div><div><dt>{t.accuracy}</dt><dd>{stats.percentage}%</dd></div></dl>
    <div className="result-actions"><button className="primary-button" onClick={() => onAction({ type: 'restart' })}>{t.again} <span aria-hidden="true">↻</span></button>{onNewRound && <button className="primary-button" onClick={onNewRound}>{t.nextRound} →</button>}<button className="secondary-button" onClick={onBack}>{t.back}</button></div>
  </section>;

  const question = questions[state.index];
  const answer = state.answers[state.index];
  const correct = answer !== undefined && isCorrectAnswer(question, answer);
  return <section className="game-shell" aria-labelledby="question-heading">
    <div className="session-toolbar"><button className="text-button" onClick={onBack}>← {t.back}</button><span className="session-topic">{topicName}</span><span className="session-mode">{gameName}</span></div>
    <div className="round-progress">
      <span className="round-count">{t.word} <strong>{state.index + 1} / {stats.total}</strong></span>
      <progress className="visually-hidden" value={stats.completed} max={stats.total} aria-label={`${stats.completed} / ${stats.total} ${t.completed}`} />
      <ol className="word-steps" aria-label={t.roundWords}>{questions.map((_, index) => <li key={index} className={`${index < stats.completed ? 'completed' : 'upcoming'}${index === state.index ? ' current' : ''}`} aria-current={index === state.index ? 'step' : undefined}>
        <span aria-hidden="true">{index < stats.completed ? '✓' : index + 1}</span><span className="visually-hidden">{t.word} {index + 1}: {index < stats.completed ? t.completed : index === state.index ? t.current : t.upcoming}</span>
      </li>)}</ol>
    </div>
    <div className={`question-card${question.kind === 'choice' && (question.image || question.audio) ? ' image-question' : ''}`}>
      <span className="visually-hidden">{config.mode === 'listen-to-image' ? t.listenInstruction : config.mode === 'type-the-word' ? t.typeInstruction : config.mode === 'word-to-meaning' ? t.meaningInstruction : t.wordInstruction}</span>
      <h3 id="question-heading" ref={heading} tabIndex={-1} lang={config.mode === 'image-to-word' || config.mode === 'listen-to-image' ? locale : question.promptLanguage}>{config.mode === 'listen-to-image' ? t.listenInstruction : config.mode === 'image-to-word' ? t.pictureInstruction : question.prompt}</h3>
      {question.kind === 'choice' && question.audio && <AudioPrompt key={`${question.id}-${state.index}-${answer === undefined ? 'open' : 'answered'}`} src={question.audio} t={t} />}
      {question.kind === 'choice' && question.image && <img className="question-image" src={question.image.url} alt={question.image.alt} width="240" height="180" />}
    </div>
    {question.kind === 'choice' ? <MultipleChoiceRenderer t={t} question={question} answer={answer} onAnswer={answer => onAction({ type: 'answer', answer })} /> : <TypingRenderer t={t} key={`${question.id}-${state.index}`} question={question} answer={answer} onAnswer={answer => onAction({ type: 'answer', answer })} />}
    <div className="game-controls"><div className={`answer-feedback${answer === undefined ? '' : correct ? ' feedback-correct' : ' feedback-incorrect'}`} role="status">{answer !== undefined && <><strong>{correct ? t.yes : t.no}</strong>{!correct && <span>{t.correctAnswer}: <strong lang={question.answerLanguage}>{question.correctAnswer}</strong></span>}</>}</div>
      <button ref={nextButton} className="primary-button" disabled={answer === undefined} onClick={() => onAction({ type: 'next' })}>{state.index === stats.total - 1 ? t.results : t.next} <span aria-hidden="true">→</span></button>
    </div>
    <p className="visually-hidden">{t.keyboardHint}</p>
  </section>;
}
