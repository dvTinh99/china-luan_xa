// ============================================================================
// POST /api/combat/start — Start Server-Authoritative Combat Session (Phase 3)
// ============================================================================

import { defineEventHandler } from 'h3';
import { prisma } from '../../utils/prisma';
import { sendApiSuccess, sendApiError } from '../../utils/response';

const MONSTERS = [
  {
    name: 'Tiểu Thạch Quái (Stone Slime)',
    baseHp: 75,
    atk: 12,
    expReward: 35,
    goldReward: 20,
    minLevel: 1,
    icon: 'Bug',
  },
  {
    name: 'Lang Yêu Trúc Lâm (Bamboo Wolf)',
    baseHp: 110,
    atk: 16,
    expReward: 55,
    goldReward: 35,
    minLevel: 2,
    icon: 'Flame',
  },
  {
    name: 'Hắc Miêu Đạo Sĩ (Corrupted Scholar)',
    baseHp: 160,
    atk: 22,
    expReward: 80,
    goldReward: 50,
    minLevel: 4,
    icon: 'Ghost',
  },
];

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    return sendApiError(event, 401, 'UNAUTHORIZED', 'Authentication required.');
  }

  // 1. Fetch character and equipped gear
  let character = await prisma.character.findUnique({
    where: { userId: user.id },
  });

  if (!character) {
    character = await prisma.character.create({
      data: { userId: user.id, name: user.username, level: 1, exp: 0, hp: 100, maxHp: 100 },
    });
  }

  const equippedItems = await prisma.inventoryItem.findMany({
    where: { userId: user.id, isEquipped: true },
    include: { item: true },
  });

  let totalHpBonus = 0;
  for (const inv of equippedItems) {
    const stats = (inv.item.stats as any) || {};
    if (stats.hpBonus) totalHpBonus += Number(stats.hpBonus);
  }

  const effectiveMaxHp = character.maxHp + totalHpBonus;
  const playerHp = Math.min(effectiveMaxHp, Math.max(20, character.hp + totalHpBonus));

  // 2. Select enemy scaled to player level
  const eligibleMonsters = MONSTERS.filter((m) => character.level >= m.minLevel);
  const monsterTemplate = eligibleMonsters[Math.floor(Math.random() * eligibleMonsters.length)] || MONSTERS[0];

  const enemyMaxHp = monsterTemplate.baseHp + (character.level - 1) * 10;
  const enemyAtk = monsterTemplate.atk + (character.level - 1) * 2;

  // 3. Select 5 vocabulary words for questions
  const vocabs = await prisma.vocabulary.findMany({
    take: 30,
    include: {
      readings: true,
      meanings: true,
    },
  });

  if (!vocabs || vocabs.length < 4) {
    return sendApiError(event, 500, 'NO_VOCABULARY', 'Chưa có đủ từ vựng để khởi tạo trận đấu.');
  }

  // Shuffle and pick 5 question words
  const shuffled = [...vocabs].sort(() => Math.random() - 0.5);
  const selectedVocabs = shuffled.slice(0, 5);
  const allMeanings = vocabs.map((v) => v.meanings[0]?.meaning).filter(Boolean);

  const turnQuestions = selectedVocabs.map((vocab, index) => {
    const correctMeaning = vocab.meanings[0]?.meaning || 'N/A';
    const primaryPinyin = vocab.readings.find((r) => r.isPrimary)?.reading || '';
    
    // Pick 3 distractors
    const distractors = allMeanings
      .filter((m) => m !== correctMeaning)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const options = [correctMeaning, ...distractors].sort(() => Math.random() - 0.5);

    return {
      turn: index + 1,
      vocabularyId: vocab.id,
      simplified: vocab.simplified,
      pinyin: primaryPinyin,
      audioUrl: vocab.audioUrl,
      options,
      correctMeaning, // Stored on server, never returned in client question payload!
    };
  });

  // 4. Create CombatSession
  const session = await prisma.combatSession.create({
    data: {
      userId: user.id,
      enemyName: monsterTemplate.name,
      enemyHp: enemyMaxHp,
      enemyMaxHp,
      enemyAtk,
      playerHp,
      playerMaxHp: effectiveMaxHp,
      status: 'IN_PROGRESS',
      currentTurn: 1,
      turnQuestions: turnQuestions as any,
      expReward: monsterTemplate.expReward,
      goldReward: monsterTemplate.goldReward,
    },
  });

  // 5. Build first turn payload (strip correctMeaning so client cannot cheat!)
  const firstTurn = turnQuestions[0];
  const clientQuestion = {
    turn: 1,
    totalTurns: turnQuestions.length,
    vocabularyId: firstTurn.vocabularyId,
    simplified: firstTurn.simplified,
    pinyin: firstTurn.pinyin,
    audioUrl: firstTurn.audioUrl,
    options: firstTurn.options,
  };

  return sendApiSuccess(event, {
    combatSessionId: session.id,
    enemy: {
      name: session.enemyName,
      hp: session.enemyHp,
      maxHp: session.enemyMaxHp,
      atk: session.enemyAtk,
      icon: monsterTemplate.icon,
    },
    player: {
      name: character.name,
      level: character.level,
      hp: session.playerHp,
      maxHp: session.playerMaxHp,
    },
    question: clientQuestion,
  });
});

