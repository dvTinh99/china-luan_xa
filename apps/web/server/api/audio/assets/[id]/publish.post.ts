// ============================================================================
// POST /api/audio/assets/:id/publish — Publish approved audio asset (Audio_system.md §6 step 10)
// ============================================================================

import { defineEventHandler, getRouterParam } from 'h3';
import { sendApiSuccess, sendApiError } from '../../../../utils/response';
import { publishAudioAsset } from '../../../../utils/audio/pipeline/lifecycle';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    return sendApiError(event, 400, 'BAD_REQUEST', 'Missing asset ID parameter.');
  }

  try {
    const result = await publishAudioAsset(id);
    return sendApiSuccess(event, {
      asset: result.asset,
      url: result.url,
    });
  } catch (err: any) {
    return sendApiError(event, 400, 'PUBLISH_FAILED', err.message);
  }
});
