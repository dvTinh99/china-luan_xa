// ============================================================================
// API Response Helpers
// ============================================================================

import { H3Event, setResponseStatus } from 'h3';
import type { ApiSuccessResponse, ApiErrorResponse } from '@linguaworld/shared-types';

/**
 * Send a successful JSON response wrapped in the standard envelope.
 */
export function sendApiSuccess<T>(event: H3Event, data: T, statusCode = 200): ApiSuccessResponse<T> {
  setResponseStatus(event, statusCode);
  return { data };
}

/**
 * Send an error JSON response wrapped in the standard envelope.
 * Named `sendApiError` to avoid collision with H3's built-in `sendError`.
 */
export function sendApiError(
  event: H3Event,
  statusCode: number,
  code: string,
  message: string,
  details?: Array<{ field?: string; message: string; code?: string }>,
): ApiErrorResponse {
  setResponseStatus(event, statusCode);
  return {
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
}
