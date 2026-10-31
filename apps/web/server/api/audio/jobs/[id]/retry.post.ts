// ============================================================================
// POST /api/audio/jobs/:id/retry — Retry a failed generation job (Audio_system.md §7)
// ============================================================================

import { defineEventHandler, getRouterParam } from 'h3';
import { prisma } from '../../../../utils/prisma';
import { sendApiSuccess, sendApiError } from '../../../../utils/response';
import { executeAudioJob } from '../../../../utils/audio/pipeline/runner';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    return sendApiError(event, 400, 'BAD_REQUEST', 'Missing job ID.');
  }

  const job = await prisma.audioGenerationJob.findUnique({
    where: { id },
  });

  if (!job) {
    return sendApiError(event, 404, 'NOT_FOUND', 'AudioGenerationJob not found.');
  }

  const result = await executeAudioJob(id);

  if (result.error) {
    return sendApiError(event, 500, 'EXECUTION_FAILED', result.error);
  }

  return sendApiSuccess(event, {
    job: result.job,
    asset: result.asset,
    url: result.url,
  });
});
