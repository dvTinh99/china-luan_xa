// ============================================================================
// LinguaWorld — Database Seeder (Phase 1: HSK 3.0 Band 1 Data)
// ============================================================================

import { getPrismaClient, resolveDriver } from './client.mjs';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = await getPrismaClient();

async function main() {
  console.log('🌱 Starting LinguaWorld database seeding...');

  // 1. Seed Curriculum
  const curriculum = await prisma.curriculum.upsert({
    where: { code: 'hsk-3.0' },
    update: {},
    create: {
      code: 'hsk-3.0',
      name: 'HSK 3.0 Standard Chinese Course',
      version: '3.0',
      languageCode: 'zh',
      translationLanguageCode: 'vi',
      sourceUrl: 'https://admin.chinesetest.cn/godownload.do',
      licenseName: 'Ministry of Education of PRC / Open Syllabus',
      licenseUrl: 'https://www.moe.gov.cn/',
      status: 'active',
    },
  });
  console.log(`✓ Curriculum: ${curriculum.name} (${curriculum.code})`);

  // 2. Seed Curriculum Level
  const level1 = await prisma.curriculumLevel.upsert({
    where: {
      curriculumId_code: {
        curriculumId: curriculum.id,
        code: 'hsk-3.0-band-1',
      },
    },
    update: {},
    create: {
      curriculumId: curriculum.id,
      code: 'hsk-3.0-band-1',
      name: 'Band 1 (Elementary - Cấp độ 1)',
      sequenceNumber: 1,
    },
  });
  console.log(`✓ Curriculum Level: ${level1.name}`);

  // 3. Seed Course
  let course = await prisma.course.findFirst({
    where: { curriculumLevelId: level1.id },
  });
  if (!course) {
    course = await prisma.course.create({
      data: {
        curriculumLevelId: level1.id,
        title: 'Tiếng Trung Cơ Bản HSK 3.0 (Band 1)',
        description: 'Khóa học tiếng Trung sơ cấp theo chuẩn mới HSK 3.0 kết hợp bài tập tương tác 2D RPG.',
        orderIndex: 1,
      },
    });
  }
  console.log(`✓ Course: ${course.title}`);

  // 4. Seed Units & Lessons
  const unitsData = [
    {
      unitIndex: 1,
      title: 'Bài 1: Chào hỏi & Làm quen (Greetings)',
      lessons: [
        { index: 1, title: 'Lời chào cơ bản & Đại từ nhân xưng', desc: 'Học cách chào hỏi: 你, 好, 您, 我, 他, 她...', exp: 60, gold: 25 },
        { index: 2, title: 'Hỏi tên, quốc gia & Lời cảm ơn', desc: 'Hỏi tên: 叫, 什么, 名字, 中国, 越南, 谢谢...', exp: 60, gold: 25 },
      ],
    },
    {
      unitIndex: 2,
      title: 'Bài 2: Số đếm, Thời gian & Tiền tệ (Numbers & Time)',
      lessons: [
        { index: 3, title: 'Số đếm từ 1 đến 10 & Trăm, Nghìn', desc: 'Các con số: 一, 二, 三, 四, 五, 六, 七, 八, 九, 十, 百, 千...', exp: 60, gold: 25 },
        { index: 4, title: 'Ngày, Giờ, Tuần & Hỏi giá tiền', desc: 'Thời gian: 今天, 明天, 星期, 点, 分, 钱, 块...', exp: 60, gold: 25 },
      ],
    },
    {
      unitIndex: 3,
      title: 'Bài 3: Gia đình & Đồ vật (Family & Everyday Items)',
      lessons: [
        { index: 5, title: 'Các thành viên trong gia đình', desc: 'Gia đình: 爸爸, 妈妈, 儿子, 女儿, 家, 有, 没...', exp: 60, gold: 25 },
        { index: 6, title: 'Chỉ định từ & Sách vở', desc: 'Đồ vật: 这, 那, 书, 个...', exp: 60, gold: 25 },
      ],
    },
    {
      unitIndex: 4,
      title: 'Bài 4: Ăn uống & Mua sắm (Food, Drinks & Shopping)',
      lessons: [
        { index: 7, title: 'Món ăn, Thức uống & Trái cây', desc: 'Ẩm thực: 吃, 喝, 茶, 水, 米饭, 菜, 苹果, 水果...', exp: 60, gold: 25 },
        { index: 8, title: 'Mua bán & Sở thích', desc: 'Giao dịch: 买, 卖, 喜欢, 想...', exp: 60, gold: 25 },
      ],
    },
    {
      unitIndex: 5,
      title: 'Bài 5: Hoạt động học tập & Địa điểm (Study & Places)',
      lessons: [
        { index: 9, title: 'Các giác quan & Kỹ năng học tập', desc: 'Kỹ năng: 看, 听, 说, 读, 写, 学习, 汉字, 汉语...', exp: 60, gold: 25 },
        { index: 10, title: 'Đi lại, Địa điểm & Tính từ mô tả', desc: 'Nơi chốn: 去, 来, 回, 在, 学校, 医院, 商店, 大, 小, 好...', exp: 60, gold: 25 },
      ],
    },
  ];

  const lessonMap = new Map();

  for (const u of unitsData) {
    let unit = await prisma.unit.findFirst({
      where: { courseId: course.id, orderIndex: u.unitIndex },
    });
    if (!unit) {
      unit = await prisma.unit.create({
        data: {
          courseId: course.id,
          title: u.title,
          orderIndex: u.unitIndex,
        },
      });
    }

    for (const l of u.lessons) {
      let lesson = await prisma.lesson.findFirst({
        where: { unitId: unit.id, orderIndex: l.index },
      });
      if (!lesson) {
        lesson = await prisma.lesson.create({
          data: {
            unitId: unit.id,
            title: l.title,
            description: l.desc,
            orderIndex: l.index,
            expReward: l.exp,
            goldReward: l.gold,
          },
        });
      }
      lessonMap.set(l.index, lesson.id);
    }
  }
  console.log(`✓ Seeded ${unitsData.length} units and ${lessonMap.size} lessons.`);

  // 5. Seed Vocabulary from JSON
  const rawData = fs.readFileSync(path.join(__dirname, 'seed_data.json'), 'utf8');
  const vocabList = JSON.parse(rawData);

  console.log(`Loading ${vocabList.length} vocabulary entries...`);

  let count = 0;
  const createdVocabIds = [];

  for (let i = 0; i < vocabList.length; i++) {
    const item = vocabList[i];
    const unitNum = item.unit || 1;
    // Map unit 1 -> lesson 1 & 2; unit 2 -> lesson 3 & 4; etc.
    const lessonIdx = (unitNum - 1) * 2 + (i % 2 === 0 ? 1 : 2);
    const assignedLessonId = lessonMap.get(lessonIdx) || null;

    let vocab = await prisma.vocabulary.findFirst({
      where: { simplified: item.simplified },
    });

    if (!vocab) {
      vocab = await prisma.vocabulary.create({
        data: {
          simplified: item.simplified,
          languageCode: 'zh',
          audioUrl: item.audioUrl || null,
          readings: {
            create: [
              {
                reading: item.reading,
                readingSystem: 'pinyin',
                isPrimary: true,
              },
            ],
          },
          meanings: {
            create: [
              {
                meaning: item.meaning,
                languageCode: 'vi',
                partOfSpeech: item.partOfSpeech || 'noun',
              },
            ],
          },
          examples: item.example
            ? {
                create: [
                  {
                    sentenceZh: item.example.zh,
                    sentencePinyin: item.example.pinyin,
                    translationVi: item.example.vi,
                  },
                ],
              }
            : undefined,
          curriculumEntries: {
            create: [
              {
                curriculumLevelId: level1.id,
                sequenceNumber: i + 1,
                lessonId: assignedLessonId,
              },
            ],
          },
        },
      });
    }

    createdVocabIds.push(vocab.id);
    count++;
  }
  console.log(`✓ Seeded ${count} vocabulary items with pinyin, meanings & sample sentences.`);

  // 6. Seed Demo User, Character & Wallet
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@linguaworld.dev' },
    update: {},
    create: {
      id: 'demo-user-001',
      email: 'demo@linguaworld.dev',
      username: 'DemoExplorer',
      passwordHash: passwordHash,
      settings: {
        create: {
          targetDailyReviews: 20,
          soundEnabled: true,
          pinyinDisplay: true,
        },
      },
      character: {
        create: {
          id: 'char-001',
          name: '小龙 (Tiểu Long)',
          level: 1,
          exp: 0,
          hp: 100,
          maxHp: 100,
        },
      },
      wallet: {
        create: {
          balanceGold: 100,
        },
      },
    },
    include: {
      character: true,
      wallet: true,
    },
  });

  console.log(`✓ Seeded Demo User: ${demoUser.username} (${demoUser.email})`);
  console.log(`✓ Character: ${demoUser.character?.name} | Lv.${demoUser.character?.level}`);
  console.log(`✓ Wallet: ${demoUser.wallet?.balanceGold} Gold`);

  // 7. Seed Initial Spaced Repetition (SRS) items for Demo User
  // Initialize SRS progress for the first 12 words so user has due reviews right away
  const initialSrsWords = createdVocabIds.slice(0, 12);
  for (let j = 0; j < initialSrsWords.length; j++) {
    const vocabId = initialSrsWords[j];
    await prisma.vocabularyProgress.upsert({
      where: {
        userId_vocabularyId: {
          userId: demoUser.id,
          vocabularyId: vocabId,
        },
      },
      update: {},
      create: {
        userId: demoUser.id,
        vocabularyId: vocabId,
        state: j < 4 ? 'review' : 'learning',
        difficulty: 4.8,
        stability: 1.2,
        intervalDays: 1,
        // Make half of them due right now
        dueAt: new Date(Date.now() - (j % 2 === 0 ? 3600000 : -86400000)),
        lastReviewedAt: new Date(Date.now() - 86400000),
        totalReviews: 2,
        correctReviews: 2,
        algorithmVersion: 'fsrs-v1',
      },
    });
  }
  console.log(`✓ Initialized SRS progress for ${initialSrsWords.length} words (due reviews ready).`);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

