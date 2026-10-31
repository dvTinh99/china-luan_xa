// ============================================================================
// POST /api/learning/sessions/:sessionId/answers
// ============================================================================
// Rule 2: Server evaluates correctness — client never dictates isCorrect.

import { defineEventHandler, getRouterParam, readBody } from 'h3';
import { z } from 'zod';
import { prisma } from '../../../../utils/prisma';
import { sendApiSuccess, sendApiError } from '../../../../utils/response';
import { trackQuestProgress } from '../../../../utils/quests';

const answerSchema = z.object({
  vocabularyId: z.string().min(1),
  activityType: z.enum(['flashcard', 'matching', 'quiz']),
  userAnswer: z.string(),
  responseTimeMs: z.number().int().nonnegative().default(0),
});

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  const sessionId = getRouterParam(event, 'sessionId');

  if (!user) {
    return sendApiError(event, 401, 'UNAUTHORIZED', 'Authentication required.');
  }

  if (!sessionId) {
    return sendApiError(event, 400, 'BAD_REQUEST', 'Missing sessionId parameter.');
  }

  const session = await prisma.learningSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    return sendApiError(event, 404, 'NOT_FOUND', 'Session not found.');
  }

  if (session.userId !== user.id) {
    return sendApiError(event, 403, 'FORBIDDEN', 'Access denied to session.');
  }

  if (session.status !== 'in_progress') {
    return sendApiError(event, 400, 'INVALID_SESSION_STATE', 'This session has already ended.');
  }

  const body = await readBody(event);
  const parseResult = answerSchema.safeParse(body);

  if (!parseResult.success) {
    return sendApiError(event, 400, 'VALIDATION_ERROR', 'Invalid answer submission payload.');
  }

  const { vocabularyId, activityType, userAnswer, responseTimeMs } = parseResult.data;

  // Retrieve authoritative vocabulary data from database
  const vocab = await prisma.vocabulary.findUnique({
    where: { id: vocabularyId },
    include: {
      readings: true,
      meanings: true,
    },
  });

  if (!vocab) {
    return sendApiError(event, 404, 'NOT_FOUND', 'Vocabulary item not found.');
  }

  // Server-side authoritative evaluation
  let isCorrect = false;
  const primaryPinyin = vocab.readings.find((r) => r.isPrimary)?.reading.toLowerCase().trim() || '';
  const viMeaning = vocab.meanings[0]?.meaning.toLowerCase().trim() || '';
  const normalizedUserAnswer = userAnswer.toLowerCase().trim();

  if (activityType === 'flashcard') {
    // Flashcard: user confirms recall (Again vs Remembered)
    isCorrect = normalizedUserAnswer === 'remembered' || normalizedUserAnswer === 'true' || normalizedUserAnswer === '1';
  } else if (activityType === 'matching') {
    // Matching: userAnswer must match either simplified, primary pinyin, or vietnamese meaning
    isCorrect =
      normalizedUserAnswer === vocab.simplified.toLowerCase() ||
      normalizedUserAnswer === primaryPinyin ||
      viMeaning.includes(normalizedUserAnswer);
  } else if (activityType === 'quiz') {
    // Quiz: check exact match with simplified, pinyin, or matching option
    isCorrect =
      normalizedUserAnswer === vocab.simplified.toLowerCase() ||
      normalizedUserAnswer === primaryPinyin ||
      normalizedUserAnswer === viMeaning ||
      viMeaning.includes(normalizedUserAnswer);
  }

  // Record answer entry
  await prisma.learningAnswer.create({
    data: {
      sessionId: session.id,
      userId: user.id,
      vocabularyId: vocab.id,
      activityType,
      userAnswer,
      isCorrect,
      responseTimeMs,
    },
  });

  // Update session counts and accuracy
  const newTotal = session.totalQuestions + 1;
  const newCorrect = session.correctCount + (isCorrect ? 1 : 0);
  const newAccuracy = Math.round((newCorrect / newTotal) * 100) / 100;

  await prisma.learningSession.update({
    where: { id: session.id },
    data: {
      totalQuestions: newTotal,
      correctCount: newCorrect,
      accuracy: newAccuracy,
    },
  });

  // Track quest progress if answer is correct
  let completedQuests: any[] = [];
  if (isCorrect) {
    const questUpdates = await trackQuestProgress(user.id, 'PERFECT_QUIZ', 1);
    completedQuests = questUpdates.filter((q) => q.justCompleted);
  }

  return sendApiSuccess(event, {
    isCorrect,
    correctAnswer: {
      simplified: vocab.simplified,
      pinyin: primaryPinyin,
      meaning: viMeaning,
    },
    currentAccuracy: newAccuracy,
    totalAnswered: newTotal,
    completedQuests,
  });
});

