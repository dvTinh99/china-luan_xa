// ============================================================================
// Auth API Contracts
// ============================================================================

/** User object returned from API */
export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

/** Login request body */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Register request body */
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

/** Login/Register response */
export interface AuthResponse {
  user: User;
  token: string;
}
