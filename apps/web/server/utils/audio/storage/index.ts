// ============================================================================
// LinguaWorld — Audio Storage Provider Factory & Key Helpers
// ============================================================================

import type { AudioStorageProvider } from './types';
import { CloudflareR2StorageProvider } from './r2';
import { LocalStorageProvider } from './local';

export * from './types';
export * from './r2';
export * from './local';

let cachedProvider: AudioStorageProvider | null = null;

/**
 * Returns the configured AudioStorageProvider singleton
 */
export function getAudioStorageProvider(): AudioStorageProvider {
  if (cachedProvider) return cachedProvider;

  const driver = process.env.AUDIO_STORAGE_DRIVER || 'local';
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME || 'linguaworld-audio';
  const publicUrl = process.env.R2_PUBLIC_URL;

  // Use Cloudflare R2 if explicitly configured and credentials exist
  if (driver === 'r2' && accountId && accessKeyId && secretAccessKey) {
    cachedProvider = new CloudflareR2StorageProvider({
      accountId,
      accessKeyId,
      secretAccessKey,
      bucketName,
      publicUrl,
    });
    return cachedProvider;
  }

  // Otherwise, default to LocalStorageProvider (development)
  cachedProvider = new LocalStorageProvider();
  return cachedProvider;
}

/**
 * Build structured, versioned object keys as defined in Audio_system.md §5:
 * - learning/{curriculum}/{level}/{contentId}/{voiceProfileCode}/v{version}.mp3
 * - conversation/{conversationId}/{speakerId}/{lineId}/v{version}.mp3
 * - npc/{characterId}/{dialogueId}/v{version}.mp3
 */
export function buildAudioStorageKey(params: {
  category: 'learning' | 'conversation' | 'npc';
  contentId: string;
  voiceProfileCode: string;
  version?: number;
  curriculumCode?: string;
  levelCode?: string;
  speakerId?: string;
  format?: string;
}): string {
  const version = params.version || 1;
  const format = params.format || 'mp3';

  if (params.category === 'learning') {
    const curr = params.curriculumCode || 'hsk-3.0';
    const level = params.levelCode || 'band-1';
    return `learning/${curr}/${level}/${params.contentId}/${params.voiceProfileCode}/v${version}.${format}`;
  }

  if (params.category === 'conversation') {
    const speaker = params.speakerId || 'default';
    return `conversation/${params.contentId}/${speaker}/v${version}.${format}`;
  }

  return `npc/${params.contentId}/${params.voiceProfileCode}/v${version}.${format}`;
}

