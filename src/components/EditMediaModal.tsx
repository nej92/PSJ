'use client';

import { useState } from 'react';
import { updateMediaAction } from '@/actions/media';
import { genresForType, type GenreCatalog } from '@/lib/genres';
import GenreSelect from './GenreSelect';
import { X } from 'lucide-react';
import { Media } from '@prisma/client';

export default function EditMediaModal({ media, genres, onClose }: { media: Media, genres: GenreCatalog, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actor, setActor] = useState(media.actor || '');
  const [director, setDirector] = useState(media.director || '');
  const [developer, setDeveloper] = useState(media.developer || '');

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError('');
    try {
      const result = await updateMediaAction(media.id, formData);
      if (result.error) setError(result.error);
      else onClose();
    } catch (error) {
      console.error('Error al actualizar contenido:', error);
      setError('No se pudo contactar al servidor. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  const showActorFields = media.type === 'MOVIE' || media.type === 'TV_SERIES';
  const showDirectorField = media.type === 'MOVIE' || media.type === 'TV_SERIES' || media.type === 'ANIME';
  const showDeveloperField = media.type === 'VIDEO_GAME';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fade-in" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X /></button>
        <h2 style={{marginBottom: '1.5rem'}}>Editar contenido</h2>
        <form action={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tipo</label>
            <input type="text" className="form-input" value={media.type} disabled />
          </div>
          
          <div className="form-group">
            <label className="form-label">Título</label>
            <input type="text" name="title" className="form-input" defaultValue={media.title} required />
          </div>

          <div style={{display: 'flex', gap: '1rem'}}>
            <div className="form-group" style={{flex: 1}}>
              <label className="form-label">Año</label>
              <input type="number" name="releaseYear" className="form-input" min="1900" max="2100" defaultValue={media.releaseYear || ''} />
            </div>
            <div className="form-group" style={{flex: 1}}>
              <label className="form-label">Calificación (1-5)</label>
              <input type="number" name="rating" className="form-input" min="1" max="5" defaultValue={media.rating || ''} />
            </div>
          </div>

          <GenreSelect genres={genresForType(genres, media.type)} initialValue={media.genre} />

          <div className="form-group">
            <label className="form-label">URL de imagen</label>
            <input type="url" name="coverImage" className="form-input" placeholder="https://..." defaultValue={media.coverImage || ''} />
          </div>

          {showActorFields && (
            <div className="form-group">
              <label className="form-label">Actor principal</label>
              <input type="text" name="actor" className="form-input" placeholder="Nombre del actor" value={actor} onChange={e => setActor(e.target.value)} />
            </div>
          )}

          {showDirectorField && (
            <div className="form-group">
              <label className="form-label">Director</label>
              <input type="text" name="director" className="form-input" placeholder="Nombre del director" value={director} onChange={e => setDirector(e.target.value)} />
            </div>
          )}

          {showDeveloperField && (
            <div className="form-group">
              <label className="form-label">Desarrollador</label>
              <input type="text" name="developer" className="form-input" placeholder="Nombre del desarrollador" value={developer} onChange={e => setDeveloper(e.target.value)} />
            </div>
          )}

          <div style={{display: 'flex', gap: '2rem', marginTop: '1rem'}}>
            <label className="checkbox-group">
              <input type="checkbox" name="isFavorite" defaultChecked={media.isFavorite} />
              <span>Marcar como favorito</span>
            </label>

            {(media.type === 'MOVIE' || media.type === 'TV_SERIES' || media.type === 'ANIME' || media.type === 'VIDEO_GAME') && (
              <label className="checkbox-group">
                <input type="checkbox" name="toWatch" defaultChecked={media.toWatch || false} />
                <span>{media.type === 'VIDEO_GAME' ? 'Por jugar' : 'Por ver'}</span>
              </label>
            )}
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '1.5rem', padding: '1rem'}} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}
