import { useState } from 'react';
import type { Messages } from '../../i18n';

export default function VocabularyImage({ source, t, width, height, className }: { source: { url: string; alt: string }; t: Messages; width: number; height: number; className?: string }) {
  const [error, setError] = useState(false);
  return error ? <span className="image-unavailable" role="status">{t.imageError}<span lang="en">{source.alt}</span></span> : <img className={className} src={source.url} alt={source.alt} width={width} height={height} onError={() => setError(true)} />;
}
