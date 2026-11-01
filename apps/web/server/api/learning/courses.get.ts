// ============================================================================
// GET /api/learning/courses
// ============================================================================

import { defineEventHandler } from 'h3';
import { prisma } from '../../utils/prisma';
import { sendApiSuccess } from '../../utils/response';

// Fallback high-quality curriculum data in case database is offline
const FALLBACK_COURSES = [
  {
    id: 'course_hsk_band_1',
    title: 'Tiếng Trung Cơ Bản HSK 3.0 (Band 1)',
    description: 'Lộ trình nhập môn tiếng Trung chuẩn HSK 3.0 kết hợp bài tập RPG và thẻ nhớ Spaced Repetition.',
    curriculum: {
      name: 'HSK 3.0 Standard Chinese Course',
      code: 'hsk-3.0',
      level: 'Band 1 (Sơ Cấp • Cấp độ 1)',
    },
    units: [
      {
        id: 'unit_1',
        title: 'Bài 1: Chào hỏi & Làm quen (Greetings)',
        orderIndex: 1,
        theme: 'greetings',
        icon: 'Sparkles',
        lessons: [
          {
            id: 'lesson_1_1',
            title: 'Lời chào cơ bản & Đại từ nhân xưng',
            description: 'Học cách chào hỏi thông dụng và xưng hô chuẩn mực: 你, 好, 您, 我, 他, 她...',
            orderIndex: 1,
            expReward: 60,
            goldReward: 25,
            vocabularyCount: 12,
            isCompleted: true,
            hanziPreview: ['你', '好', '您', '我', '他'],
          },
          {
            id: 'lesson_1_2',
            title: 'Hỏi tên, quốc gia & Lời cảm ơn',
            description: 'Học cách xưng danh, hỏi tên và cảm ơn người khác: 叫, 什么, 名字, 中国, 越南, 谢谢...',
            orderIndex: 2,
            expReward: 60,
            goldReward: 25,
            vocabularyCount: 14,
            isCompleted: false,
            hanziPreview: ['叫', '什', '名', '谢', '国'],
          },
        ],
      },
      {
        id: 'unit_2',
        title: 'Bài 2: Số đếm, Thời gian & Tiền tệ (Numbers & Time)',
        orderIndex: 2,
        theme: 'numbers',
        icon: 'Coins',
        lessons: [
          {
            id: 'lesson_2_1',
            title: 'Số đếm từ 1 đến 10 & Trăm, Nghìn',
            description: 'Làm chủ các con số căn bản trong giao dịch: 一, 二, 三, 四, 五, 六, 七, 八, 九, 十...',
            orderIndex: 3,
            expReward: 60,
            goldReward: 25,
            vocabularyCount: 15,
            isCompleted: false,
            hanziPreview: ['一', '二', '三', '百', '千'],
          },
          {
            id: 'lesson_2_2',
            title: 'Ngày, Giờ, Tuần & Hỏi giá tiền',
            description: 'Cách hẹn gặp, hỏi giờ và trả giá khi mua đồ: 今天, 明天, 星期, 点, 分, 钱, 块...',
            orderIndex: 4,
            expReward: 60,
            goldReward: 25,
            vocabularyCount: 16,
            isCompleted: false,
            hanziPreview: ['今', '明', '星', '点', '钱'],
          },
        ],
      },
      {
        id: 'unit_3',
        title: 'Bài 3: Gia đình & Đồ vật (Family & Everyday Items)',
        orderIndex: 3,
        theme: 'family',
        icon: 'Heart',
        lessons: [
          {
            id: 'lesson_3_1',
            title: 'Các thành viên trong gia đình',
            description: 'Giới thiệu người thân và gia đình: 爸爸, 妈妈, 儿子, 女儿, 家, 有, 没...',
            orderIndex: 5,
            expReward: 60,
            goldReward: 25,
            vocabularyCount: 14,
            isCompleted: false,
            hanziPreview: ['爸', '妈', '儿', '家', '有'],
          },
          {
            id: 'lesson_3_2',
            title: 'Chỉ định từ & Sách vở đồ dùng',
            description: 'Mô tả đồ dùng cá nhân và sách vở: 这, 那, 书, 个, 哪...',
            orderIndex: 6,
            expReward: 60,
            goldReward: 25,
            vocabularyCount: 12,
            isCompleted: false,
            hanziPreview: ['这', '那', '书', '个', '本'],
          },
        ],
      },
      {
        id: 'unit_4',
        title: 'Bài 4: Ăn uống & Mua sắm (Food, Drinks & Shopping)',
        orderIndex: 4,
        theme: 'food',
        icon: 'Utensils',
        lessons: [
          {
            id: 'lesson_4_1',
            title: 'Món ăn, Thức uống & Trái cây',
            description: 'Gọi món và thưởng thức ẩm thực: 吃, 喝, 茶, 水, 米饭, 菜, 苹果, 水果...',
            orderIndex: 7,
            expReward: 60,
            goldReward: 25,
            vocabularyCount: 16,
            isCompleted: false,
            hanziPreview: ['吃', '喝', '茶', '米', '果'],
          },
          {
            id: 'lesson_4_2',
            title: 'Mua bán & Sở thích ẩm thực',
            description: 'Giao dịch mua sắm và bày tỏ sở thích: 买, 卖, 喜欢, 想, 太...',
            orderIndex: 8,
            expReward: 60,
            goldReward: 25,
            vocabularyCount: 15,
            isCompleted: false,
            hanziPreview: ['买', '卖', '喜', '欢', '想'],
          },
        ],
      },
      {
        id: 'unit_5',
        title: 'Bài 5: Hoạt động học tập & Địa điểm (Study & Places)',
        orderIndex: 5,
        theme: 'places',
        icon: 'MapPin',
        lessons: [
          {
            id: 'lesson_5_1',
            title: 'Các giác quan & Kỹ năng học tập',
            description: 'Các kỹ năng giao tiếp và ngôn ngữ: 看, 听, 说, 读, 写, 学习, 汉字, 汉语...',
            orderIndex: 9,
            expReward: 60,
            goldReward: 25,
            vocabularyCount: 16,
            isCompleted: false,
            hanziPreview: ['看', '听', '说', '读', '写'],
          },
          {
            id: 'lesson_5_2',
            title: 'Đi lại, Địa điểm & Tính từ mô tả',
            description: 'Chỉ đường, khám phá địa danh: 去, 来, 回, 在, 学校, 医院, 商店, 大, 小...',
            orderIndex: 10,
            expReward: 60,
            goldReward: 25,
            vocabularyCount: 18,
            isCompleted: false,
            hanziPreview: ['去', '来', '校', '院', '店'],
          },
        ],
      },
    ],
  },
];

