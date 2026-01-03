import { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../databases/db";

export async function getGameStats(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.params as { id?: string };
  
  if (!id) {
    return reply.status(400).send({ message: "Missing player identifier" });
  }

  try {
    const playerId = isNaN(Number(id)) ? null : Number(id);
    
    if (!playerId) {
      return reply.status(400).send({ message: "Invalid player ID" });
    }

    const stats = await new Promise<any>((resolve, reject) => {
      db.get(
        `SELECT total_games, wins, losses FROM game_stats WHERE player_id = ?`,
        [playerId],
        (err: any, row: any) => {
          if (err) reject(err);
          else resolve(row || { total_games: 0, wins: 0, losses: 0 });
        }
      );
    });

    return reply.status(200).send(stats);
  } catch (err) {
    console.error("Error fetching game stats:", err);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
}
