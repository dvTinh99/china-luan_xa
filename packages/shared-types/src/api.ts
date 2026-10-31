// ============================================================================
// API Response Envelope Types
// ============================================================================

/** Successful API response envelope */
export interface ApiSuccessResponse<T = unknown> {
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

/** Error detail within an API error response */
export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

/** Error API response envelope */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}

/** Union of success and error responses */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/** Type guard for error responses */
export function isApiError(response: ApiResponse): response is ApiErrorResponse {
  return 'error' in response;
}

/** Type guard for success responses */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return 'data' in response;
}
