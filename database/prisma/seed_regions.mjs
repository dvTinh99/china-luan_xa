// ============================================================================
// Seed Regions for Phase 3 Adventure World
// ============================================================================

import { getPrismaClient } from './client.mjs';

const prisma = await getPrismaClient();

const REGIONS = [
  {
    code: 'region_novice_village',
    name: 'Tân Khởi Thôn (Novice Village)',
    description: 'Ngôi làng thanh bình nơi các hiệp khách bắt đầu con đường tầm sư học đạo HSK 3.0.',
    requiredLevel: 1,
    isUnlocked: true,
    orderIndex: 1,
  },
  {
    code: 'region_bamboo_grove',
    name: 'Trúc Lâm Tịnh Uyển (Bamboo Grove)',
    description: 'Rừng trúc bạt ngàn ẩn chứa các thư tịch cổ và quái thú thử thách thanh điệu.',
    requiredLevel: 2,
    isUnlocked: false,
    orderIndex: 2,
  },
  {
    code: 'region_scholars_pavilion',
    name: 'Văn Miếu Thư Các (Scholar’s Pavilion)',
    description: 'Khu học xá uy nghiêm nơi các danh sĩ luận đàm ngữ pháp và thi thố HSK.',
    requiredLevel: 5,
    isUnlocked: false,
    orderIndex: 3,
  },
];

async function main() {
  console.log('🌲 Seeding World Regions...');
  for (const reg of REGIONS) {
    const upserted = await prisma.region.upsert({
      where: { code: reg.code },
      update: reg,
      create: reg,
    });
    console.log(`✓ Region: ${upserted.name} (Requires Lv.${upserted.requiredLevel})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

