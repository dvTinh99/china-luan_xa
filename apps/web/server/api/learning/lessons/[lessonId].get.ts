// ============================================================================
// GET /api/learning/lessons/:lessonId
// ============================================================================

import { defineEventHandler, getRouterParam } from 'h3';
import { prisma } from '../../../utils/prisma';
import { sendApiSuccess, sendApiError } from '../../../utils/response';
import { VOCABULARY_RADICAL_STRATEGIES, RADICALS_DATA } from '../../../utils/radicals-data';

export default defineEventHandler(async (event) => {
  const lessonId = getRouterParam(event, 'lessonId');

  if (!lessonId) {
    return sendApiError(event, 400, 'BAD_REQUEST', 'Missing lessonId parameter.');
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      unit: {
        include: {
          course: true,
        },
      },
      vocabulary: {
        orderBy: { sequenceNumber: 'asc' },
        include: {
          vocabulary: {
            include: {
              readings: true,
              meanings: true,
              examples: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    return sendApiError(event, 404, 'NOT_FOUND', 'Lesson not found.');
  }

  // Format vocabulary for client activity engines (Flashcard, Matching, Quiz, Radical, Writing)
  const vocabularyItems = lesson.vocabulary.map((entry) => {
    const v = entry.vocabulary;
    const primaryReading = v.readings.find((r) => r.isPrimary)?.reading || v.readings[0]?.reading || '';
    const viMeaning = v.meanings.find((m) => m.languageCode === 'vi')?.meaning || v.meanings[0]?.meaning || '';
    const partOfSpeech = v.meanings[0]?.partOfSpeech || 'noun';
    const example = v.examples[0] || null;

    // Attach radical tactical breakdown if available or fallback
    const radicalStrategy = VOCABULARY_RADICAL_STRATEGIES[v.simplified] || null;
    const radicalInfo = radicalStrategy
      ? RADICALS_DATA.find((r) => r.character === radicalStrategy.primaryRadical)
      : null;

    return {
      id: v.id,
      simplified: v.simplified,
      pinyin: primaryReading,
      meaning: viMeaning,
      partOfSpeech,
      audioUrl: v.audioUrl || null,
      radicalStrategy: radicalStrategy
        ? {
            primaryRadical: radicalStrategy.primaryRadical,
            radicalInfo,
            components: radicalStrategy.components,
            tacticalTip: radicalStrategy.tacticalTip,
            tacticalStory: radicalStrategy.tacticalStory,
          }
        : null,
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
    lesson: {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      expReward: lesson.expReward,
      goldReward: lesson.goldReward,
      unitTitle: lesson.unit.title,
      courseTitle: lesson.unit.course.title,
      vocabulary: vocabularyItems,
    },
  });
});


