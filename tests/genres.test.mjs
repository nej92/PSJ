import assert from 'node:assert/strict';
import { test } from 'node:test';
import { genreCategory, genresForType, hasGenre, legacyGenres, resolveSelectedGenres, splitGenres } from '../src/lib/genres.ts';

test('uses the screen catalog for anime, movies and series and the game catalog for games', () => {
  const catalog = { screen: ['accion', 'comedia'], game: ['RPG', 'aventura'] };
  for (const type of ['ANIME', 'MOVIE', 'TV_SERIES']) {
    assert.equal(genreCategory(type), 'SCREEN');
    assert.deepEqual(genresForType(catalog, type), catalog.screen);
  }
  assert.equal(genreCategory('VIDEO_GAME'), 'GAME');
  assert.deepEqual(genresForType(catalog, 'VIDEO_GAME'), catalog.game);
  assert.equal(genreCategory('invalid'), null);
});

test('matches individual genres in legacy text without partial matches', () => {
  assert.deepEqual(splitGenres('Acción, romance,  '), ['Acción', 'romance']);
  assert.equal(hasGenre('Acción, romance', 'accion'), true);
  assert.equal(hasGenre('rpg, turnos', 'RPG'), true);
  assert.equal(hasGenre('superheroes, comedia', 'hero'), false);
  assert.equal(hasGenre(null, 'accion'), false);
});

test('preserves unlisted legacy values without treating capitalization or accents as differences', () => {
  assert.deepEqual(legacyGenres('Acción, lucha, RPG, lucha', ['accion', 'RPG']), ['lucha']);
  assert.deepEqual(legacyGenres(null, ['accion']), []);
});

test('validates selections and permits only existing legacy values during edits', () => {
  const catalog = ['accion', 'RPG'];
  assert.deepEqual(resolveSelectedGenres(['Acción', 'rpg', 'RPG'], catalog, null), { genre: 'accion, RPG' });
  assert.deepEqual(resolveSelectedGenres([], catalog, 'anterior'), { genre: null });
  assert.deepEqual(resolveSelectedGenres(['anterior', 'RPG'], catalog, 'anterior'), { genre: 'anterior, RPG' });
  assert.ok(resolveSelectedGenres(['anterior'], catalog, null).error);
  assert.ok(resolveSelectedGenres(['otro'], catalog, 'anterior').error);
  assert.ok(resolveSelectedGenres([new File([], 'test')], catalog, null).error);
});
