// ============================================================================
// LinguaWorld — TTS Provider Types (Audio_system.md §3)
// ============================================================================

export interface GenerateAudioOptions {
  text: string;
  voiceId?: string;
  rate?: number;     // 0.5 to 2.0 (default 1.0)
  pitch?: number;    // 0.5 to 1.5 (default 1.0)
  language?: string; // default 'zh-CN'
  format?: 'mp3' | 'wav';
}

export interface GenerateAudioResult {
  buffer: Buffer;
  mimeType: string;
  format: 'mp3' | 'wav';
  durationSeconds?: number;
  provider: string;
  voiceId: string;
}

export interface TTSVoiceInfo {
  id: string;
  name: string;
  gender: 'male' | 'female';
  language: string;
  description?: string;
}

export interface TTSProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  listVoices(): Promise<TTSVoiceInfo[]>;
  generate(options: GenerateAudioOptions): Promise<GenerateAudioResult>;
}

