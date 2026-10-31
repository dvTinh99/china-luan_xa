// ============================================================================
// LinguaWorld — TTS Provider Factory & Registry (Audio_system.md §3)
// ============================================================================

import type { TTSProvider } from './types';
import { EdgeTTSProvider } from './edge';
import { CosyVoiceProvider } from './cosyvoice';
import { MockTTSProvider } from './mock';

export * from './types';
export * from './edge';
export * from './cosyvoice';
export * from './mock';

let cachedTTS: TTSProvider | null = null;

export async function getTTSProvider(preferred?: 'edge_tts' | 'cosyvoice' | 'mock'): Promise<TTSProvider> {
  if (cachedTTS && !preferred) return cachedTTS;

  const candidate = preferred || process.env.TTS_PROVIDER || 'edge_tts';

  if (candidate === 'cosyvoice') {
    const cosy = new CosyVoiceProvider();
    if (await cosy.isAvailable()) {
      cachedTTS = cosy;
      return cosy;
    }
    console.warn('[TTS] CosyVoice is not available or configured. Falling back to EdgeTTS.');
  }

  if (candidate === 'edge_tts' || candidate === 'cosyvoice') {
    const edge = new EdgeTTSProvider();
    if (await edge.isAvailable()) {
      cachedTTS = edge;
      return edge;
    }
    console.warn('[TTS] EdgeTTS (python edge-tts) is not available. Falling back to MockTTS.');
  }

  const mock = new MockTTSProvider();
  cachedTTS = mock;
  return mock;
}

