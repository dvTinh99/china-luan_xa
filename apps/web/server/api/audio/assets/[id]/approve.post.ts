// ============================================================================
// POST /api/audio/assets/:id/approve — Human Review Step (Audio_system.md §6 step 9)
// ============================================================================

import { defineEventHandler, getRouterParam, readBody } from 'h3';
import { sendApiSuccess, sendApiError } from '../../../../utils/response';
import { approveAudioAsset } from '../../../../utils/audio/pipeline/lifecycle';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    return sendApiError(event, 400, 'BAD_REQUEST', 'Missing asset ID parameter.');
  }

  const body = await readBody(event).catch(() => ({}));
  const reviewedBy = body?.reviewedBy || 'editor';

  try {
    const asset = await approveAudioAsset(id, reviewedBy);
    return sendApiSuccess(event, { asset });
  } catch (err: any) {
    return sendApiError(event, 400, 'APPROVAL_FAILED', err.message);
  }
});
