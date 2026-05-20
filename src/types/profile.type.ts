// ─── Profile Types ────────────────────────────────────────────────────────────

export interface ProfilePhoto {
  initials: string;
  url: string | null;
}

export interface ProfileResponse {
  profile_photo: ProfilePhoto;
  name: string;
  email: string;
}

export interface UpdateProfileBody {
  name: string;
  profile_pic?: File;
}

export interface PasswordChangeBody {
  current_password: string;
  new_password: string;
  confirm_password: string;
}