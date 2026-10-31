// ============================================================================
// LinguaWorld — Phase 1 Audio System Seeder (VoiceProfiles & Sample AudioAsset)
// ============================================================================

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log('🎵 Seeding Audio System Phase 1...');

  // 1. Seed Voice Profiles
  const voiceProfilesData = [
    {
      code: 'vp_learning_standard',
      name: 'Giáo Viên Chuẩn Phổ Thông (Ting-Ting)',
      description: 'Giọng nữ chuẩn phát âm Bắc Kinh, rõ ràng từng thanh điệu, tối ưu hóa cho người học HSK 3.0',
      gender: 'female',
      role: 'learning',
      languageCode: 'zh-CN',
      provider: 'cosyvoice',
      providerVoiceId: 'cosyvoice-mandarin-female-standard-v1',
      pitch: 1.0,
      speed: 0.85,
      isSystem: true,
    },
    {
      code: 'vp_village_guide',
      name: 'Trưởng Thôn Lão Gia (Village Elder)',
      description: 'Giọng nam lão niên ấm áp, chào đón người chơi bước vào Làng Tân Thủ',
      gender: 'male',
      role: 'village_guide',
      languageCode: 'zh-CN',
      provider: 'cosyvoice',
      providerVoiceId: 'cosyvoice-mandarin-male-elder-v1',
      pitch: 0.95,
      speed: 0.9,
      isSystem: true,
    },
    {
      code: 'vp_shopkeeper',
      name: 'Tiểu Nhị Quán Trọ (Innkeeper)',
      description: 'Giọng nam thanh niên hoạt bát, xởi lởi, hỗ trợ mua bán vật phẩm',
      gender: 'male',
      role: 'shopkeeper',
      languageCode: 'zh-CN',
      provider: 'cosyvoice',
      providerVoiceId: 'cosyvoice-mandarin-male-energetic-v1',
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
      provider: 'cosyvoice',
      providerVoiceId: 'cosyvoice-mandarin-male-narrator-v1',
      pitch: 0.9,
      speed: 0.85,
      isSystem: true,
    },
  ];

  const profileMap = new Map();
  for (const vp of voiceProfilesData) {
    const profile = await prisma.voiceProfile.upsert({
      where: { code: vp.code },
      update: vp,
      create: vp,
    });
    profileMap.set(vp.code, profile);
    console.log(`✓ VoiceProfile: ${profile.name} (${profile.code})`);
  }

  // 2. Find "你" vocabulary
  const targetVocab = await prisma.vocabulary.findFirst({
    where: { simplified: '你' },
  });

  if (!targetVocab) {
    console.warn('⚠️ Vocabulary "你" not found in database. Please run primary seed first.');
    return;
  }

  // 3. Create sample valid MP3 audio data
  const sampleMp3Header = Buffer.from([
    0xff, 0xfb, 0x90, 0x64, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x54, 0x41, 0x47, 0x4e, 0x69, 0x20, 0x53, 0x61, 0x6d, 0x70, 0x6c, 0x65,
  ]);
  const audioData = Buffer.concat([sampleMp3Header, Buffer.alloc(1024, 0xaa)]);

  const checksum = crypto.createHash('sha256').update(audioData).digest('hex');
  const durationMs = 600; // 600ms duration for "nǐ"
  const fileSizeBytes = audioData.length;

  const storageKey = 'learning/hsk-3.0/band-1/vocab_ni/vp_learning_standard/v1.mp3';

  // Write file to local storage directory apps/web/public/audio/
  const localTarget = path.resolve(__dirname, '../../apps/web/public/audio', storageKey);
  fs.mkdirSync(path.dirname(localTarget), { recursive: true });
  fs.writeFileSync(localTarget, audioData);
  console.log(`✓ Wrote audio sample to local storage: ${localTarget}`);

  const learningVoice = profileMap.get('vp_learning_standard');

  // 4. Create or update AudioAsset
  const sampleAsset = await prisma.audioAsset.upsert({
    where: { storageKey },
    update: {
      contentId: targetVocab.id,
      sourceText: '你',
      pinyin: 'nǐ',
      reviewStatus: 'APPROVED',
      publicationStatus: 'PUBLISHED',
      isPrimary: true,
      publishedAt: new Date(),
      reviewedAt: new Date(),
      checksum,
      durationMs,
      fileSizeBytes,
    },
    create: {
      contentType: 'VOCABULARY',
      contentId: targetVocab.id,
      language: 'zh-CN',
      sourceText: '你',
      pinyin: 'nǐ',
      voiceProfileId: learningVoice.id,
      provider: 'cosyvoice',
      storageKey,
      audioFormat: 'mp3',
      durationMs,
      fileSizeBytes,
      checksum,
      version: 1,
      generationParams: {
        model: 'cosyvoice-v1',
        temperature: 0.3,
        sampleRate: 24000,
      },
      reviewStatus: 'APPROVED',
      publicationStatus: 'PUBLISHED',
      isPrimary: true,
      publishedAt: new Date(),
      reviewedAt: new Date(),
      reviewedBy: 'system_admin',
    },
  });

  // 5. Update Vocabulary audioUrl pointing to the resolved storage path
  await prisma.vocabulary.update({
    where: { id: targetVocab.id },
    data: {
      audioUrl: `/audio/${storageKey}`,
    },
  });

  console.log(`✓ Created Sample AudioAsset: ID ${sampleAsset.id} for "${sampleAsset.sourceText}"`);
  console.log(`✓ Linked Vocabulary "你" audioUrl -> /audio/${storageKey}`);
  console.log('🎉 Phase 1 Audio System seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
