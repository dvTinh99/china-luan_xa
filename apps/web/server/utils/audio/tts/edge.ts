// ============================================================================
// LinguaWorld — Edge TTS Provider (Audio_system.md §3)
// ============================================================================

import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import type { TTSProvider, GenerateAudioOptions, GenerateAudioResult, TTSVoiceInfo } from './types';

const execFileAsync = promisify(execFile);

export class EdgeTTSProvider implements TTSProvider {
  name = 'edge_tts';

  private defaultVoice = 'zh-CN-XiaoxiaoNeural';

  async isAvailable(): Promise<boolean> {
    try {
      await execFileAsync('python3', ['-m', 'edge_tts', '--version']);
      return true;
    } catch {
      return false;
    }
  }

  async listVoices(): Promise<TTSVoiceInfo[]> {
    return [
      {
        id: 'zh-CN-XiaoxiaoNeural',
        name: 'XiaoXiao (Standard Learning)',
        gender: 'female',
        language: 'zh-CN',
        description: 'Giọng chuẩn phổ thông, phát âm rõ ràng rành mạch, phù hợp luyện ngữ âm.',
      },
      {
        id: 'zh-CN-YunxiNeural',
        name: 'YunXi (Narrator / Storyteller)',
        gender: 'male',
        language: 'zh-CN',
        description: 'Giọng nam truyền cảm, phong thái kể chuyện.',
      },
      {
        id: 'zh-CN-YunjianNeural',
        name: 'YunJian (Shopkeeper / Energetic)',
        gender: 'male',
        language: 'zh-CN',
        description: 'Giọng nam hoạt bát, nhanh nhẹn, thích hợp đối thoại NPC.',
      },
      {
        id: 'zh-CN-XiaoyiNeural',
        name: 'XiaoYi (Village Guide)',
        gender: 'female',
        language: 'zh-CN',
        description: 'Giọng nữ trẻ trung, ấm áp, thân thiện.',
      },
    ];
  }

  async generate(options: GenerateAudioOptions): Promise<GenerateAudioResult> {
    const text = options.text.trim();
    if (!text) {
      throw new Error('[EdgeTTSProvider] Cannot generate audio for empty text');
    }

    const voice = options.voiceId || this.defaultVoice;
    const tempFile = path.join(
      os.tmpdir(),
      `lw_edge_${crypto.randomBytes(8).toString('hex')}.mp3`,
    );

    const args = ['-m', 'edge_tts', '--voice', voice, '--text', text, '--write-media', tempFile];

    // Speed adjustment (rate: 1.0 => 0%, 0.85 => -15%, 1.25 => +25%)
    if (options.rate && options.rate !== 1.0) {
      const percentage = Math.round((options.rate - 1.0) * 100);
      const sign = percentage >= 0 ? '+' : '';
      args.push(`--rate=${sign}${percentage}%`);
    }

    // Pitch adjustment
    if (options.pitch && options.pitch !== 1.0) {
      const pitchHz = Math.round((options.pitch - 1.0) * 50);
      const sign = pitchHz >= 0 ? '+' : '';
      args.push(`--pitch=${sign}${pitchHz}Hz`);
    }

    try {
      await execFileAsync('python3', args, { timeout: 15000 });

      if (!fs.existsSync(tempFile)) {
        throw new Error('[EdgeTTSProvider] Audio output file was not created');
      }

      const buffer = fs.readFileSync(tempFile);
      fs.unlinkSync(tempFile);

      return {
        buffer,
        mimeType: 'audio/mpeg',
        format: 'mp3',
        provider: this.name,
        voiceId: voice,
      };
    } catch (err: any) {
      if (fs.existsSync(tempFile)) {
        try { fs.unlinkSync(tempFile); } catch {}
      }
      throw new Error(`[EdgeTTSProvider] Failed to generate audio: ${err.message}`);
    }
  }
}

