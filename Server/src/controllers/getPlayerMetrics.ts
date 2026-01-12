import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../databases/db";

/**
 * Calculates player metrics and compares them with all players in the system
 * Returns normalized metrics (0-100 scale) for radar chart display
 * 
 * Metrics calculated:
 * - rating: Player's win percentage (0-100)
 * - gamesPlayed: Normalized against max games in system
 * - wins: Normalized against total wins across all players
 * - consistency: Percentile ranking (0-100, where 100 = best)
 * - winRate: Win percentage (0-100)
 */
export function GetPlayerMetrics() {
  return async (req: FastifyRequest<{ Params: { playerId?: string } }>, reply: FastifyReply) => {
    try {
      const { playerId } = req.params;
      const targetPlayerId = playerId ? Number(playerId) : (req as any).user?.id;

      if (!targetPlayerId) {
        return reply.status(400).send({ message: "Player ID required" });
      }

      // Get player's stats
      const playerStats: any = await new Promise((resolve, reject) => {
        db.get(
          "SELECT * FROM game_stats WHERE player_id = ?",
          [targetPlayerId],
          (err, row) => (err ? reject(err) : resolve(row))
        );
      });

      if (!playerStats) {
        return reply.status(404).send({ message: "Player stats not found" });
      }

      // Get all players' stats for comparison
      const allStats: any = await new Promise((resolve, reject) => {
        db.all(
          "SELECT total_games, wins, losses FROM game_stats",
          [],
          (err, rows) => (err ? reject(err) : resolve(rows || []))
        );
      });

      // Calculate averages and percentiles
      const totalGames = playerStats.total_games || 0;
      const wins = playerStats.wins || 0;
      const losses = playerStats.losses || 0;
      const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
      
      // Calculate player's rating based on wins and games
      const playerRating = totalGames > 0 ? (wins / totalGames) * 100 : 0;

      // Calculate global averages
      const avgTotalGames = allStats.length > 0 
        ? allStats.reduce((sum: number, s: any) => sum + (s.total_games || 0), 0) / allStats.length 
        : 0;
      
      const avgWinRate = allStats.length > 0 
        ? allStats.reduce((sum: number, s: any) => {
            const tg = s.total_games || 0;
            return sum + (tg > 0 ? (s.wins || 0) / tg : 0);
          }, 0) / allStats.length * 100
        : 0;

      // Calculate percentile ranking (how player ranks against others)
      const betterPlayers = allStats.filter((s: any) => {
        const theirWinRate = s.total_games > 0 ? (s.wins / s.total_games) * 100 : 0;
        return theirWinRate > winRate;
      }).length;
      
      const playerPercentile = ((allStats.length - betterPlayers) / allStats.length) * 100;

      // Normalize metrics to 0-100 scale for radar chart
      // Handle edge cases where allStats might be empty
      const maxGames = allStats.length > 0 
        ? Math.max(...allStats.map((s: any) => s.total_games || 0), 20)
        : 20;
      
      const totalWinsAcrossAll = allStats.reduce((sum: number, s: any) => sum + (s.wins || 0), 0);
      const maxWinsInSystem = totalWinsAcrossAll > 0 ? totalWinsAcrossAll : 1;

      const metrics = {
        rating: Math.min(playerRating, 100),
        gamesPlayed: Math.min((totalGames / maxGames) * 100, 100),
        wins: Math.min((wins / maxWinsInSystem) * 100, 100),
        consistency: playerPercentile || 50,
        winRate: Math.min(winRate, 100),
      };

      return reply.status(200).send({
        playerMetrics: metrics,
        playerStats: {
          totalGames,
          wins,
          losses,
          winRate: parseFloat(winRate.toFixed(2)),
        },
        globalStats: {
          avgTotalGames: parseFloat(avgTotalGames.toFixed(2)),
          avgWinRate: parseFloat(avgWinRate.toFixed(2)),
          totalPlayers: allStats.length,
          playerPercentile: parseFloat(playerPercentile.toFixed(2)),
        },
      });
    } catch (err) {
      console.error("Error fetching player metrics:", err);
      return reply.status(400).send({ message: "Internal server error" });
    }
  };
}
