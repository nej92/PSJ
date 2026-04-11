'use client';

import { useState } from 'react';
import MediaCard from '@/components/MediaCard';
import AddMediaModal from '@/components/AddMediaModal';
import { Media } from '@prisma/client';
import { Plus } from 'lucide-react';

export default function MediaSection({ title, defaultType, medias }: { title: string, defaultType: string, medias: Media[] }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterGenre, setFilterGenre] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'TO_WATCH' | 'WATCHED' | 'FAVORITES'>('ALL');

  const uniqueGenres = Array.from(new Set(medias.map(m => m.genre).filter(Boolean))) as string[];
  const uniqueYears = Array.from(new Set(medias.map(m => m.releaseYear).filter(Boolean))).sort((a,b) => (b as number) - (a as number));

  const filteredMedia = medias.filter(m => {
    if (filterGenre && m.genre !== filterGenre) return false;
    if (filterYear && m.releaseYear?.toString() !== filterYear) return false;
    if (activeTab === 'TO_WATCH' && !m.toWatch) return false;
    if (activeTab === 'WATCHED' && m.toWatch) return false;
    if (activeTab === 'FAVORITES' && !m.isFavorite) return false;
    return true;
  });

  return (
    <div className="fade-in">
      <div className="grid-header" style={{marginTop: '2rem'}}>
        <h1 className="section-title">{title}</h1>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} style={{marginRight: 4}} /> Add New
        </button>
      </div>

      {(defaultType === 'MOVIE' || defaultType === 'TV_SERIES' || defaultType === 'ANIME') && (
        <div className="tabs">
          <div className={`tab ${activeTab === 'ALL' ? 'active' : ''}`} onClick={() => setActiveTab('ALL')}>All</div>
          <div className={`tab ${activeTab === 'TO_WATCH' ? 'active' : ''}`} onClick={() => setActiveTab('TO_WATCH')}>To Watch</div>
          <div className={`tab ${activeTab === 'WATCHED' ? 'active' : ''}`} onClick={() => setActiveTab('WATCHED')}>Watched</div>
          <div className={`tab ${activeTab === 'FAVORITES' ? 'active' : ''}`} onClick={() => setActiveTab('FAVORITES')}>Favorites</div>
        </div>
      )}

      {defaultType === 'VIDEO_GAME' && (
        <div className="tabs">
          <div className={`tab ${activeTab === 'ALL' ? 'active' : ''}`} onClick={() => setActiveTab('ALL')}>All</div>
          <div className={`tab ${activeTab === 'FAVORITES' ? 'active' : ''}`} onClick={() => setActiveTab('FAVORITES')}>Favorites</div>
        </div>
      )}

      <div className="filters-bar" style={{marginBottom: '2rem'}}>
        <span style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Filters:</span>
        <select 
          className="form-input" 
          style={{padding: '0.4rem', minWidth: '150px'}}
          value={filterGenre}
          onChange={(e) => setFilterGenre(e.target.value)}
        >
          <option value="">All Genres</option>
          {uniqueGenres.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        
        <select 
          className="form-input" 
          style={{padding: '0.4rem', minWidth: '150px'}}
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
        >
          <option value="">All Years</option>
          {uniqueYears.map(y => <option key={y} value={y?.toString()}>{y}</option>)}
        </select>
      </div>

      {filteredMedia.length === 0 ? (
        <div style={{textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)'}}>
          <p>No items found. Start building your collection!</p>
        </div>
      ) : (
        <div className="media-grid">
          {filteredMedia.map(media => (
            <MediaCard key={media.id} media={media} />
          ))}
        </div>
      )}

      {showAddModal && <AddMediaModal defaultType={defaultType} onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
