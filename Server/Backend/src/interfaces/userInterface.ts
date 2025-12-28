
export interface User {
    id: number;
    username: string;
    email: string;
    firstname?: string,
    lastName?: string,
    avatar?: string,
    authProvider?: string
    status ?: string,
    friendstatus ? : string,
    level?: number;
    experience?: number;
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