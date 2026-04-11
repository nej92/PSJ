'use client';

import { useState } from 'react';
import { addMediaAction } from '@/actions/media';
import { X } from 'lucide-react';

export default function AddMediaModal({ defaultType, onClose }: { defaultType: string, onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    await addMediaAction(null, formData);
    setLoading(false);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fade-in" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X /></button>
        <h2 style={{marginBottom: '1.5rem'}}>Add New Media</h2>
        <form action={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select name="type" className="form-input" defaultValue={defaultType} required>
              <option value="MOVIE">Movie</option>
              <option value="TV_SERIES">TV Series</option>
              <option value="VIDEO_GAME">Video Game</option>
              <option value="ANIME">Anime</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Title</label>
            <input type="text" name="title" className="form-input" required />
          </div>

          <div style={{display: 'flex', gap: '1rem'}}>
            <div className="form-group" style={{flex: 1}}>
              <label className="form-label">Release Year</label>
              <input type="number" name="releaseYear" className="form-input" min="1900" max="2100" />
            </div>
            <div className="form-group" style={{flex: 1}}>
              <label className="form-label">Rating (1-5)</label>
              <input type="number" name="rating" className="form-input" min="1" max="5" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Genre</label>
            <input type="text" name="genre" className="form-input" placeholder="e.g. Action, Sci-Fi, RPG" />
          </div>

          <div className="form-group">
            <label className="form-label">Cover Image URL</label>
            <input type="url" name="coverImage" className="form-input" placeholder="https://..." />
          </div>

          <div style={{display: 'flex', gap: '2rem', marginTop: '1rem'}}>
            <label className="checkbox-group">
              <input type="checkbox" name="isFavorite" />
              <span>Mark as Favorite</span>
            </label>

            <label className="checkbox-group">
              <input type="checkbox" name="toWatch" />
              <span title="Applicable for movies and series">To Watch / To Play</span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '1.5rem', padding: '1rem'}} disabled={loading}>
            {loading ? 'Adding...' : 'Add Media'}
          </button>
        </form>
      </div>
    </div>
  );
}
