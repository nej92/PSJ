import { normalizeText } from './normalize.ts';

export type GenreCatalog = { screen: string[]; game: string[] };

export function genreCategory(type: string): 'SCREEN' | 'GAME' | null {
  if (type === 'VIDEO_GAME') return 'GAME';
  if (type === 'MOVIE' || type === 'TV_SERIES' || type === 'ANIME') return 'SCREEN';
  return null;
}

export function genresForType(catalog: GenreCatalog, type: string): string[] {
  return genreCategory(type) === 'GAME' ? catalog.game : catalog.screen;
}

export function splitGenres(value: string | null): string[] {
  return value ? value.split(',').map(genre => genre.trim()).filter(Boolean) : [];
}

export function hasGenre(value: string | null, genre: string): boolean {
  return splitGenres(value).some(item => normalizeText(item) === normalizeText(genre));
}

export function legacyGenres(value: string | null, catalog: string[]): string[] {
  return [...new Set(splitGenres(value).filter(genre =>
    !catalog.some(item => normalizeText(item) === normalizeText(genre))
  ))];
}

export function resolveSelectedGenres(values: FormDataEntryValue[], catalog: string[], previous: string | null) {
  const allowed = new Map(catalog.map(name => [normalizeText(name), name]));
  for (const genre of splitGenres(previous)) {
    if (!allowed.has(normalizeText(genre))) allowed.set(normalizeText(genre), genre);
  }
  const selected: string[] = [];
  for (const value of values) {
    if (typeof value !== 'string') return { error: 'Género inválido.' };
    const genre = allowed.get(normalizeText(value));
    if (!genre) return { error: 'Selecciona géneros válidos para este tipo de contenido.' };
    if (!selected.includes(genre)) selected.push(genre);
  }
  return { genre: selected.length ? selected.join(', ') : null };
}
