import {FastifyReply, FastifyRequest} from "fastify";
import { db } from "../databases/db";

export function GetHistoryGames() {
    return async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const playerId = (req as any).user.id;
            const gamesHistory = await new Promise((resolve, reject) => {
                db.all(
                    `SELECT * FROM game_history
                     WHERE player1_id = ? OR player2_id = ?
                     ORDER BY created_at DESC`,
                    [playerId, playerId],
                    (err: any, rows: any[]) => {
                        if (err) {
                            console.error("Error fetching game history:", err.message);
                            reject(err);
                        } else {
                            resolve(rows);
                        }
                    }
                );
            });
            return reply.status(200).send({ games: gamesHistory });
        } catch (err) {
            console.error("Unexpected error in GetHistoryGames:", err);
            return reply.status(500).send({ message: 'Internal server error' });
        }
    };
}
