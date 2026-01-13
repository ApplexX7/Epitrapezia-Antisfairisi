import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../databases/db";

/**
 * Fetches player's XP progression history
 * Returns weekly XP gain data for charting
 */
export function GetXpHistory() {
  return async (req: FastifyRequest<{ Params: { playerId?: string } }>, reply: FastifyReply) => {
    try {
      const { playerId } = req.params;
      const targetPlayerId = playerId ? Number(playerId) : (req as any).user?.id;

      if (!targetPlayerId) {
        return reply.status(400).send({ message: "Player ID required" });
      }

      // Get player's experience
      const player: any = await new Promise((resolve, reject) => {
        db.get(
          "SELECT experience FROM players WHERE id = ?",
          [targetPlayerId],
          (err, row) => (err ? reject(err) : resolve(row))
        );
      });

      if (!player) {
        return reply.status(404).send({ message: "Player not found" });
      }

      // Get XP history from xp_history table
      const xpHistoryRecords: any[] = await new Promise((resolve, reject) => {
        db.all(
          "SELECT date, SUM(xp_gained) as daily_xp FROM xp_history WHERE player_id = ? GROUP BY date ORDER BY date ASC",
          [targetPlayerId],
          (err, rows) => (err ? reject(err) : resolve(rows || []))
        );
      });

      // Calculate XP progression by months for the current year (Jan - Dec)
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonthIndex = today.getMonth();
      const xpData: any[] = [];
      
      let cumulativeXp = 0;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      // Create entries for all 12 months of the current year
      for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        const monthStart = new Date(currentYear, monthIndex, 1);
        const monthEnd = new Date(currentYear, monthIndex + 1, 0);

        // Only calculate XP for past and current months
        let monthXpGain = 0;
        if (monthIndex <= currentMonthIndex) {
          // Calculate XP gained in this month from xp_history
          monthXpGain = xpHistoryRecords
            .filter((record) => {
              const recordDate = new Date(record.date);
              return recordDate >= monthStart && recordDate <= monthEnd;
            })
            .reduce((sum, record) => sum + (record.daily_xp || 0), 0);
          
          cumulativeXp += monthXpGain;
        }

        xpData.push({
          week: monthNames[monthIndex], // Keep key as "week" for backwards compatibility
          date: monthStart.toISOString().split('T')[0],
          xp: monthIndex <= currentMonthIndex ? cumulativeXp : 0, // Future months show 0
          weekGain: monthXpGain,
          isCurrentMonth: monthIndex === currentMonthIndex
        });
      }

      return reply.status(200).send({
        xpHistory: xpData,
        currentExperience: player.experience
      });
    } catch (err) {
      return reply.status(400).send({ message: "Internal server error" });
    }
  };
}
