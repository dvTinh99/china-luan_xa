// ============================================================================
// GET /api/audio/jobs/:id — Inspect a generation job (Audio_system.md §7)
// ============================================================================

import { defineEventHandler, getRouterParam } from 'h3';
import { prisma } from '../../../utils/prisma';
import { sendApiSuccess, sendApiError } from '../../../utils/response';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    return sendApiError(event, 400, 'BAD_REQUEST', 'Missing job ID.');
  }

  const job = await prisma.audioGenerationJob.findUnique({
    where: { id },
    include: {
      voiceProfile: true,
      resultAsset: true,
    },
  });

  if (!job) {
    return sendApiError(event, 404, 'NOT_FOUND', 'AudioGenerationJob not found.');
  }

  return sendApiSuccess(event, { job });
});
