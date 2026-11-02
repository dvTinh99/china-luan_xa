// ============================================================================
// LinguaWorld — RPG Foundation Seeder (Phase 2: Items & Quests)
// ============================================================================

import { getPrismaClient } from './client.mjs';

const prisma = await getPrismaClient();

const ITEMS = [
  // HEAD
  {
    code: 'item_scholar_hat',
    name: 'Mũ Nho Sinh (Scholar’s Cap)',
    description: 'Mũ truyền thống của tú tài, tăng 5% EXP nhận được khi học bài.',
    itemType: 'EQUIPMENT',
    slot: 'HEAD',
    rarity: 'COMMON',
    priceGold: 60,
    icon: 'GraduationCap',
    stats: { bonusExpPercent: 5 },
    isShopItem: true,
  },
  {
    code: 'item_straw_hat',
    name: 'Nón Lá Tiêu Dao (Wanderer’s Straw Hat)',
    description: 'Nón lá che sương gió trên đường hành hiệp thế giới LinguaWorld.',
    itemType: 'EQUIPMENT',
    slot: 'HEAD',
    rarity: 'COMMON',
    priceGold: 40,
    icon: 'HardHat',
    stats: { hpBonus: 10 },
    isShopItem: true,
  },
  {
    code: 'item_phoenix_crown',
    name: 'Mão Phượng Hoàng (Phoenix Crown)',
    description: 'Mão vàng đính ngọc dành cho đệ nhất thủ khoa đỗ đạt kỳ thi.',
    itemType: 'EQUIPMENT',
    slot: 'HEAD',
    rarity: 'EPIC',
    priceGold: 300,
    icon: 'Crown',
    stats: { bonusExpPercent: 15, hpBonus: 30 },
    isShopItem: true,
  },

  // WEAPON
  {
    code: 'item_bamboo_brush',
    name: 'Bút Lông Trúc Lâm (Bamboo Calligraphy Brush)',
    description: 'Cây bút lông ngàn năm luyện thư pháp, viết chữ Hán như rồng bay phượng múa.',
    itemType: 'EQUIPMENT',
    slot: 'WEAPON',
    rarity: 'COMMON',
    priceGold: 80,
    icon: 'PenTool',
    stats: { bonusExpPercent: 8 },
    isShopItem: true,
  },
  {
    code: 'item_wooden_sword',
    name: 'Mộc Kiếm Tân Thủ (Wooden Training Sword)',
    description: 'Kiếm gỗ rèn luyện võ nghệ và phản xạ trong chiến đấu.',
    itemType: 'EQUIPMENT',
    slot: 'WEAPON',
    rarity: 'COMMON',
    priceGold: 50,
    icon: 'Sword',
    stats: { hpBonus: 15 },
    isShopItem: true,
  },
  {
    code: 'item_inkstone_blade',
    name: 'Nghiên Mực Huyền Thiết (Inkstone Blade)',
    description: 'Vũ khí đặc biệt kết hợp nghiên mực cổ và lưỡi kiếm huyền thiết sắc bén.',
    itemType: 'EQUIPMENT',
    slot: 'WEAPON',
    rarity: 'RARE',
    priceGold: 220,
    icon: 'Wand2',
    stats: { bonusExpPercent: 12, hpBonus: 25 },
    isShopItem: true,
  },

  // ARMOR
  {
    code: 'item_silk_robe',
    name: 'Trường Bào Lam Điền (Scholar Silk Robe)',
    description: 'Áo choàng lụa xanh trang nhã, thanh tao của thư sinh danh gia.',
    itemType: 'EQUIPMENT',
    slot: 'ARMOR',
    rarity: 'COMMON',
    priceGold: 100,
    icon: 'Shirt',
    stats: { hpBonus: 20 },
    isShopItem: true,
  },
  {
    code: 'item_leather_vest',
    name: 'Áo Da Lữ Khách (Traveler’s Leather Vest)',
    description: 'Áo da bền bỉ, chống gai góc dọc đường gió bụi phiêu lưu.',
    itemType: 'EQUIPMENT',
    slot: 'ARMOR',
    rarity: 'COMMON',
    priceGold: 75,
    icon: 'Shield',
    stats: { hpBonus: 18 },
    isShopItem: true,
  },
  {
    code: 'item_dragon_armor',
    name: 'Chiến Bào Kim Long (Dragon scale Robe)',
    description: 'Bào giáp rồng vàng uy nghiêm tỏa khí tức bảo hộ bất khả xâm phạm.',
    itemType: 'EQUIPMENT',
    slot: 'ARMOR',
    rarity: 'LEGENDARY',
    priceGold: 500,
    icon: 'ShieldAlert',
    stats: { hpBonus: 60, bonusExpPercent: 20 },
    isShopItem: true,
  },

  // ACCESSORY
  {
    code: 'item_jade_pendant',
    name: 'Ngọc Bội Bình An (Peace Jade Pendant)',
    description: 'Miếng ngọc phỉ thúy mang lại may mắn và an tĩnh tâm hồn khi luyện phát âm.',
    itemType: 'EQUIPMENT',
    slot: 'ACCESSORY',
    rarity: 'COMMON',
    priceGold: 90,
    icon: 'Gem',
    stats: { bonusExpPercent: 6 },
    isShopItem: true,
  },
  {
    code: 'item_scroll_bag',
    name: 'Túi Da Thư Tịch (Scholar’s Scroll Bag)',
    description: 'Túi đeo bên mình đựng thẻ từ vựng và bí kíp ngữ pháp HSK.',
    itemType: 'EQUIPMENT',
    slot: 'ACCESSORY',
    rarity: 'COMMON',
    priceGold: 65,
    icon: 'Briefcase',
    stats: { hpBonus: 10 },
    isShopItem: true,
  },
  {
    code: 'item_longevity_ring',
    name: 'Nhẫn Trường Thọ Bích Ngọc (Emerald Longevity Ring)',
    description: 'Nhẫn ngọc bích quý hiếm của đạo sĩ cổ xưa giúp tinh thần minh mẫn.',
    itemType: 'EQUIPMENT',
    slot: 'ACCESSORY',
    rarity: 'RARE',
    priceGold: 200,
    icon: 'Sparkle',
    stats: { bonusExpPercent: 10, hpBonus: 20 },
    isShopItem: true,
  },

  // CONSUMABLES
  {
    code: 'item_tea_health',
    name: 'Trà Long Tỉnh Hảo Hạng (Dragon Well Tea)',
    description: 'Thức uống thanh tao, lập tức hồi phục 50 HP sau mỗi chuyến hành trình.',
    itemType: 'CONSUMABLE',
    slot: null,
    rarity: 'COMMON',
    priceGold: 25,
    icon: 'Coffee',
    stats: { healHp: 50 },
    isShopItem: true,
  },
  {
    code: 'item_ginseng_exp',
    name: 'Nhân Sâm Vạn Năm (Ancient Ginseng)',
    description: 'Dược liệu cực phẩm, lập tức ban thưởng 50 EXP rèn luyện cho nhân vật.',
    itemType: 'CONSUMABLE',
    slot: null,
    rarity: 'RARE',
    priceGold: 120,
    icon: 'Sparkles',
    stats: { grantExp: 50 },
    isShopItem: true,
  },
];

