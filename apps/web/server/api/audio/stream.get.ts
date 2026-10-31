// ============================================================================
// GET /api/audio/stream?text=...&rate=...&voice=...
// Dynamic TTS Stream Endpoint (Fallback for client when SpeechSynthesis is unavailable)
// ============================================================================

import { defineEventHandler, getQuery, setResponseHeaders, createError } from 'h3';
import { getTTSProvider } from '../../utils/audio/tts';
import crypto from 'crypto';

// In-memory cache for fast repeat requests
const audioStreamCache = new Map<string, { buffer: Buffer; mimeType: string }>();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const text = (query.text as string || '').trim();
  const voice = (query.voice as string || '').trim() || undefined;
  const rate = query.rate ? parseFloat(query.rate as string) : 1.0;

  if (!text) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Text query parameter is required',
    });
  }

  const cacheKey = `${text}_${voice || 'default'}_${rate}`;
  const cached = audioStreamCache.get(cacheKey);

  if (cached) {
    setResponseHeaders(event, {
      'Content-Type': cached.mimeType,
      'Content-Length': cached.buffer.length.toString(),
      'Cache-Control': 'public, max-age=86400, immutable',
    });
    return cached.buffer;
  }

  try {
    const provider = await getTTSProvider();
    const result = await provider.generate({
      text,
      voiceId: voice,
      rate,
      language: 'zh-CN',
      format: 'mp3',
    });

    // Cache up to 200 items in memory
    if (audioStreamCache.size > 200) {
      const firstKey = audioStreamCache.keys().next().value;
      if (firstKey) audioStreamCache.delete(firstKey);
    }
    audioStreamCache.set(cacheKey, {
      buffer: result.buffer,
      mimeType: result.mimeType,
    });

    setResponseHeaders(event, {
      'Content-Type': result.mimeType,
      'Content-Length': result.buffer.length.toString(),
      'Cache-Control': 'public, max-age=86400, immutable',
    });

    return result.buffer;
  } catch (err: any) {
    console.error('[Audio Stream API Error]:', err);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to stream TTS: ${err.message}`,
    });
  }
});

