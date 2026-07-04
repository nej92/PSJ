'use client';

import { useState } from 'react';
import { addMediaAction } from '@/actions/media';
import { normalizeText } from '@/lib/normalize';
import { X } from 'lucide-react';

export default function AddMediaModal({ defaultType, onClose }: { defaultType: string, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState(defaultType);
  const [genre, setGenre] = useState('');
  const [actor, setActor] = useState('');
  const [director, setDirector] = useState('');
  const [developer, setDeveloper] = useState('');

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    await addMediaAction(null, formData);
    setLoading(false);
    onClose();
  }

  const handleGenreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const normalized = normalizeText(e.target.value);
    setGenre(normalized);
  };

  const showActorFields = selectedType === 'MOVIE' || selectedType === 'TV_SERIES';
  const showDeveloperField = selectedType === 'VIDEO_GAME';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fade-in" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X /></button>
        <h2 style={{marginBottom: '1.5rem'}}>Agregar nuevo</h2>
        <form action={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tipo</label>
            <select
              name="type"
              className="form-input"
              defaultValue={defaultType}
              required
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="MOVIE">Película</option>
              <option value="TV_SERIES">Serie</option>
              <option value="VIDEO_GAME">Videojuego</option>
              <option value="ANIME">Anime</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Título</label>
            <input type="text" name="title" className="form-input" required />
          </div>

          <div style={{display: 'flex', gap: '1rem'}}>
            <div className="form-group" style={{flex: 1}}>
              <label className="form-label">Año</label>
              <input type="number" name="releaseYear" className="form-input" min="1900" max="2100" />
            </div>
            <div className="form-group" style={{flex: 1}}>
              <label className="form-label">Calificación (1-5)</label>
              <input type="number" name="rating" className="form-input" min="1" max="5" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Género</label>
            <input type="text" name="genre" className="form-input" placeholder="Ej. acción, drama, RPG" value={genre} onChange={handleGenreChange} />
          </div>

          <div className="form-group">
            <label className="form-label">URL de imagen</label>
            <input type="url" name="coverImage" className="form-input" placeholder="https://..." />
          </div>

          {showActorFields && (
            <>
              <div className="form-group">
                <label className="form-label">Actor principal</label>
                <input type="text" name="actor" className="form-input" placeholder="Nombre del actor" value={actor} onChange={e => setActor(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Director</label>
                <input type="text" name="director" className="form-input" placeholder="Nombre del director" value={director} onChange={e => setDirector(e.target.value)} />
              </div>
            </>
          )}

          {showDeveloperField && (
            <div className="form-group">
              <label className="form-label">Desarrollador</label>
              <input type="text" name="developer" className="form-input" placeholder="Nombre del desarrollador" value={developer} onChange={e => setDeveloper(e.target.value)} />
            </div>
          )}

          <div style={{display: 'flex', gap: '2rem', marginTop: '1rem'}}>
            <label className="checkbox-group">
              <input type="checkbox" name="isFavorite" />
              <span>Marcar como favorito</span>
            </label>

            <label className="checkbox-group">
              <input type="checkbox" name="toWatch" />
              <span title="Aplica para películas, series y animes">Por ver / Por jugar</span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '1.5rem', padding: '1rem'}} disabled={loading}>
            {loading ? 'Agregando...' : 'Agregar'}
          </button>
        </form>
      </div>
    </div>
  );
}