export default defineEventHandler(async (event) => {
  const user = event.context.user;

  try {
    const courses = await prisma.course.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        curriculumLevel: {
          include: {
            curriculum: true,
          },
        },
        units: {
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
              select: {
                id: true,
                title: true,
                description: true,
                orderIndex: true,
                expReward: true,
                goldReward: true,
                _count: {
                  select: { vocabulary: true },
                },
              },
            },
          },
        },
      },
    });

    if (!courses || courses.length === 0) {
      return sendApiSuccess(event, { courses: FALLBACK_COURSES });
    }

    // If user is authenticated, compute lesson completion status from learning_sessions
    let completedLessonIds = new Set<string>();
    if (user) {
      const completedSessions = await prisma.learningSession.findMany({
        where: {
          userId: user.id,
          status: 'completed',
          lessonId: { not: null },
        },
        select: { lessonId: true },
      });
      completedLessonIds = new Set(completedSessions.map((s) => s.lessonId!));
    }

    const coursesWithStatus = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      curriculum: {
        name: course.curriculumLevel?.curriculum?.name || 'HSK 3.0',
        code: course.curriculumLevel?.curriculum?.code || 'hsk-3.0',
        level: course.curriculumLevel?.name || 'Band 1',
      },
      units: course.units.map((unit) => ({
        id: unit.id,
        title: unit.title,
        orderIndex: unit.orderIndex,
        lessons: unit.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          orderIndex: lesson.orderIndex,
          expReward: lesson.expReward,
          goldReward: lesson.goldReward,
          vocabularyCount: lesson._count.vocabulary,
          isCompleted: completedLessonIds.has(lesson.id),
          hanziPreview: ['你', '好', '学', '习', '书'],
        })),
      })),
    }));

    return sendApiSuccess(event, { courses: coursesWithStatus });
  } catch (err) {
    console.warn('[CoursesAPI] Database unreachable, serving resilient fallback curriculum:', err);
    return sendApiSuccess(event, { courses: FALLBACK_COURSES });
  }
});
