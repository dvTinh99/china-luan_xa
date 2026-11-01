// ============================================================================
// GET /api/learning/radicals
// Returns list of core Kangxi radicals with mnemonic strategies
// ============================================================================

import { defineEventHandler } from 'h3';
import { sendApiSuccess } from '../../../utils/response';
import { RADICALS_DATA } from '../../../utils/radicals-data';

export default defineEventHandler(async (event) => {
  return sendApiSuccess(event, {
    total: RADICALS_DATA.length,
    radicals: RADICALS_DATA,
  });
});

