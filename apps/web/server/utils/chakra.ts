// ============================================================================
// Chakra Learning Milestones — 7-Chakra Language Proficiency Engine
// ============================================================================
// Aligned with docs/chakra-milestone-architecture.md & PRD Section 7.
// Principles:
// 1. Decoupled from RPG Character Level (EXP vs FSRS Retention & Skill Competency).
// 2. Non-punitive: Once unlocked, a chakra is NEVER demoted or relocked.
// 3. Server-authoritative: All metrics calculated strictly on backend from FSRS & answers.
// 4. Idempotent reward distribution for cosmetic auras & items.

import { prisma } from './prisma';

export interface ChakraTierConfig {
  tier: number; // 1 to 7
  code: string;
  nameVi: string;
  sanskritName: string;
  hskBand: string;
  elementVi: string;
  colorHex: string;
  bgGradient: string;
  targetVocabCount: number; // Target number of retained words
  requiredStabilityDays: number; // FSRS stability threshold
  rewardItemCode: string;
  rewardItemName: string;
  regionCode: string;
  regionNameVi: string;
  descriptionVi: string;
}

export const CHAKRA_DEFINITIONS: ChakraTierConfig[] = [
  {
    tier: 1,
    code: 'muladhara',
    nameVi: 'Muladhara (Luân Xa Gốc)',
    sanskritName: 'Mūlādhāra',
    hskBand: 'HSK 3.0 Band 1',
    elementVi: 'Đất (Địa Luân)',
    colorHex: '#EF4444', // Red
    bgGradient: 'from-red-600 via-rose-600 to-amber-700',
    targetVocabCount: 20, // Baseline for MVP HSK Band 1 core
    requiredStabilityDays: 2.5, // FSRS stability >= 2.5 days
    rewardItemCode: 'item_aura_muladhara_red',
    rewardItemName: 'Hào Quang Muladhara (Xích Diễm Luân)',
    regionCode: 'region_novice_village',
    regionNameVi: 'Tân Khởi Thôn (Novice Village)',
    descriptionVi: 'Căn cơ sinh tồn, làm chủ ngữ âm Pinyin và 100 chữ Hán căn bản đầu tiên.',
  },
  {
    tier: 2,
    code: 'svadhisthana',
    nameVi: 'Svadhisthana (Luân Xa Xương Cùng)',
    sanskritName: 'Svādhiṣṭhāna',
    hskBand: 'HSK 3.0 Band 2',
    elementVi: 'Nước (Thủy Luân)',
    colorHex: '#F97316', // Orange
    bgGradient: 'from-orange-600 via-amber-600 to-yellow-600',
    targetVocabCount: 50,
    requiredStabilityDays: 5.0,
    rewardItemCode: 'item_aura_svadhisthana_orange',
    rewardItemName: 'Hào Quang Svadhisthana (Trừng Hà Luân)',
    regionCode: 'region_bamboo_grove',
    regionNameVi: 'Trúc Lâm Thôn (Bamboo Grove)',
    descriptionVi: 'Biểu đạt cảm xúc, diễn tả thói quen sinh hoạt và tương tác thường nhật.',
  },
  {
    tier: 3,
    code: 'manipura',
    nameVi: 'Manipura (Luân Xa Đám Rối Dương)',
    sanskritName: 'Maṇipūra',
    hskBand: 'HSK 3.0 Band 3',
    elementVi: 'Lửa (Hỏa Luân)',
    colorHex: '#EAB308', // Yellow / Gold
    bgGradient: 'from-yellow-500 via-amber-500 to-gold-600',
    targetVocabCount: 100,
    requiredStabilityDays: 7.0,
    rewardItemCode: 'item_aura_manipura_yellow',
    rewardItemName: 'Hào Quang Manipura (Kim Dương Luân)',
    regionCode: 'region_ancient_market',
    regionNameVi: 'Cổ Nhai Thị Thành (Ancient Market)',
    descriptionVi: 'Tự chủ giao tiếp thương nghiệp, du lịch và giải quyết các tình huống thực tế.',
  },
  {
    tier: 4,
    code: 'anahata',
    nameVi: 'Anahata (Luân Xa Tim)',
    sanskritName: 'Anāhata',
    hskBand: 'HSK 3.0 Band 4',
    elementVi: 'Khí (Phong Luân)',
    colorHex: '#10B981', // Green
    bgGradient: 'from-emerald-500 via-teal-600 to-green-700',
    targetVocabCount: 200,
    requiredStabilityDays: 10.0,
    rewardItemCode: 'item_aura_anahata_green',
    rewardItemName: 'Hào Quang Anahata (Thúy Phong Luân)',
    regionCode: 'region_cloud_pavilion',
    regionNameVi: 'Vân Các Thư Viện (Cloud Pavilion)',
    descriptionVi: 'Thấu hiểu chiều sâu văn hóa, xã hội và biểu đạt quan điểm trung cấp.',
  },
  {
    tier: 5,
    code: 'vishuddha',
    nameVi: 'Vishuddha (Luân Xa Cổ Họng)',
    sanskritName: 'Viśuddha',
    hskBand: 'HSK 3.0 Band 5',
    elementVi: 'Không Gian (Hư Luân)',
    colorHex: '#06B6D4', // Cyan
    bgGradient: 'from-cyan-500 via-sky-600 to-blue-700',
    targetVocabCount: 350,
    requiredStabilityDays: 14.0,
    rewardItemCode: 'item_aura_vishuddha_cyan',
    rewardItemName: 'Hào Quang Vishuddha (Bích Không Luân)',
    regionCode: 'region_dragons_peak',
    regionNameVi: 'Long Đỉnh Sơn (Dragon Peak)',
    descriptionVi: 'Hùng biện, thuyết phục, đọc hiểu bình luận báo chí và văn bản chính luận.',
  },
  {
    tier: 6,
    code: 'ajna',
    nameVi: 'Ajna (Luân Xa Mắt Thứ Ba)',
    sanskritName: 'Ājñā',
    hskBand: 'HSK 3.0 Band 6',
    elementVi: 'Ánh Sáng (Quang Luân)',
    colorHex: '#6366F1', // Indigo
    bgGradient: 'from-indigo-600 via-blue-700 to-purple-800',
    targetVocabCount: 500,
    requiredStabilityDays: 21.0,
    rewardItemCode: 'item_aura_ajna_indigo',
    rewardItemName: 'Hào Quang Ajna (Minh Quang Luân)',
    regionCode: 'region_celestial_temple',
    regionNameVi: 'Thái Cực Thánh Điện (Celestial Temple)',
    descriptionVi: 'Trực giác ngôn ngữ sâu sắc, lĩnh hội thành ngữ (thành ngữ), ẩn ý và điển cố.',
  },
  {
    tier: 7,
    code: 'sahasrara',
    nameVi: 'Sahasrara (Luân Xa Vương Miện)',
    sanskritName: 'Sahasrāra',
    hskBand: 'HSK 3.0 Band 7-9',
    elementVi: 'Tư Tưởng (Viên Mãn Luân)',
    colorHex: '#A855F7', // Violet
    bgGradient: 'from-purple-600 via-fuchsia-600 to-violet-800',
    targetVocabCount: 750,
    requiredStabilityDays: 30.0,
    rewardItemCode: 'item_aura_sahasrara_purple',
    rewardItemName: 'Hào Quang Sahasrara (Tử Khí Đông Lai)',
    regionCode: 'region_immortal_realm',
    regionNameVi: 'Hư Không Tiên Giới (Immortal Realm)',
    descriptionVi: 'Đại ngộ ngôn ngữ, làm chủ học thuật chuyên sâu và đàm đạo văn chương kinh điển.',
  },
];