const QUESTS = [
  {
    code: 'daily_lesson_1',
    title: 'Vượt ải đầu ngày',
    description: 'Hoàn thành 1 bài học tiếng Trung bất kỳ để khai thông kinh mạch.',
    category: 'DAILY',
    targetType: 'COMPLETE_LESSON',
    targetCount: 1,
    rewardGold: 50,
    rewardExp: 30,
    icon: 'BookOpen',
    isActive: true,
  },
  {
    code: 'daily_review_10',
    title: 'Ôn cũ tri tân (温故知新)',
    description: 'Ôn tập 10 thẻ từ vựng Spaced Repetition FSRS đến hạn.',
    category: 'DAILY',
    targetType: 'REVIEW_FLASHCARDS',
    targetCount: 10,
    rewardGold: 40,
    rewardExp: 25,
    icon: 'RotateCcw',
    isActive: true,
  },
  {
    code: 'daily_quiz_perfect',
    title: 'Thần đồng phản xạ',
    description: 'Trả lời đúng 5 câu hỏi trong phần luyện tập Quiz hoặc Ghép từ.',
    category: 'DAILY',
    targetType: 'PERFECT_QUIZ',
    targetCount: 5,
    rewardGold: 60,
    rewardExp: 40,
    icon: 'Award',
    isActive: true,
  },
  {
    code: 'daily_exp_100',
    title: 'Chuyên cần rèn luyện',
    description: 'Tích lũy tối thiểu 100 điểm kinh nghiệm (EXP) trong ngày.',
    category: 'DAILY',
    targetType: 'EARN_EXP',
    targetCount: 100,
    rewardGold: 80,
    rewardExp: 50,
    icon: 'TrendingUp',
    isActive: true,
  },
];

async function main() {
  console.log('🚀 Seeding RPG Phase 2 Items & Quests...');

  // 1. Seed Items
  for (const item of ITEMS) {
    const payload = {
      ...item,
      stats: item.stats ? JSON.stringify(item.stats) : null,
    };
    await prisma.item.upsert({
      where: { code: item.code },
      update: payload,
      create: payload,
    });
    console.log(`✓ Item: ${item.name} (${item.priceGold} Gold)`);
  }

  // 2. Seed Quests
  for (const quest of QUESTS) {
    await prisma.quest.upsert({
      where: { code: quest.code },
      update: quest,
      create: quest,
    });
    console.log(`✓ Quest: ${quest.title} (+${quest.rewardGold} Gold)`);
  }

  // 3. Give initial test gold to existing users if they have low balance
  const users = await prisma.user.findMany({ include: { wallet: true } });
  for (const user of users) {
    if (user.wallet && user.wallet.balanceGold < 150) {
      await prisma.wallet.update({
        where: { id: user.wallet.id },
        data: { balanceGold: 500 },
      });
      console.log(`✓ Top-up 500 Gold for user: ${user.username}`);
    }
  }

  console.log('🎉 Phase 2 RPG Items & Quests seeded successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

