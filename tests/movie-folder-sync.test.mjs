import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, rmdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { MovieFiles } from '../src/lib/movie-files.ts';
import { MovieFolderSync } from '../scripts/movie-folder-sync.mjs';

test('synchronizes additions and offline renames across restarts without deleting videos', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'movie-sync-'));
  const moviesRoot = path.join(root, 'movies');
  const statePath = path.join(root, 'state', 'movies.json');
  const files = new MovieFiles(moviesRoot, process.execPath);
  try {
    let sync = new MovieFolderSync(files, moviesRoot, statePath);
    await sync.sync([{ id: '1', title: 'Original' }]);
    await writeFile(path.join(moviesRoot, 'Original', 'movie.mp4'), 'video');
    sync = new MovieFolderSync(files, moviesRoot, statePath);
    await sync.sync([{ id: '1', title: 'Renamed' }, { id: '2', title: 'New: Movie' }]);
    assert.equal(await readFile(path.join(moviesRoot, 'Renamed', 'movie.mp4'), 'utf8'), 'video');
    await writeFile(path.join(moviesRoot, 'New- Movie', 'test.txt'), 'exists');
    await sync.sync([{ id: '2', title: 'New: Movie' }]);
    assert.equal(await readFile(path.join(moviesRoot, 'Renamed', 'movie.mp4'), 'utf8'), 'video');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('refuses folder conflicts and retries after the conflict is resolved', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'movie-conflict-'));
  const moviesRoot = path.join(root, 'movies');
  const statePath = path.join(root, 'state.json');
  const files = new MovieFiles(moviesRoot, process.execPath);
  try {
    const sync = new MovieFolderSync(files, moviesRoot, statePath);
    await sync.sync([{ id: '1', title: 'Old' }]);
    await writeFile(path.join(moviesRoot, 'Old', 'movie.mp4'), 'video');
    await mkdir(path.join(moviesRoot, 'New'));
    await assert.rejects(sync.sync([{ id: '1', title: 'New' }]), /Ya existe la carpeta/);
    assert.equal(await readFile(path.join(moviesRoot, 'Old', 'movie.mp4'), 'utf8'), 'video');
    await rmdir(path.join(moviesRoot, 'New'));
    await sync.sync([{ id: '1', title: 'New' }]);
    assert.equal(await readFile(path.join(moviesRoot, 'New', 'movie.mp4'), 'utf8'), 'video');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('recovers a rename interrupted after the filesystem operation', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'movie-recover-'));
  const moviesRoot = path.join(root, 'movies');
  const statePath = path.join(root, 'state.json');
  const files = new MovieFiles(moviesRoot, process.execPath);
  try {
    await files.ensureDirectory('New');
    await writeFile(path.join(moviesRoot, 'New', 'movie.mp4'), 'video');
    await writeFile(statePath, JSON.stringify({
      version: 1,
      titles: { '1': 'Old' },
      pending: { id: '1', from: 'Old', to: 'New' },
    }));
    await new MovieFolderSync(files, moviesRoot, statePath).sync([{ id: '1', title: 'New' }]);
    assert.equal(await readFile(path.join(moviesRoot, 'New', 'movie.mp4'), 'utf8'), 'video');
    assert.equal(JSON.parse(await readFile(statePath, 'utf8')).titles['1'], 'New');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('does not move a folder still shared with another movie', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'movie-shared-'));
  const moviesRoot = path.join(root, 'movies');
  try {
    const sync = new MovieFolderSync(new MovieFiles(moviesRoot, process.execPath), moviesRoot, path.join(root, 'state.json'));
    await sync.sync([{ id: '1', title: 'Shared' }, { id: '2', title: 'Shared' }]);
    await assert.rejects(sync.sync([{ id: '1', title: 'Changed' }, { id: '2', title: 'Shared' }]), /compartida/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
