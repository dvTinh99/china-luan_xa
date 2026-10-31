// ============================================================================
// LinguaWorld — Local File Storage Provider (Development / Fallback)
// ============================================================================

import fs from 'fs';
import path from 'path';
import type { AudioStorageProvider, StorageUploadResult } from './types';

export class LocalStorageProvider implements AudioStorageProvider {
  private baseDir: string;
  private publicPrefix: string;

  constructor(options?: { baseDir?: string; publicPrefix?: string }) {
    const cwd = process.cwd();
    const defaultBaseDir = cwd.endsWith('apps/web')
      ? path.resolve(cwd, 'public/audio')
      : path.resolve(cwd, 'apps/web/public/audio');

    this.baseDir = options?.baseDir || defaultBaseDir;
    this.publicPrefix = options?.publicPrefix || '/audio';

    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async upload(
    key: string,
    data: Buffer | Uint8Array,
    mimeType = 'audio/mpeg',
  ): Promise<StorageUploadResult> {
    const cleanKey = key.replace(/^\/+/, '');
    const fullPath = path.join(this.baseDir, cleanKey);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    fs.writeFileSync(fullPath, buffer);

    return {
      key: cleanKey,
      url: this.getUrl(cleanKey),
      size: buffer.length,
      mimeType,
    };
  }

  async delete(key: string): Promise<boolean> {
    const cleanKey = key.replace(/^\/+/, '');
    const fullPath = path.join(this.baseDir, cleanKey);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  }

  getUrl(key: string): string {
    const cleanKey = key.replace(/^\/+/, '');
    return `${this.publicPrefix}/${cleanKey}`;
  }

  async exists(key: string): Promise<boolean> {
    const cleanKey = key.replace(/^\/+/, '');
    const fullPath = path.join(this.baseDir, cleanKey);
    return fs.existsSync(fullPath);
  }

  async download(key: string): Promise<Buffer | null> {
    const cleanKey = key.replace(/^\/+/, '');
    const fullPath = path.join(this.baseDir, cleanKey);

    if (!fs.existsSync(fullPath)) {
      return null;
    }
    return fs.readFileSync(fullPath);
  }
}