/**
 * Ensures all 7 cosmetic Aura reward items exist in the database.
 */
export async function ensureChakraRewardItems(tx: any = prisma) {
  for (const def of CHAKRA_DEFINITIONS) {
    await tx.item.upsert({
      where: { code: def.rewardItemCode },
      update: {
        name: def.rewardItemName,
        description: `Vật phẩm hào quang độc bản nhận được khi khai mở 100% ${def.nameVi}.`,
        itemType: 'COSMETIC',
        slot: 'AURA',
        rarity: def.tier >= 6 ? 'LEGENDARY' : def.tier >= 3 ? 'EPIC' : 'RARE',
        icon: 'Sparkles',
        stats: JSON.stringify({
          chakraTier: def.tier,
          auraColorHex: def.colorHex,
          bonusExpPercent: 5 + def.tier,
        }),
      },
      create: {
        code: def.rewardItemCode,
        name: def.rewardItemName,
        description: `Vật phẩm hào quang độc bản nhận được khi khai mở 100% ${def.nameVi}.`,
        itemType: 'COSMETIC',
        slot: 'AURA',
        rarity: def.tier >= 6 ? 'LEGENDARY' : def.tier >= 3 ? 'EPIC' : 'RARE',
        priceGold: 0,
        icon: 'Sparkles',
        isShopItem: false,
        stats: JSON.stringify({
          chakraTier: def.tier,
          auraColorHex: def.colorHex,
          bonusExpPercent: 5 + def.tier,
        }),
      },
    });
  }
}

