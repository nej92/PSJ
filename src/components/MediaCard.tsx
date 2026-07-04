'use client';

import { Star, Heart, Trash2, Eye, EyeOff, Edit2, Search } from 'lucide-react';
import { deleteMediaAction, toggleFavoriteAction, toggleWatchAction } from '@/actions/media';
import { Media } from '@prisma/client';
import { useState } from 'react';
import EditMediaModal from './EditMediaModal';

export default function MediaCard({ media }: { media: Media }) {
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <>
      <div className="media-card fade-in" onClick={() => setShowEditModal(true)} style={{cursor: 'pointer'}}>
        <div style={{position: 'relative'}}>
          <img 
            src={media.coverImage || 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=600&auto=format&fit=crop'} 
            alt={media.title} 
            className="media-cover" 
          />
          {media.rating && (
            <div style={{position:'absolute', top: 10, right: 10, display:'flex', alignItems:'center', gap: 4}} className="media-badge">
              <Star size={12} fill="currentColor" /> {media.rating}/5
            </div>
          )}
        </div>
        <div className="media-info">
          <h3 className="media-title" title={media.title}>{media.title}</h3>
          <div className="media-meta" style={{display: 'grid', gap: '0.35rem', fontSize: '0.8rem'}}>
            <span>{media.releaseYear || 'N/A'}</span>
            <span>{media.genre || 'Sin género'}</span>
            {(media.actor || media.director) && (
              <span>{media.actor ? `Actor: ${media.actor}` : ''}{media.actor && media.director ? ' · ' : ''}{media.director ? `Director: ${media.director}` : ''}</span>
            )}
            {media.developer && <span>Desarrollador: {media.developer}</span>}
          </div>
          <div className="media-actions" onClick={e => e.stopPropagation()}>
            <button 
              className={`action-btn ${media.isFavorite ? 'active' : ''}`}
              onClick={() => toggleFavoriteAction(media.id, !media.isFavorite)}
              title="Favorito"
            >
              <Heart size={18} fill={media.isFavorite ? 'currentColor' : 'none'} />
            </button>
            
            {(media.type === 'MOVIE' || media.type === 'TV_SERIES' || media.type === 'ANIME') && (
              <button 
                className={`action-btn ${media.toWatch ? 'active' : ''}`}
                onClick={() => toggleWatchAction(media.id, !media.toWatch)}
                title={media.toWatch ? 'Marcar como visto' : 'Marcar por ver'}
              >
                {media.toWatch ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}

            <button 
              className="action-btn"
              onClick={() => {
                if(confirm('¿Eliminar este elemento?')) deleteMediaAction(media.id);
              }}
              title="Eliminar"
            >
              <Trash2 size={18} />
            </button>

            {media.type !== 'VIDEO_GAME' && (
              <button 
                className="action-btn"
                onClick={() => {
                  const searchQuery = encodeURIComponent(`donde ver ${media.title}`);
                  window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
                }}
                title="Dónde verlo"
              >
                <Search size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {showEditModal && <EditMediaModal media={media} onClose={() => setShowEditModal(false)} />}
    </>
  );
}
