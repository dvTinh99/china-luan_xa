// ============================================================================
// LinguaWorld — Batch Audio Seeding & Generation (Audio_system.md §4, §6)
// ============================================================================

import { PrismaClient } from '@prisma/client';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execFileAsync = promisify(execFile);
const prisma = new PrismaClient();

const VOICE_PROFILES = [
  {
    code: 'vp_learning_standard',
    name: 'Cô Giáo Tiêu Chuẩn (Standard Mandarin Teacher)',
    description: 'Giọng chuẩn phổ thông Bắc Kinh, phát âm rõ từng thanh điệu, phục vụ học từ vựng và luyện âm',
    gender: 'female',
    role: 'teacher',
    languageCode: 'zh-CN',
    provider: 'edge_tts',
    providerVoiceId: 'zh-CN-XiaoxiaoNeural',
    pitch: 1.0,
    speed: 0.9,
    isSystem: true,
  },
  {
    code: 'vp_village_guide',
    name: 'Thôn Trưởng Hướng Dẫn (Village Guide)',
    description: 'Giọng nữ ấm áp, chào đón tân thủ bước vào thế giới LinguaWorld',
    gender: 'female',
    role: 'guide',
    languageCode: 'zh-CN',
    provider: 'edge_tts',
    providerVoiceId: 'zh-CN-XiaoyiNeural',
    pitch: 1.0,
    speed: 1.0,
    isSystem: true,
  },
  {
    code: 'vp_shopkeeper',
    name: 'Thương Nhân Vui Tính (Shopkeeper)',
    description: 'Giọng nam thanh niên hoạt bát, xởi lởi, hỗ trợ mua bán vật phẩm',
    gender: 'male',
    role: 'shopkeeper',
    languageCode: 'zh-CN',
    provider: 'edge_tts',
    providerVoiceId: 'zh-CN-YunjianNeural',
    pitch: 1.05,
    speed: 1.0,
    isSystem: true,
  },
  {
    code: 'vp_storyteller',
    name: 'Thuyết Thư Nhân (Storyteller)',
    description: 'Giọng trầm mặc, hào sảng, kể lại truyền thuyết thế giới LinguaWorld',
    gender: 'male',
    role: 'storyteller',
    languageCode: 'zh-CN',
    provider: 'edge_tts',
    providerVoiceId: 'zh-CN-YunxiNeural',
    pitch: 0.9,
    speed: 0.85,
    isSystem: true,
  },
];

async function main() {
  console.log('🚀 Starting LinguaWorld Audio System Batch Seeder...');

  // 1. Ensure Voice Profiles exist
  const profileMap = new Map();
  for (const vp of VOICE_PROFILES) {
    const profile = await prisma.voiceProfile.upsert({
      where: { code: vp.code },
      update: vp,
      create: vp,
    });
    profileMap.set(vp.code, profile);
    console.log(`✓ VoiceProfile registered: ${profile.name} (${profile.code})`);
  }

  const standardProfile = profileMap.get('vp_learning_standard');

  // 2. Query all vocabulary
  const vocabularies = await prisma.vocabulary.findMany({
    include: {
      readings: { where: { isPrimary: true } },
    },
  });

  console.log(`Found ${vocabularies.length} vocabulary items in database.`);
  if (!vocabularies.length) {
    console.warn('No vocabulary items found. Run base seed first.');
    return;
  }

  // 3. Prepare payload for python generator
  const itemsPayload = vocabularies.map((v) => ({
    id: v.id,
    simplified: v.simplified,
    pinyin: v.readings[0]?.reading || '',
  }));

  const tempJsonPath = path.join(os.tmpdir(), `lw_vocab_batch_${Date.now()}.json`);
  fs.writeFileSync(tempJsonPath, JSON.stringify(itemsPayload, null, 2), 'utf-8');

  const outputBaseDir = path.resolve('apps/web/public/audio/learning/hsk-3.0/band-1');
  fs.mkdirSync(outputBaseDir, { recursive: true });

  const scriptPath = path.resolve('database/prisma/generate_audio_batch.py');
  console.log(`🎙️ Invoking EdgeTTS batch generator (${itemsPayload.length} items)...`);

  const { stdout } = await execFileAsync('python3', [scriptPath, tempJsonPath, outputBaseDir], {
    maxBuffer: 10 * 1024 * 1024,
  });

  try { fs.unlinkSync(tempJsonPath); } catch {}

  const results = JSON.parse(stdout);
  let successCount = 0;
  let failCount = 0;

  for (const res of results) {
    if (res.status === 'success') {
      const vocab = vocabularies.find((v) => v.id === res.id);
      const pinyin = vocab?.readings[0]?.reading || '';

      // Upsert AudioAsset record
      await prisma.audioAsset.upsert({
        where: {
          storageKey: res.storageKey,
        },
        update: {
          fileSizeBytes: res.size,
          checksum: res.checksum,
          publicationStatus: 'PUBLISHED',
          reviewStatus: 'APPROVED',
          isPrimary: true,
          publishedAt: new Date(),
        },
        create: {
          contentType: 'VOCABULARY',
          contentId: res.id,
          language: 'zh-CN',
          sourceText: res.simplified,
          pinyin,
          voiceProfileId: standardProfile.id,
          provider: 'edge_tts',
          storageKey: res.storageKey,
          audioFormat: 'mp3',
          fileSizeBytes: res.size,
          checksum: res.checksum,
          version: 1,
          reviewStatus: 'APPROVED',
          publicationStatus: 'PUBLISHED',
          isPrimary: true,
          publishedAt: new Date(),
        },
      });

      // Update Vocabulary table audioUrl
      await prisma.vocabulary.update({
        where: { id: res.id },
        data: { audioUrl: res.url },
      });

      successCount++;
    } else {
      console.error(`✗ Failed for [${res.simplified}]:`, res.error);
      failCount++;
    }
  }

  console.log(`🎉 Audio Batch Generation Complete!`);
  console.log(`   ✓ Successfully generated & published: ${successCount}`);
  if (failCount > 0) {
    console.log(`   ✗ Failed: ${failCount}`);
  }
}

main()
  .catch((e) => {
    console.error('Fatal error in audio batch seeder:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
