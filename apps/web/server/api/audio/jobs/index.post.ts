// ============================================================================
// POST /api/audio/jobs — Create an audio generation job (Audio_system.md §7)
// ============================================================================

import { defineEventHandler, readBody } from 'h3';
import { sendApiSuccess, sendApiError } from '../../../utils/response';
import { createAudioGenerationJob, executeAudioJob } from '../../../utils/audio/pipeline/runner';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!body || !body.sourceText || !body.contentId) {
      return sendApiError(event, 400, 'BAD_REQUEST', 'Missing required fields: sourceText and contentId.');
    }

    const { job, isNew, version } = await createAudioGenerationJob({
      contentType: body.contentType || 'VOCABULARY',
      contentId: body.contentId,
      sourceText: body.sourceText,
      pinyin: body.pinyin,
      voiceProfileCode: body.voiceProfileCode,
      voiceProfileId: body.voiceProfileId,
    });

    // If autoExecute requested, execute synchronously in background
    let executionResult = null;
    if (body.autoExecute) {
      executionResult = await executeAudioJob(job.id);
    }

    return sendApiSuccess(
      event,
      {
        job: executionResult?.job || job,
        asset: executionResult?.asset || null,
        url: executionResult?.url || null,
        isNew,
        targetVersion: version,
      },
      isNew ? 201 : 200,
    );
  } catch (err: any) {
    return sendApiError(event, 500, 'INTERNAL_ERROR', err.message);
  }
});
