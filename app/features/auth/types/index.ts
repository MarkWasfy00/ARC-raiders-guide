export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  embark_id?: string;
  discord_username?: string;
}

export interface AuthError {
  message: string;
  field?: string;
  code?: "EMAIL_NOT_VERIFIED" | "INVALID_CREDENTIALS" | "BANNED" | "GENERIC_ERROR";
}

export interface AuthResponse {
  success: boolean;
  error?: AuthError;
  requiresVerification?: boolean;
  email?: string;
}
