'use client';

import { useState } from 'react';
import MediaCard from '@/components/MediaCard';
import AddMediaModal from '@/components/AddMediaModal';
import { Media } from '@prisma/client';
import { Plus } from 'lucide-react';
import { normalizeText } from '@/lib/normalize';

export default function MediaSection({ title, defaultType, medias }: { title: string, defaultType: string, medias: Media[] }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterGenre, setFilterGenre] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterText, setFilterText] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'TO_WATCH' | 'WATCHED' | 'FAVORITES'>('ALL');

  const uniqueGenres = Array.from(new Set(medias.map(m => m.genre).filter(Boolean))) as string[];
  const uniqueYears = Array.from(new Set(medias.map(m => m.releaseYear).filter(Boolean))).sort((a,b) => (b as number) - (a as number));

  const filteredMedia = medias.filter(m => {
    if (filterGenre && m.genre !== filterGenre) return false;
    if (filterYear && m.releaseYear?.toString() !== filterYear) return false;
    if (filterText) {
      const normalizedFilter = normalizeText(filterText);
      const haystack = [m.title, m.genre, m.actor, m.director, m.developer]
        .filter(Boolean)
        .join(' ');
      if (!normalizeText(haystack).includes(normalizedFilter)) return false;
    }
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
          <Plus size={18} style={{marginRight: 4}} /> Agregar
        </button>
      </div>
      <div className="filters-bar" style={{marginBottom: '1rem', flexWrap: 'wrap'}}>
        <input
          className="form-input"
          style={{minWidth: '220px', flex: 1}}
          type="text"
          placeholder="Buscar título, género, actor, director, desarrollador"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>

      {(defaultType === 'MOVIE' || defaultType === 'TV_SERIES' || defaultType === 'ANIME') && (
        <div className="tabs">
          <div className={`tab ${activeTab === 'ALL' ? 'active' : ''}`} onClick={() => setActiveTab('ALL')}>Todos</div>
          <div className={`tab ${activeTab === 'TO_WATCH' ? 'active' : ''}`} onClick={() => setActiveTab('TO_WATCH')}>Por ver</div>
          <div className={`tab ${activeTab === 'WATCHED' ? 'active' : ''}`} onClick={() => setActiveTab('WATCHED')}>Vistos</div>
          <div className={`tab ${activeTab === 'FAVORITES' ? 'active' : ''}`} onClick={() => setActiveTab('FAVORITES')}>Favoritos</div>
        </div>
      )}

      {defaultType === 'VIDEO_GAME' && (
        <div className="tabs">
          <div className={`tab ${activeTab === 'ALL' ? 'active' : ''}`} onClick={() => setActiveTab('ALL')}>Todos</div>
          <div className={`tab ${activeTab === 'FAVORITES' ? 'active' : ''}`} onClick={() => setActiveTab('FAVORITES')}>Favoritos</div>
        </div>
      )}

      <div className="filters-bar" style={{marginBottom: '2rem'}}>
        <span style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Filtros:</span>
        <select 
          className="form-input" 
          style={{padding: '0.4rem', minWidth: '150px'}}
          value={filterGenre}
          onChange={(e) => setFilterGenre(e.target.value)}
        >
          <option value="">Todos los géneros</option>
          {uniqueGenres.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        
        <select 
          className="form-input" 
          style={{padding: '0.4rem', minWidth: '150px'}}
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
        >
          <option value="">Todos los años</option>
          {uniqueYears.map(y => <option key={y} value={y?.toString()}>{y}</option>)}
        </select>
      </div>

      {filteredMedia.length === 0 ? (
        <div style={{textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)'}}>
          <p>No se encontraron resultados. Ajusta los filtros o agrega nuevos contenidos.</p>
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
