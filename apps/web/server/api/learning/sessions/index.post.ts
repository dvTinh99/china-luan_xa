// ============================================================================
// POST /api/learning/sessions
// ============================================================================

import { defineEventHandler, readBody } from 'h3';
import { z } from 'zod';
import { prisma } from '../../../utils/prisma';
import { sendApiSuccess, sendApiError } from '../../../utils/response';

const createSessionSchema = z.object({
  lessonId: z.string().optional(),
  sessionType: z.enum(['lesson', 'review', 'practice']).default('lesson'),
});

export default defineEventHandler(async (event) => {
  const user = event.context.user;

  if (!user) {
    return sendApiError(event, 401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const body = await readBody(event).catch(() => ({}));
  const parseResult = createSessionSchema.safeParse(body);

  if (!parseResult.success) {
    return sendApiError(event, 400, 'VALIDATION_ERROR', 'Invalid session request parameters.');
  }

  const { lessonId, sessionType } = parseResult.data;

  // Validate lesson exists if provided
  if (lessonId) {
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      return sendApiError(event, 404, 'NOT_FOUND', 'Lesson not found.');
    }
  }

  const session = await prisma.learningSession.create({
    data: {
      userId: user.id,
      lessonId: lessonId || null,
      sessionType,
      status: 'in_progress',
      totalQuestions: 0,
      correctCount: 0,
      accuracy: 0.0,
    },
  });

  return sendApiSuccess(event, {
    sessionId: session.id,
    sessionType: session.sessionType,
    startedAt: session.startedAt,
  }, 201);
});

