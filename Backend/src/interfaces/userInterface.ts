
export interface User {
    id: number;
    username: string;
    email: string;
    firstname?: string,
    lastName?: string,
    avatar?: string,
    authProvider?: string
    settings ?: {
      dateJoined : string,
      social : string,
      desp : string,
    }
  }