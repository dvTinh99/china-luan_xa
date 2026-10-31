// ============================================================================
// GET & POST /api/character
// ============================================================================

import { defineEventHandler, readBody } from 'h3';
import { z } from 'zod';
import { prisma } from '../../utils/prisma';
import { sendApiSuccess, sendApiError } from '../../utils/response';

const updateCharacterSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống').max(25),
});

export default defineEventHandler(async (event) => {
  const user = event.context.user;

  if (!user) {
    return sendApiError(event, 401, 'UNAUTHORIZED', 'Authentication required.');
  }

  if (event.node.req.method === 'POST') {
    const body = await readBody(event);
    const parseResult = updateCharacterSchema.safeParse(body);

    if (!parseResult.success) {
      return sendApiError(event, 400, 'VALIDATION_ERROR', parseResult.error.errors[0]?.message || 'Invalid name');
    }

    const updated = await prisma.character.upsert({
      where: { userId: user.id },
      update: { name: parseResult.data.name.trim() },
      create: {
        userId: user.id,
        name: parseResult.data.name.trim(),
        level: 1,
        exp: 0,
        hp: 100,
        maxHp: 100,
      },
    });

    return sendApiSuccess(event, { character: updated });
  }

  // GET
  let character = await prisma.character.findUnique({
    where: { userId: user.id },
  });

  if (!character) {
    character = await prisma.character.create({
      data: {
        userId: user.id,
        name: user.username,
        level: 1,
        exp: 0,
        hp: 100,
        maxHp: 100,
      },
    });
  }

  // Calculate Language Proficiency Stats independently of RPG Level (Non-negotiable Rule 6!)
  const [totalReviewedWords, masteredWords, totalCorrectAnswers, totalAnswers] = await Promise.all([
    prisma.vocabularyProgress.count({ where: { userId: user.id, totalReviews: { gt: 0 } } }),
    prisma.vocabularyProgress.count({ where: { userId: user.id, state: 'mastered' } }),
    prisma.learningAnswer.count({ where: { userId: user.id, isCorrect: true } }),
    prisma.learningAnswer.count({ where: { userId: user.id } }),
  ]);

  const accuracyRate = totalAnswers > 0 ? Math.round((totalCorrectAnswers / totalAnswers) * 100) : 100;

  return sendApiSuccess(event, {
    character,
    languageProficiency: {
      vocabularyEnrolled: totalReviewedWords,
      masteredCount: masteredWords,
      accuracyRate,
      estimatedHskLevel: 'HSK 3.0 Band 1 (In Progress)',
    },
  });
});

