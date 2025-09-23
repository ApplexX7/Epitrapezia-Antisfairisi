import { db } from '../databases/db'
import { User } from '../interfaces/userInterface';

export async function storeRefrechTokenInDb(refreshToken : string, user : User): Promise<any> {
    return await new Promise<void>((resolve, reject) => {
        db.run(
          "UPDATE players SET refreshToken = ? WHERE id = ?",
          [refreshToken, user.id],
          function (err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
  }