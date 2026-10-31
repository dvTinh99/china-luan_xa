// ============================================================================
// LinguaWorld — CosyVoice TTS Provider (Audio_system.md §3)
// ============================================================================

import type { TTSProvider, GenerateAudioOptions, GenerateAudioResult, TTSVoiceInfo } from './types';

export class CosyVoiceProvider implements TTSProvider {
  name = 'cosyvoice';

  private apiUrl: string | undefined;
  private apiKey: string | undefined;

  constructor() {
    this.apiUrl = process.env.COSYVOICE_API_URL;
    this.apiKey = process.env.COSYVOICE_API_KEY;
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(this.apiUrl && this.apiUrl.trim().length > 0);
  }

  async listVoices(): Promise<TTSVoiceInfo[]> {
    return [
      {
        id: 'cosyvoice-mandarin-female-standard-v1',
        name: 'CosyVoice Mandarin Teacher (Standard)',
        gender: 'female',
        language: 'zh-CN',
        description: 'Alibaba CosyVoice standard mandarin voice profile',
      },
      {
        id: 'cosyvoice-mandarin-female-lively-v1',
        name: 'CosyVoice Mandarin Guide (Lively)',
        gender: 'female',
        language: 'zh-CN',
      },
      {
        id: 'cosyvoice-mandarin-male-energetic-v1',
        name: 'CosyVoice Mandarin Shopkeeper (Energetic)',
        gender: 'male',
        language: 'zh-CN',
      },
      {
        id: 'cosyvoice-mandarin-male-narrator-v1',
        name: 'CosyVoice Mandarin Storyteller (Narrator)',
        gender: 'male',
        language: 'zh-CN',
      },
    ];
  }

  async generate(options: GenerateAudioOptions): Promise<GenerateAudioResult> {
    if (!this.apiUrl) {
      throw new Error(
        '[CosyVoiceProvider] COSYVOICE_API_URL is not configured. Use EdgeTTSProvider or configure environment credentials.',
      );
    }

    const payload = {
      text: options.text,
      voice_id: options.voiceId || 'cosyvoice-mandarin-female-standard-v1',
      speed: options.rate ?? 1.0,
      pitch: options.pitch ?? 1.0,
      language: options.language || 'zh-CN',
      format: options.format || 'mp3',
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(`${this.apiUrl}/v1/tts/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`[CosyVoiceProvider] API returned error ${response.status}: ${errText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return {
      buffer: Buffer.from(arrayBuffer),
      mimeType: 'audio/mpeg',
      format: 'mp3',
      provider: this.name,
      voiceId: payload.voice_id,
    };
  }
}

