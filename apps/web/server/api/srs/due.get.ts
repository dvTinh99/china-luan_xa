// ============================================================================
// GET /api/srs/due
// ============================================================================

import { defineEventHandler } from 'h3';
import { prisma } from '../../utils/prisma';
import { sendApiSuccess, sendApiError } from '../../utils/response';

export default defineEventHandler(async (event) => {
  const user = event.context.user;

  if (!user) {
    return sendApiError(event, 401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const now = new Date();

  // Fetch words that are due for review (or overdue)
  const dueItems = await prisma.vocabularyProgress.findMany({
    where: {
      userId: user.id,
      dueAt: { lte: now },
    },
    orderBy: { dueAt: 'asc' }, // Prioritize most overdue cards
    take: 50,
    include: {
      vocabulary: {
        include: {
          readings: true,
          meanings: true,
          examples: true,
        },
      },
    },
  });

  const formattedItems = dueItems.map((item) => {
    const v = item.vocabulary;
    const reading = v.readings.find((r) => r.isPrimary)?.reading || v.readings[0]?.reading || '';
    const meaning = v.meanings.find((m) => m.languageCode === 'vi')?.meaning || v.meanings[0]?.meaning || '';
    const example = v.examples[0] || null;

    return {
      progressId: item.id,
      vocabularyId: v.id,
      simplified: v.simplified,
      pinyin: reading,
      meaning,
      partOfSpeech: v.meanings[0]?.partOfSpeech || 'noun',
      state: item.state,
      intervalDays: item.intervalDays,
      dueAt: item.dueAt,
      audioUrl: v.audioUrl || null,
      example: example
        ? {
            sentenceZh: example.sentenceZh,
            sentencePinyin: example.sentencePinyin,
            translationVi: example.translationVi,
          }
        : null,
    };
  });

  return sendApiSuccess(event, {
    dueCount: formattedItems.length,
    items: formattedItems,
  });
});