/**
 * Server-authoritative Chakra Evaluation Service.
 * Evaluates FSRS stability, retained vocab count, and skill accuracy without trusting client data.
 */
export async function evaluateUserChakraProgress(userId: string, tx: any = prisma) {
  // 1. Ensure cosmetic aura items exist
  await ensureChakraRewardItems(tx);

  // 2. Fetch all user vocabulary progress records (FSRS state)
  const vocabList = await tx.vocabularyProgress.findMany({
    where: { userId },
    select: {
      vocabularyId: true,
      stability: true,
      difficulty: true,
      state: true,
      totalReviews: true,
      correctReviews: true,
      lastReviewedAt: true,
    },
  });

  // Calculate average stability
  const totalWords = vocabList.length;
  const avgStability = totalWords > 0
    ? Number((vocabList.reduce((acc: number, v: any) => acc + (v.stability || 0), 0) / totalWords).toFixed(2))
    : 0.0;

  // 3. Fetch user learning answers to compute objective skill accuracies
  const answers = await tx.learningAnswer.findMany({
    where: { userId },
    select: {
      activityType: true,
      isCorrect: true,
    },
    take: 500, // Look at recent 500 answer interactions
    orderBy: { createdAt: 'desc' },
  });

  const skillBuckets: Record<string, { total: number; correct: number }> = {
    listening: { total: 0, correct: 0 },
    reading: { total: 0, correct: 0 },
    writing: { total: 0, correct: 0 },
    character: { total: 0, correct: 0 },
  };

  for (const ans of answers) {
    let bucket = 'reading';
    if (ans.activityType === 'flashcard' || ans.activityType === 'audio') {
      bucket = 'listening';
    } else if (ans.activityType === 'writing' || ans.activityType === 'stroke') {
      bucket = 'writing';
    } else if (ans.activityType === 'radical' || ans.activityType === 'quiz') {
      bucket = 'character';
    } else {
      bucket = 'reading';
    }

    skillBuckets[bucket].total += 1;
    if (ans.isCorrect) skillBuckets[bucket].correct += 1;
  }

  // Calculate accuracies (default to 0.85 baseline if user hasn't completed enough answers in that mode)
  const calcAccuracy = (b: { total: number; correct: number }) => {
    if (b.total < 3) return 0.85; // Sensible non-punitive baseline for new learners
    return Number((b.correct / b.total).toFixed(2));
  };

  const listeningAccuracy = calcAccuracy(skillBuckets.listening);
  const readingAccuracy = calcAccuracy(skillBuckets.reading);
  const writingAccuracy = calcAccuracy(skillBuckets.writing);
  const characterAccuracy = calcAccuracy(skillBuckets.character);

  const avgSkillAccuracy = (listeningAccuracy + readingAccuracy + writingAccuracy + characterAccuracy) / 4;

  // 4. Load existing chakra progress records for this user
  const existingProgress = await tx.userChakraProgress.findMany({
    where: { userId },
  });
  const existingMap = new Map<number, any>(existingProgress.map((p: any) => [p.chakraTier, p]));

  const updatedResults: any[] = [];
  let highestUnlockedTier = 0;
  let activeAuraColorHex: string | null = null;
  const newlyUnlockedTiers: number[] = [];

  // 5. Evaluate each of the 7 Chakras
  for (const def of CHAKRA_DEFINITIONS) {
    const existing = existingMap.get(def.tier);

    // Retained vocabulary count: words with FSRS stability >= required threshold
    const retainedVocabCount = vocabList.filter(
      (v: any) => (v.stability || 0) >= def.requiredStabilityDays && v.state !== 'new'
    ).length;

    // Detect skill bottleneck according to non-punitive diagnostic flow (§Part C)
    let bottleneckSkill: string | null = null;
    if (retainedVocabCount < Math.round(def.targetVocabCount * 0.4)) {
      bottleneckSkill = 'retention';
    } else if (characterAccuracy < 0.72) {
      bottleneckSkill = 'character';
    } else if (listeningAccuracy < 0.72) {
      bottleneckSkill = 'listening';
    } else if (writingAccuracy < 0.72) {
      bottleneckSkill = 'writing';
    } else if (readingAccuracy < 0.72) {
      bottleneckSkill = 'reading';
    }

    // Progression formula (65% retained vocabulary + 35% skill proficiency)
    const vocabRatio = Math.min(1.0, retainedVocabCount / def.targetVocabCount);
    let calculatedPercent = Math.round((vocabRatio * 65 + avgSkillAccuracy * 35) * 10) / 10;
    calculatedPercent = Math.max(0, Math.min(100, calculatedPercent));

    // Non-punitive constraint: percent never regresses below max previously reached if already unlocked
    const wasUnlocked = existing?.isUnlocked || false;
    const isNowUnlocked = wasUnlocked || calculatedPercent >= 100.0;
    const finalPercent = wasUnlocked ? 100.0 : calculatedPercent;

    if (!wasUnlocked && isNowUnlocked) {
      newlyUnlockedTiers.push(def.tier);
    }

    if (isNowUnlocked && def.tier > highestUnlockedTier) {
      highestUnlockedTier = def.tier;
      activeAuraColorHex = def.colorHex;
    }

    // Idempotent reward claiming for cosmetic aura
    let rewardClaimed = existing?.rewardClaimed || false;
    let rewardClaimedAt = existing?.rewardClaimedAt || null;

    if (isNowUnlocked && !rewardClaimed) {
      // Find the reward item
      const auraItem = await tx.item.findUnique({
        where: { code: def.rewardItemCode },
      });

      if (auraItem) {
        // Upsert into Inventory with isEquipped: true
        await tx.inventoryItem.upsert({
          where: {
            userId_itemId: {
              userId,
              itemId: auraItem.id,
            },
          },
          update: {
            isEquipped: true,
          },
          create: {
            userId,
            itemId: auraItem.id,
            quantity: 1,
            isEquipped: true,
          },
        });
      }

      rewardClaimed = true;
      rewardClaimedAt = new Date();
    }

    // Upsert UserChakraProgress record
    const updatedRecord = await tx.userChakraProgress.upsert({
      where: {
        userId_chakraTier: {
          userId,
          chakraTier: def.tier,
        },
      },
      update: {
        progressPercent: finalPercent,
        retainedVocabCount,
        targetVocabCount: def.targetVocabCount,
        avgStability,
        listeningAccuracy,
        readingAccuracy,
        writingAccuracy,
        characterAccuracy,
        isUnlocked: isNowUnlocked,
        unlockedAt: isNowUnlocked && !existing?.unlockedAt ? new Date() : existing?.unlockedAt,
        rewardClaimed,
        rewardClaimedAt,
        bottleneckSkill,
      },
      create: {
        userId,
        chakraTier: def.tier,
        progressPercent: finalPercent,
        retainedVocabCount,
        targetVocabCount: def.targetVocabCount,
        avgStability,
        listeningAccuracy,
        readingAccuracy,
        writingAccuracy,
        characterAccuracy,
        isUnlocked: isNowUnlocked,
        unlockedAt: isNowUnlocked ? new Date() : null,
        rewardClaimed,
        rewardClaimedAt,
        bottleneckSkill,
      },
    });

    updatedResults.push({
      ...def,
      progressPercent: updatedRecord.progressPercent,
      retainedVocabCount: updatedRecord.retainedVocabCount,
      avgStability: updatedRecord.avgStability,
      listeningAccuracy: updatedRecord.listeningAccuracy,
      readingAccuracy: updatedRecord.readingAccuracy,
      writingAccuracy: updatedRecord.writingAccuracy,
      characterAccuracy: updatedRecord.characterAccuracy,
      isUnlocked: updatedRecord.isUnlocked,
      unlockedAt: updatedRecord.unlockedAt,
      rewardClaimed: updatedRecord.rewardClaimed,
      bottleneckSkill: updatedRecord.bottleneckSkill,
    });
  }

  // Determine active tier (highest unlocked tier, or Tier 1 if still cultivating)
  const activeTier = highestUnlockedTier > 0 ? highestUnlockedTier : 1;
  const currentChakraConfig = CHAKRA_DEFINITIONS[activeTier - 1];

  // List of unlocked regions based on unlocked chakras
  const unlockedRegions = CHAKRA_DEFINITIONS
    .filter((d) => d.tier <= Math.max(1, highestUnlockedTier))
    .map((d) => d.regionCode);

  return {
    chakras: updatedResults,
    activeChakraTier: activeTier,
    activeAuraColorHex: activeAuraColorHex || currentChakraConfig.colorHex,
    highestUnlockedTier,
    unlockedRegions,
    newlyUnlockedTiers,
  };
}

/**
 * Get cached or evaluate chakra status for a user.
 */
export async function getUserChakraStatus(userId: string) {
  return await evaluateUserChakraProgress(userId, prisma);
}
