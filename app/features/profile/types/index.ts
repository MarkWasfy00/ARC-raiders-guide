export interface UserProfile {
  id: string;
  username: string | null;
  name: string | null;
  email: string | null;
  image: string | null;
  embark_id: string | null;
  discord_username: string | null;
  hasDiscordLinked: boolean;
}

export interface UpdateProfileData {
  name?: string;
  username?: string;
  embark_id?: string;
  discord_username?: string;
}

export interface ProfileUpdateResponse {
  success: boolean;
  error?: {
    message: string;
    field?: string;
  };
}
