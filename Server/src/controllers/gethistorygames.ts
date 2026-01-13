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

            // Fetch games from both game_history (Pong) and tictactoe_history tables
            const gamesHistory = await new Promise((resolve, reject) => {
                db.all(
                    `SELECT id, player1_id, player2_id, player1_score, player2_score, winner_id, created_at, 'pong' as game_type 
                     FROM game_history
                     WHERE player1_id = ? OR player2_id = ?
                     UNION ALL
                     SELECT id, player1_id, player2_id, player1_score, player2_score, winner_id, created_at, 'tictactoe' as game_type 
                     FROM tictactoe_history
                     WHERE player1_id = ? OR player2_id = ?
                     ORDER BY created_at DESC`,
                    [targetPlayerId, targetPlayerId, targetPlayerId, targetPlayerId],
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
            return reply.status(400).send({ message: 'Internal server error' });
        }
    };
}
