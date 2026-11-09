import { spawn } from 'node:child_process';
import { lstat, mkdir, readdir, rename, stat } from 'node:fs/promises';
import path from 'node:path';

const VIDEO_EXTENSIONS = new Set([
  '.avi', '.mkv', '.mp4', '.m4v', '.mov', '.wmv', '.mpg', '.mpeg',
  '.webm', '.flv', '.ts', '.m2ts', '.3gp', '.vob', '.divx',
]);

export function movieFolderName(title: string): string {
  let name = title.trim().replace(/[<>:"/\\|?*\x00-\x1f]/g, '-').replace(/[. ]+$/g, '');
  if (!name || name === '.' || name === '..') {
    throw new Error('El título no permite crear una carpeta válida.');
  }
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i.test(name)) {
    name = `-${name}`;
  }
  if (name.length > 200) {
    throw new Error('El título es demasiado largo para crear una carpeta.');
  }
  return name;
}

export function movieFolderKey(title: string): string {
  return movieFolderName(title).toLocaleLowerCase('en-US');
}

async function ensureRealDirectory(directory: string): Promise<void> {
  await mkdir(directory, { recursive: true });
  const info = await lstat(directory);
  if (!info.isDirectory() || info.isSymbolicLink()) {
    throw new Error('La carpeta de la película no es un directorio válido.');
  }
}

export class MovieFiles {
  private root: string;
  private player: string;

  constructor(root: string, player: string) {
    this.root = root;
    this.player = player;
  }

  private directory(title: string): string {
    return path.join(this.root, movieFolderName(title));
  }

  async ensureDirectory(title: string): Promise<void> {
    await ensureRealDirectory(this.root);
    await ensureRealDirectory(this.directory(title));
  }

  async latestVideoAddedAt(title: string): Promise<Date | null> {
    await this.ensureDirectory(title);
    const directory = this.directory(title);
    const files = await readdir(directory, { withFileTypes: true });
    const videos = files.filter(file =>
      file.isFile() && VIDEO_EXTENSIONS.has(path.extname(file.name).toLowerCase())
    );
    if (videos.length === 0) return null;

    const addedAt = await Promise.all(videos.map(async file =>
      (await stat(path.join(directory, file.name))).birthtime
    ));
    return addedAt.reduce((latest, candidate) =>
      candidate > latest ? candidate : latest
    );
  }

  async renameDirectory(oldTitle: string, newTitle: string): Promise<boolean> {
    const oldDirectory = this.directory(oldTitle);
    const newDirectory = this.directory(newTitle);
    if (oldDirectory === newDirectory) {
      await this.ensureDirectory(newTitle);
      return false;
    }

    await this.ensureDirectory(oldTitle);
    if (movieFolderKey(oldTitle) !== movieFolderKey(newTitle)) {
      try {
        await lstat(newDirectory);
        throw new Error('Ya existe una carpeta con el nuevo título; no se modificaron los archivos.');
      } catch (error) {
        if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error;
      }
    }
    await rename(oldDirectory, newDirectory);
    return true;
  }

  async play(title: string): Promise<boolean> {
    await this.ensureDirectory(title);
    const directory = this.directory(title);
    const files = await readdir(directory, { withFileTypes: true });
    const video = files
      .filter(file => file.isFile() && VIDEO_EXTENSIONS.has(path.extname(file.name).toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name, 'es'))[0];
    if (!video) return false;

    await new Promise<void>((resolve, reject) => {
      const child = spawn(this.player, [path.join(directory, video.name)], {
        detached: true,
        stdio: 'ignore',
        windowsHide: false,
      });
      child.once('error', reject);
      child.once('spawn', () => {
        child.unref();
        resolve();
      });
    });
    return true;
  }
}

export const movieFiles = new MovieFiles('D:\\peliculas', 'D:\\BSPlayer\\bsplayer.exe');
