import { db } from '../databases/db'

export async function playerExist(email: string, username: string): Promise<any> {
    return new Promise((resolve, reject) => {
        db.get(
          "SELECT * FROM players WHERE username = ? OR email = ?",
          [username, email.toLowerCase()],
            (err, user) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(user);
                }
            }
        );
    });
  }