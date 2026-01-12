import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../databases/db";

/**
 * Returns top players ordered by level then experience.
 * Only players with at least one game played are included.
 */
export function GetLeaderboard() {
  return async (_req: FastifyRequest, reply: FastifyReply) => {
    try {
      const players: any[] = await new Promise((resolve, reject) => {
        db.all(
          `SELECT p.id, p.username, p.firstName, p.lastName, p.avatar, p.level, p.experience,
                  gs.total_games, gs.wins, gs.losses
           FROM players p
           JOIN game_stats gs ON gs.player_id = p.id
           WHERE gs.total_games > 0
           ORDER BY p.level DESC, p.experience DESC
           LIMIT 10`,
          [],
          (err, rows) => (err ? reject(err) : resolve(rows || []))
        );
      });

      return reply.status(200).send({ players });
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      return reply.status(400).send({ message: "Internal server error" });
    }
  };
}
