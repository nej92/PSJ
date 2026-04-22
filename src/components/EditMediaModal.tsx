'use client';

import { useState } from 'react';
import { updateMediaAction } from '@/actions/media';
import { normalizeText } from '@/lib/normalize';
import { X } from 'lucide-react';
import { Media } from '@prisma/client';

export default function EditMediaModal({ media, onClose }: { media: Media, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [genre, setGenre] = useState(media.genre || '');

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    await updateMediaAction(media.id, formData);
    setLoading(false);
    onClose();
  }

  const handleGenreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const normalized = normalizeText(e.target.value);
    setGenre(normalized);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fade-in" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X /></button>
        <h2 style={{marginBottom: '1.5rem'}}>Edit Media</h2>
        <form action={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Type</label>
            <input type="text" className="form-input" value={media.type} disabled />
          </div>
          
          <div className="form-group">
            <label className="form-label">Title</label>
            <input type="text" name="title" className="form-input" defaultValue={media.title} required />
          </div>

          <div style={{display: 'flex', gap: '1rem'}}>
            <div className="form-group" style={{flex: 1}}>
              <label className="form-label">Release Year</label>
              <input type="number" name="releaseYear" className="form-input" min="1900" max="2100" defaultValue={media.releaseYear || ''} />
            </div>
            <div className="form-group" style={{flex: 1}}>
              <label className="form-label">Rating (1-5)</label>
              <input type="number" name="rating" className="form-input" min="1" max="5" defaultValue={media.rating || ''} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Genre</label>
            <input type="text" name="genre" className="form-input" placeholder="e.g. Action, Sci-Fi, RPG" value={genre} onChange={handleGenreChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Cover Image URL</label>
            <input type="url" name="coverImage" className="form-input" placeholder="https://..." defaultValue={media.coverImage || ''} />
          </div>

          <div style={{display: 'flex', gap: '2rem', marginTop: '1rem'}}>
            <label className="checkbox-group">
              <input type="checkbox" name="isFavorite" defaultChecked={media.isFavorite} />
              <span>Mark as Favorite</span>
            </label>

            {(media.type === 'MOVIE' || media.type === 'TV_SERIES' || media.type === 'ANIME') && (
              <label className="checkbox-group">
                <input type="checkbox" name="toWatch" defaultChecked={media.toWatch || false} />
                <span>To Watch</span>
              </label>
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '1.5rem', padding: '1rem'}} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
