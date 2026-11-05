import { defineEventHandler, getRouterParam, readBody } from 'h3';
import { z } from 'zod';
import { prisma } from '../../../../utils/prisma';
import { authenticateEvent } from '../../../../utils/auth';
import { sendApiSuccess, sendApiError } from '../../../../utils/response';
import {
  getPinyinStage,
  isPinyinStageId,
  PINYIN_PASS_SCORE,
  PINYIN_QUESTION_COUNT,
  evaluatePinyinAttempt,
} from '../../../../utils/pinyin-curriculum';

const attemptSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().min(1).max(32),
    optionId: z.string().min(1).max(32),
  }).strict()).length(PINYIN_QUESTION_COUNT),
}).strict();

export default defineEventHandler(async (event) => {
  // The generic auth middleware allows a demo-user fallback; persisted progress
  // must only ever be associated with a real, valid session cookie.
  const user = await authenticateEvent(event);
  if (!user) {
    return sendApiError(event, 401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const stageId = getRouterParam(event, 'stageId') || '';
  if (!isPinyinStageId(stageId)) {
    return sendApiError(event, 404, 'NOT_FOUND', 'Pinyin stage not found.');
  }
  const stage = getPinyinStage(stageId);
  if (!stage) {
    return sendApiError(event, 404, 'NOT_FOUND', 'Pinyin stage not found.');
  }

  const body = await readBody(event).catch(() => null);
  const parsed = attemptSchema.safeParse(body);
  if (!parsed.success) {
    return sendApiError(event, 400, 'VALIDATION_ERROR', 'Submit one answer for each of the 10 questions.');
  }

  const submittedIds = parsed.data.answers.map((answer) => answer.questionId);
  const expectedIds = new Set(stage.questions.map((question) => question.id));
  if (
    new Set(submittedIds).size !== PINYIN_QUESTION_COUNT ||
    submittedIds.some((questionId) => !expectedIds.has(questionId))
  ) {
    return sendApiError(event, 400, 'VALIDATION_ERROR', 'Answers must contain each question exactly once.');
  }
  const validOptions = new Map(stage.questions.map((question) => [
    question.id,
    new Set(question.choices.map((choice) => choice.id)),
  ]));
  if (parsed.data.answers.some((answer) => !validOptions.get(answer.questionId)?.has(answer.optionId))) {
    return sendApiError(event, 400, 'VALIDATION_ERROR', 'One or more answer choices are invalid.');
  }

  const { correctCount, score, feedback } = evaluatePinyinAttempt(stage, parsed.data.answers);
  const passed = score >= PINYIN_PASS_SCORE;
  let progress = null;

  if (passed) {
    // Create once; on retries update only when the new score improves the best.
    // The conditional update also preserves the maximum score across concurrent attempts.
    const existing = await prisma.pinyinStageProgress.findUnique({
      where: { userId_stageId: { userId: user.id, stageId } },
    });

    if (!existing) {
      try {
        await prisma.pinyinStageProgress.create({
          data: { userId: user.id, stageId, bestScore: score },
        });
      } catch (error) {
        if ((error as { code?: string })?.code !== 'P2002') throw error;
      }
    }

    await prisma.pinyinStageProgress.updateMany({
      where: { userId: user.id, stageId, bestScore: { lt: score } },
      data: { bestScore: score },
    });

    progress = await prisma.pinyinStageProgress.findUnique({
      where: { userId_stageId: { userId: user.id, stageId } },
      select: { stageId: true, bestScore: true, completedAt: true },
    });
  }

  return sendApiSuccess(event, {
    stageId,
    score,
    correctCount,
    totalQuestions: PINYIN_QUESTION_COUNT,
    passed,
    progress: progress ? {
      stageId: progress.stageId as typeof stageId,
      completed: true,
      bestScore: progress.bestScore,
      completedAt: progress.completedAt.toISOString(),
    } : null,
    feedback,
  });
});
