import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { MovieFiles, movieFolderKey, movieFolderName } from '../src/lib/movie-files.ts';

test('movie folder names are safe for Windows', () => {
  assert.equal(movieFolderName('Avatar: The Way of Water'), 'Avatar- The Way of Water');
  assert.equal(movieFolderName('CON.txt'), '-CON.txt');
  assert.equal(movieFolderName('  example.  '), 'example');
  assert.equal(movieFolderKey('Example'), movieFolderKey('example'));
  assert.throws(() => movieFolderName('...'));
});

test('directories, missing videos, rename and player errors', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'movie-files-'));
  try {
    const files = new MovieFiles(root, path.join(root, 'missing-player.exe'));
    await files.ensureDirectory('A: Movie');
    await writeFile(path.join(root, 'A- Movie', 'notes.txt'), 'not a video');
    assert.equal(await files.play('A: Movie'), false);
    await writeFile(path.join(root, 'A- Movie', 'movie.MKV'), 'video');
    await assert.rejects(files.play('A: Movie'), { code: 'ENOENT' });
    await files.renameDirectory('A: Movie', 'New title');
    assert.equal(await readFile(path.join(root, 'New title', 'movie.MKV'), 'utf8'), 'video');
    await mkdir(path.join(root, 'Existing'));
    await assert.rejects(files.renameDirectory('New title', 'Existing'), /Ya existe una carpeta/);
    assert.equal(await readFile(path.join(root, 'New title', 'movie.MKV'), 'utf8'), 'video');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('finds the newest video file creation date and ignores non-video files', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'movie-video-date-'));
  try {
    const files = new MovieFiles(root, process.execPath);
    await files.ensureDirectory('Test');
    await writeFile(path.join(root, 'Test', 'notes.txt'), 'not a video');
    assert.equal(await files.latestVideoAddedAt('Test'), null);
    await writeFile(path.join(root, 'Test', '01.mp4'), 'video');
    await new Promise(resolve => setTimeout(resolve, 20));
    await writeFile(path.join(root, 'Test', '02.MKV'), 'video');
    const latestVideo = await stat(path.join(root, 'Test', '02.MKV'));
    assert.equal((await files.latestVideoAddedAt('Test'))?.getTime(), latestVideo.birthtime.getTime());
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('opens the first video file using the configured executable', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'movie-player-'));
  try {
    const files = new MovieFiles(root, process.execPath);
    await files.ensureDirectory('Test');
    const marker = path.join(root, 'played.txt');
    const script = `require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'played')`;
    await writeFile(path.join(root, 'Test', '01.mp4'), script);
    await writeFile(path.join(root, 'Test', '02.mkv'), 'not JavaScript');
    assert.equal(await files.play('Test'), true);
    let result;
    for (let i = 0; i < 50; i++) {
      try {
        result = await readFile(marker, 'utf8');
        break;
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    assert.equal(result, 'played');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
