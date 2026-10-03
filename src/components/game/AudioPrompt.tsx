import { useEffect, useRef, useState } from 'react';
import type { Messages } from '../../i18n';

export default function AudioPrompt({ src, t }: { src: string; t: Messages }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => { const element = audio.current; return () => { element?.pause(); }; }, []);
  async function play() {
    const element = audio.current;
    if (!element) return;
    try { if (element.error) element.load(); element.currentTime = 0; await element.play(); setError(false); }
    catch { setPlaying(false); setError(true); }
  }
  return <div className="audio-prompt">
    <audio ref={audio} src={src} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onError={() => { setPlaying(false); setError(true); }} />
    <button className="primary-button audio-button" onClick={play}><span aria-hidden="true">♫</span> {playing ? t.replay : t.listen}</button>
    <p>{t.audioVoice}</p>
    {error && <p className="notice" role="status">{t.audioError}</p>}
  </div>;
}
