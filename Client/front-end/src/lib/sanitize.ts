export function isValidUsername(username: string): boolean {
    return /^[A-Za-z]{3,15}$/.test(username);
  }
  
  export function getUsernameErrorMessage(username: string): string {
    if (username.length < 3) return "Username must be at least 3 characters long.";
    if (username.length > 15) return "Username must be no longer than 15 characters.";
    if (!/^[A-Za-z]+$/.test(username))
      return "Username can only contain letters (A–Z or a–z).";
    return "";
  }

export function isStrongPassword(password: string): boolean {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,32}$/.test(password);
  }
  
  export function getPasswordStrengthMessage(password: string): string {
    if (password.length < 8)
      return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(password)) return "Include at least one uppercase letter.";
    if (!/[a-z]/.test(password)) return "Include at least one lowercase letter.";
    if (!/\d/.test(password)) return "Include at least one number.";
    if (!/[\W_]/.test(password)) return "Include at least one special character.";
    return "";
  }
  