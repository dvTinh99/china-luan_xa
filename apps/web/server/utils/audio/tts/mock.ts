// ============================================================================
// LinguaWorld — Mock TTS Provider (Testing / Fallback)
// ============================================================================

import type { TTSProvider, GenerateAudioOptions, GenerateAudioResult, TTSVoiceInfo } from './types';

// Valid 1-second silence MP3 frame buffer
const VALID_SILENCE_MP3 = Buffer.from(
  '//uQxAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAFAAAA2AAA//////////' +
  '////////////////////////////////////////////////////////////////' +
  '////////////////////////////////////////////////////////////////' +
  '//////////////////8AAAAATGFtZTMuMTAwAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'base64'
);

export class MockTTSProvider implements TTSProvider {
  name = 'mock';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async listVoices(): Promise<TTSVoiceInfo[]> {
    return [
      {
        id: 'mock-standard',
        name: 'Mock Mandarin Voice',
        gender: 'female',
        language: 'zh-CN',
      },
    ];
  }

  async generate(options: GenerateAudioOptions): Promise<GenerateAudioResult> {
    return {
      buffer: VALID_SILENCE_MP3,
      mimeType: 'audio/mpeg',
      format: 'mp3',
      provider: this.name,
      voiceId: options.voiceId || 'mock-standard',
    };
  }
}

