import {FastifyReply, FastifyRequest} from "fastify";
import { db } from "../databases/db";

export function GetHistoryGames() {
    return async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            // Get player ID from query params or from authenticated user
            const { playerId } = req.query as { playerId?: string };
            const authenticatedUserId = (req as any).user?.id;
            
            const targetPlayerId = playerId ? Number(playerId) : authenticatedUserId;
            
            if (!targetPlayerId) {
                return reply.status(400).send({ message: "Player ID required" });
            }

            const gamesHistory = await new Promise((resolve, reject) => {
                db.all(
                    `SELECT * FROM game_history
                     WHERE player1_id = ? OR player2_id = ?
                     ORDER BY created_at DESC`,
                    [targetPlayerId, targetPlayerId],
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
            return reply.status(400).send({ message: 'Internal server error' });
        }
    };
}
