import { lstat, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { movieFolderKey, movieFolderName } from '../src/lib/movie-files.ts';

async function exists(directory) {
  try {
    await lstat(directory);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

export class MovieFolderSync {
  constructor(files, root, statePath) {
    this.files = files;
    this.root = root;
    this.statePath = statePath;
    this.state = null;
  }

  async save() {
    try {
      await mkdir(path.dirname(this.statePath), { recursive: true });
      const temporary = `${this.statePath}.${process.pid}.tmp`;
      await writeFile(temporary, JSON.stringify(this.state), 'utf8');
      await rename(temporary, this.statePath);
    } catch (error) {
      this.state = null;
      throw error;
    }
  }

  async load(movies) {
    if (this.state) return;
    try {
      const saved = JSON.parse(await readFile(this.statePath, 'utf8'));
      if (saved.version !== 1 || !saved.titles || typeof saved.titles !== 'object' ||
          Array.isArray(saved.titles) ||
          Object.values(saved.titles).some(title => typeof title !== 'string')) {
        throw new Error('El registro de carpetas tiene un formato inválido.');
      }
      this.state = saved;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      const titles = {};
      for (const movie of movies) {
        await this.files.ensureDirectory(movie.title);
        titles[movie.id] = movie.title;
      }
      this.state = { version: 1, titles };
      await this.save();
    }
  }

  async recoverPending() {
    const pending = this.state.pending;
    if (!pending) return;
    if (typeof pending.id !== 'string' || typeof pending.from !== 'string' || typeof pending.to !== 'string') {
      throw new Error('El cambio pendiente de carpeta es inválido.');
    }
    const oldPath = path.join(this.root, movieFolderName(pending.from));
    const newPath = path.join(this.root, movieFolderName(pending.to));
    const oldExists = await exists(oldPath);
    const newExists = await exists(newPath);
    if (oldExists && !newExists) {
      await this.files.renameDirectory(pending.from, pending.to);
    } else if (oldExists || !newExists) {
      throw new Error(`No se puede recuperar el cambio de carpeta de "${pending.from}" a "${pending.to}".`);
    }
    this.state.titles[pending.id] = pending.to;
    delete this.state.pending;
    await this.save();
  }

  async sync(movies) {
    await this.load(movies);
    await this.recoverPending();
    const ids = new Set(movies.map(movie => movie.id));
    for (const id of Object.keys(this.state.titles)) {
      if (!ids.has(id)) delete this.state.titles[id];
    }
    await this.save();

    for (const movie of movies) {
      const oldTitle = this.state.titles[movie.id];
      if (oldTitle === undefined || oldTitle === movie.title) continue;
      const oldKey = movieFolderKey(oldTitle);
      if (oldKey === movieFolderKey(movie.title)) {
        this.state.titles[movie.id] = movie.title;
        await this.save();
        continue;
      }
      const shared = movies.some(other => other.id !== movie.id &&
        (movieFolderKey(other.title) === oldKey ||
         (this.state.titles[other.id] !== undefined && movieFolderKey(this.state.titles[other.id]) === oldKey)));
      if (shared) throw new Error(`La carpeta de "${oldTitle}" está compartida y no se puede renombrar automáticamente.`);
      if (!await exists(path.join(this.root, movieFolderName(oldTitle)))) {
        throw new Error(`No existe la carpeta anterior de "${oldTitle}"; no se puede renombrar automáticamente.`);
      }
      if (await exists(path.join(this.root, movieFolderName(movie.title)))) {
        throw new Error(`Ya existe la carpeta de "${movie.title}"; no se sobrescribieron archivos.`);
      }
      this.state.pending = { id: movie.id, from: oldTitle, to: movie.title };
      await this.save();
      await this.recoverPending();
    }
    for (const movie of movies) {
      await this.files.ensureDirectory(movie.title);
      if (this.state.titles[movie.id] !== movie.title) {
        this.state.titles[movie.id] = movie.title;
        await this.save();
      }
    }
  }
}
