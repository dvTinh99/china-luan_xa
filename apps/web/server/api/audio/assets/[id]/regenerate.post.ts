// ============================================================================
// POST /api/audio/assets/:id/regenerate — Regenerate Audio Asset as New Version (Audio_system.md §7)
// ============================================================================

import { defineEventHandler, getRouterParam, readBody } from 'h3';
import { sendApiSuccess, sendApiError } from '../../../../utils/response';
import { regenerateAudioAsset } from '../../../../utils/audio/pipeline/lifecycle';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    return sendApiError(event, 400, 'BAD_REQUEST', 'Missing asset ID parameter.');
  }

  const body = await readBody(event).catch(() => ({}));
  const autoExecute = body?.autoExecute ?? true;

  try {
    const result = await regenerateAudioAsset(id, autoExecute);
    return sendApiSuccess(event, {
      job: result.job,
      asset: (result as any).asset || null,
      url: (result as any).url || null,
    });
  } catch (err: any) {
    return sendApiError(event, 400, 'REGENERATION_FAILED', err.message);
  }
});
