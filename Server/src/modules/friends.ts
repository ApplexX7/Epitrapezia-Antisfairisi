import { db } from "../databases/db";

export async function acceptedFriends(user : any){
        const sql = `SELECT p.*
        FROM friends f
        JOIN players p ON 
          (p.id = f.friend_id AND f.player_id = ?) OR
          (p.id = f.player_id AND f.friend_id = ?)
        WHERE f.status = 'accepted'
      `
        return  await new Promise((resolve, rejects) => {
            db.all(sql, [user.id, user.id], (err : any, friendsList : any) =>{
                if (err)
                    rejects(err);
                else
                    resolve(friendsList);
            });
        })
}