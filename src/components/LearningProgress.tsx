import { useEffect, useState } from 'react';
import { vocabularyTargets } from '../config/course';
import { emptyMemory, learningCounts, learningStatus } from '../game/learning';
import { learningStore } from '../services/progress';
import { messages, topicLabel, type Locale } from '../i18n';
import type { Topic, Word } from '../types/content';

export default function LearningProgress({ words, topics, locale }: { words: Word[]; topics: Topic[]; locale: Locale }) {
  const [memory, setMemory] = useState(emptyMemory);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(0);
  const t = messages[locale];
  useEffect(() => {
    const refresh = () => { setMemory(learningStore.get()); setNow(Date.now()); setReady(true); };
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    const timer = window.setInterval(refresh, 60_000);
    return () => { window.removeEventListener('storage', refresh); window.removeEventListener('focus', refresh); window.clearInterval(timer); };
  }, []);
  if (!ready) return <p role="status">{t.loading}</p>;
  const core = words.filter(word => word.curriculum === 'oxford-3000');
  const counts = learningCounts(core, memory, now);
  const practice = counts.statuses.review ? 'review' : counts.statuses.unseen ? 'study' : 'free';
  const target = vocabularyTargets.find(target => counts.mastered < target) ?? vocabularyTargets.at(-1)!;
  const studied = core.filter(word => Object.hasOwn(memory.words, word.id));
  const nextDue = studied.filter(word => memory.words[word.id].dueAt > now).sort((a, b) => memory.words[a.id].dueAt - memory.words[b.id].dueAt)[0];
  return <div className="learning-progress">
    <section className="learning-summary" aria-labelledby="memory-heading">
      <h2 id="memory-heading">{t.learningStates.mastered}</h2>
      <p className="vocabulary-total"><strong>{counts.mastered}</strong> / {target.toLocaleString(locale)}</p>
      <progress value={counts.mastered} max={target} aria-label={t.learningProgress} />
      <p>{core.length} {t.availableDemo}</p>
      <dl className="memory-counts">{Object.entries(counts.statuses).map(([status, count]) => <div key={status}><dt>{t.learningStates[status as keyof typeof t.learningStates]}</dt><dd>{count}</dd></div>)}</dl>
      <a className="primary-button" href={`/${locale}/games/word-match?practice=${practice}`}>{practice === 'review' ? t.reviewNow : practice === 'study' ? t.study : t.free} →</a>
      {nextDue && <p className="next-review">{t.nextReview}: <time dateTime={new Date(memory.words[nextDue.id].dueAt).toISOString()}>{new Date(memory.words[nextDue.id].dueAt).toLocaleString(locale)}</time></p>}
      <p>{t.localOnly}</p>
    </section>
    <h2>{t.topicProgress}</h2>
    <div className="topic-progress-grid">{topics.map(topic => {
      const group = core.filter(word => word.topics.includes(topic.id));
      const progress = learningCounts(group, memory, now);
      if (!progress.total) return null;
      const practice = progress.statuses.review ? 'review' : progress.statuses.unseen ? 'study' : 'free';
      return <section key={topic.id} className="topic-progress-card"><h3>{topic.icon} {topicLabel(locale, topic.id)}</h3><p><strong>{progress.mastered} / {progress.total}</strong> {t.remembered}{progress.complete && ` · ✓ ${t.topicComplete}`}</p><progress value={progress.mastered} max={progress.total} aria-label={topicLabel(locale, topic.id)} /><p>{progress.statuses.review} {t.due} · {progress.statuses.unseen} {t.learningStates.unseen}</p><div className="topic-progress-links"><a href={`/${locale}/games/word-match?topic=${topic.id}&practice=${practice}`}>{practice === 'review' ? t.reviewNow : practice === 'study' ? t.study : t.free} →</a><a href={`/${locale}/learn/vocabulary/${topic.id}`}>{t.wordList}</a></div></section>;
    })}</div>
    {studied.length > 0 && <details className="word-memory-list"><summary>{t.studiedWords} ({studied.length})</summary><ul>{studied.map(word => { const status = learningStatus(memory.words[word.id], now); return <li key={word.id}><strong lang="en">{word.word}</strong><span>{t.learningStates[status]} · {memory.words[word.id].successes} / 3</span></li>; })}</ul></details>}
  </div>;
}
