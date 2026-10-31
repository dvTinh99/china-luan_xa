// ============================================================================
// GET /api/learning/courses
// ============================================================================

import { defineEventHandler } from 'h3';
import { prisma } from '../../utils/prisma';
import { sendApiSuccess } from '../../utils/response';

export default defineEventHandler(async (event) => {
  const user = event.context.user;

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
      name: course.curriculumLevel.curriculum.name,
      code: course.curriculumLevel.curriculum.code,
      level: course.curriculumLevel.name,
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
      })),
    })),
  }));

  return sendApiSuccess(event, { courses: coursesWithStatus });
});

