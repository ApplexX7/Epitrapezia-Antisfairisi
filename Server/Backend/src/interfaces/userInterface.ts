
export interface User {
    id: number;
    username: string;
    email: string;
    firstname?: string,
    firstName?: string,
    lastName?: string,
    avatar?: string,
    authProvider?: string
    status ?: string,
    friendstatus ? : string,
    level?: number;
    experience?: number;
    bio?: string;
    socials?: string;
    dateJoined?: string;
    created_at?: string;
    two_factor_enabled?: number | boolean;
    twoFactorEnabled?: boolean;
    settings ?: {
      dateJoined : string,
      social : string,
      desp : string,
    }
  }

export  interface Friends {
  id ?: number,
  friend_id ?: number,
  user_id ?: number,
  status ?: string,
}