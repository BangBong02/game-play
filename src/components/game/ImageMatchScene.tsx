import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react';
import { isCorrectAnswer, matchBoardEnd, type GameAction, type MatchingQuestion, type VocabularySession } from '../../game/vocabulary';
import type { Messages } from '../../i18n';
import type { MatchLayout, createImageMatchScene } from './matchSceneRenderer';
import ImageMatchBoard from './ImageMatchBoard';

type Scene = NonNullable<Awaited<ReturnType<typeof createImageMatchScene>>>;
export default function ImageMatchScene({ session, onAction, t, audioUrls, locale, muted, onToggleSound }: { session: VocabularySession; onAction: (action: GameAction) => void; t: Messages; audioUrls: Record<string, string>; locale: 'en' | 'vi'; muted: boolean; onToggleSound: () => void }) {
  const vi = locale === 'vi';
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<Scene | null>(null);
  const wordsGroup = useRef<HTMLDivElement>(null);
  const picturesGroup = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; pointer: number; startX: number; startY: number; moved: boolean } | null>(null);
  const handledPointer = useRef<number | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const sound = useRef<AudioContext | null>(null);
  const [layout, setLayout] = useState<MatchLayout | null>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [selection, setSelection] = useState<{ kind: 'word' | 'image'; id: string } | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const current = useRef({ session, muted });
  current.current = { session, muted };
  const board = session.questions.slice(session.state.index, matchBoardEnd(session.state.index, session.questions.length)) as MatchingQuestion[];
  const images = [...board].sort((a, b) => session.imageOrder!.indexOf(a.id) - session.imageOrder!.indexOf(b.id));
  const answers = board.map((_, i) => session.state.answers[session.state.index + i] ?? '');
  const corrections = board.filter((q, i) => answers[i] && !isCorrectAnswer(q, answers[i]));
  const answerFor = (id: string) => answers[board.findIndex(q => q.id === id)];
  const boardKey = `${session.id}:${session.state.index}`;
  useEffect(() => {
    if (failed) return;
    let canceled = false;
    let owned: Scene | null = null;
    import('./matchSceneRenderer').then(module => module.createImageMatchScene(host.current!, board, images, next => { if (!canceled) { drag.current = null; setLayout(next); } }, () => { if (!canceled) setFailed(true); }, () => canceled)).then(created => {
      owned = created;
      if (canceled) { created?.destroy(); return; }
      scene.current = created;
      if (created) setReady(true);
    }).catch(() => { if (!canceled) setFailed(true); });
    return () => { canceled = true; owned?.destroy(); scene.current = null; drag.current = null; };
    // Board content/order is immutable for one persisted round.
  }, [boardKey, failed]);
  useEffect(() => { scene.current?.update(answers, selection?.kind === 'word' ? selection.id : null); }, [session.state.answers, selection, ready]);
  useLayoutEffect(() => {
    if (ready && answers.some(answer => !answer)) wordsGroup.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus({ preventScroll: true });
  }, [session.state.answers, ready]);
  useLayoutEffect(() => {
    if (selection) (selection.kind === 'word' ? picturesGroup : wordsGroup).current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus({ preventScroll: true });
  }, [selection]);
  useEffect(() => () => { audio.current?.pause(); audio.current = null; if (sound.current && sound.current.state !== 'closed') void sound.current.close(); }, []);
  useEffect(() => {
    if (muted) audio.current?.pause();
    if (sound.current) void (muted ? sound.current.suspend() : sound.current.resume()).catch(() => setAudioError('sound'));
  }, [muted]);

  function pronunciation(id: string) {
    audio.current?.pause();
    setAudioError(null);
    if (current.current.muted || !audioUrls[id]) return;
    const player = new Audio(audioUrls[id]);
    audio.current = player;
    void player.play().catch(() => { if (audio.current === player && !current.current.muted) setAudioError(id); });
  }
  function cue(correct: boolean) {
    if (current.current.muted) return;
    try {
      const ctx = sound.current ??= new AudioContext();
      void ctx.resume().then(() => {
        if (ctx.state === 'closed' || current.current.muted) return;
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(correct ? 660 : 180, ctx.currentTime);
        gain.gain.setValueAtTime(.035, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .12);
        oscillator.connect(gain); gain.connect(ctx.destination);
        oscillator.start(); oscillator.stop(ctx.currentTime + .13);
      }).catch(() => setAudioError('sound'));
    } catch { setAudioError('sound'); }
  }
  function match(word: MatchingQuestion, image: MatchingQuestion) {
    const latest = current.current.session;
    if (latest.state.answers[latest.questions.findIndex(q => q.id === word.id)]) return;
    onAction({ type: 'match', id: word.id, answer: image.correctAnswer });
    const correct = word.id === image.id;
    cue(correct);
    if (correct) pronunciation(word.id);
    setSelection(null);
  }
  function selectWord(question: MatchingQuestion) {
    if (selection?.kind === 'image') { match(question, images.find(q => q.id === selection.id)!); return; }
    setSelection(selection?.id === question.id ? null : { kind: 'word', id: question.id });
  }
  function selectImage(question: MatchingQuestion) {
    if (selection?.kind === 'word') { match(board.find(q => q.id === selection.id)!, question); return; }
    setSelection(selection?.id === question.id ? null : { kind: 'image', id: question.id });
  }
  function pointerDown(event: PointerEvent<HTMLButtonElement>, id: string) {
    if (!event.isPrimary || event.button !== 0 || !ready) return;
    drag.current = { id, pointer: event.pointerId, startX: event.clientX, startY: event.clientY, moved: false };
    handledPointer.current = null;
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function pointerMove(event: PointerEvent<HTMLButtonElement>) {
    const active = drag.current;
    if (!active || active.pointer !== event.pointerId) return;
    if (Math.hypot(event.clientX - active.startX, event.clientY - active.startY) < 8 && !active.moved) return;
    active.moved = true;
    const box = host.current!.getBoundingClientRect();
    scene.current?.drag(active.id, event.clientX - box.left, event.clientY - box.top);
  }
  function pointerEnd(event: PointerEvent<HTMLButtonElement>, canceled = false) {
    const active = drag.current;
    if (!active || active.pointer !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (active.moved) {
      event.preventDefault();
      if (!canceled) {
        const target = [...(wordsGroup.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])].find(button => { const box = button.getBoundingClientRect(); return event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom; });
        if (target) match(board.find(q => q.id === target.dataset.wordId)!, images.find(q => q.id === active.id)!);
      }
      handledPointer.current = event.pointerId;
    } else if (!canceled && event.pointerType === 'touch') {
      // Touch selection uses the completed gesture, independent of compatibility-click synthesis.
      event.preventDefault();
      handledPointer.current = event.pointerId;
      selectImage(images.find(q => q.id === active.id)!);
    }
    scene.current?.release();
  }
  if (failed) return <><p className="notice" role="status">{vi ? 'Scene chưa tải được. Bạn vẫn chơi được bằng giao diện đơn giản.' : 'The scene could not load. You can keep playing in Simple view.'}</p><ImageMatchBoard session={session} onAction={onAction} t={t} /></>;
  return <div className="match-scene-game">
    <div className="scene-hud"><p role="status">{selection?.kind === 'word' ? t.pickImage : selection?.kind === 'image' ? vi ? 'Chọn từ để ghép hình.' : 'Pick a word for this picture.' : vi ? 'Kéo hình vào từ · hoặc chạm để ghép' : 'Drag pictures to words · or tap to match'}</p><button className="scene-mute" aria-pressed={muted} onClick={onToggleSound}>{muted ? vi ? 'Âm thanh tắt' : 'Sound off' : vi ? 'Âm thanh bật' : 'Sound on'}</button></div>
    <div className="match-scene" style={{ height: layout?.height ?? 400 }} aria-busy={!ready}>
      <div ref={host} className="match-canvas-host" />
      {!ready && <p className="scene-loading" role="status">{t.loading}</p>}
      {layout && <>
        <div ref={picturesGroup} role="group" aria-label={t.pickImage}>{images.map((question, i) => <button key={question.id} className={`scene-picture${selection?.id === question.id ? ' selected' : ''}`} data-image-id={question.id} aria-label={question.image.alt} aria-pressed={selection?.id === question.id} disabled={!ready || !!answerFor(question.id)} style={{ left: layout.pictures[i].x, top: layout.pictures[i].y, width: layout.pictures[i].width, height: layout.pictures[i].height }} onPointerDown={event => pointerDown(event, question.id)} onPointerMove={pointerMove} onPointerUp={event => pointerEnd(event)} onPointerCancel={event => pointerEnd(event, true)} onLostPointerCapture={event => { if (drag.current) pointerEnd(event, true); }} onClick={event => { if ('pointerId' in event.nativeEvent && event.nativeEvent.pointerId === handledPointer.current) return; selectImage(question); }}><span className="visually-hidden">{question.image.alt}</span></button>)}</div>
        <div ref={wordsGroup} role="group" aria-label={t.pickWord}>{board.map((question, i) => <button key={question.id} className={`scene-word${answers[i] ? ' answered' : ''}`} data-word-id={question.id} aria-pressed={selection?.id === question.id} disabled={!ready || !!answers[i]} style={{ left: layout.words[i].x, top: layout.words[i].y, width: layout.words[i].width, height: layout.words[i].height }} onPointerDown={() => { handledPointer.current = null; }} onPointerUp={event => { if (event.isPrimary && event.pointerType === 'touch') { event.preventDefault(); handledPointer.current = event.pointerId; selectWord(question); } }} onClick={event => { if ('pointerId' in event.nativeEvent && event.nativeEvent.pointerId === handledPointer.current) return; selectWord(question); }}><span lang="en">{question.correctAnswer}</span>{answers[i] && <span aria-hidden="true">{isCorrectAnswer(question, answers[i]) ? ' ✓' : ' ×'}</span>}</button>)}</div>
      </>}
    </div>
    {corrections.length > 0 && <p className="notice" role="status">{t.matchCorrection} <strong lang="en">{corrections.map(q => q.correctAnswer).join(', ')}</strong></p>}
    {audioError && <p className="notice" role="status">{vi ? 'Âm thanh chưa phát được.' : 'Audio could not play.'} {audioError !== 'sound' && <button className="text-button" onClick={() => pronunciation(audioError)}>{vi ? 'Thử lại' : 'Retry'}</button>}</p>}
  </div>;
}
