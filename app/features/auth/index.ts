// Components
export { LoginForm } from "./components/LoginForm";
export { RegisterForm } from "./components/RegisterForm";
export { UserButton } from "./components/UserButton";
export { ResendVerificationButton } from "./components/ResendVerificationButton";

// Actions
export {
  loginAction,
  registerAction,
  logoutAction,
  logoutAndInvalidateAllSessions,
  invalidateUserSessions,
  discordSignInAction,
  linkDiscordAction
} from "./services/auth-actions";

export {
  verifyEmailAction,
  resendVerificationAction,
  getResendStatusAction,
} from "./services/verification-actions";

// Types
export type { LoginCredentials, RegisterCredentials, AuthError, AuthResponse } from "./types";
export type { VerificationResponse } from "./services/verification-actions";
