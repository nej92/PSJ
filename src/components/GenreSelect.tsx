'use client';

import { useState } from 'react';
import { legacyGenres, hasGenre } from '@/lib/genres';

export default function GenreSelect({ genres, initialValue = null }: { genres: string[], initialValue?: string | null }) {
  const [selected, setSelected] = useState(() => [
    ...genres.filter(genre => hasGenre(initialValue, genre)),
    ...legacyGenres(initialValue, genres),
  ]);
  const oldGenres = legacyGenres(initialValue, genres);

  function toggle(genre: string) {
    setSelected(current => current.includes(genre)
      ? current.filter(item => item !== genre)
      : [...current, genre]);
  }

  return (
    <div className="form-group">
      <label className="form-label">Géneros</label>
      <details>
        <summary className="form-input" style={{cursor: 'pointer'}}>
          {selected.length ? selected.join(', ') : 'Seleccionar géneros'}
        </summary>
        <div style={{display: 'grid', gap: '0.5rem', padding: '0.75rem', maxHeight: '15rem', overflowY: 'auto'}}>
          {[...genres, ...oldGenres].map(genre => (
            <label key={genre} className="checkbox-group">
              <input type="checkbox" name="genre" value={genre} checked={selected.includes(genre)} onChange={() => toggle(genre)} />
              <span>{genre}{oldGenres.includes(genre) ? ' (valor anterior)' : ''}</span>
            </label>
          ))}
        </div>
      </details>
    </div>
  );
}
