import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../databases/db";

/**
 * Fetches player's weekly XP progress (Monday to Sunday)
 * Returns XP gained each day of the current week
 */
export function GetWeeklyXpProgress() {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const playerId = (req as any).user?.id;

      if (!playerId) {
        return reply.status(400).send({ message: "Player ID required" });
      }

      // Get current week boundaries
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Calculate Monday of current week
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      startOfWeek.setHours(0, 0, 0, 0);

      // Calculate Sunday of current week
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      // Get XP history for the week from xp_history table, summing all sources per day
      const xpHistoryRecords: any[] = await new Promise((resolve, reject) => {
        db.all(
          `SELECT date, SUM(xp_gained) as total_xp FROM xp_history WHERE player_id = ? AND date BETWEEN ? AND ? GROUP BY date ORDER BY date ASC`,
          [playerId, startOfWeek.toISOString().split('T')[0], endOfWeek.toISOString().split('T')[0]],
          (err, rows) => (err ? reject(err) : resolve(rows || []))
        );
      });

      // Create daily data structure
      const weekData = [];
      const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayName = dayNames[i];

        // Get total XP from xp_history table for this day (sum of all sources)
        const historyRecord = xpHistoryRecords.find(record => record.date === dateStr);
        const dayXp = historyRecord ? historyRecord.total_xp : 0;

        weekData.push({
          day: dayName,
          xp: dayXp,
          date: dateStr
        });
      }

      // Calculate total weekly XP
      const totalWeeklyXp = weekData.reduce((sum, day) => sum + day.xp, 0);

      return reply.status(200).send({
        weekData,
        totalWeeklyXp,
        weekStart: startOfWeek.toISOString().split('T')[0],
        weekEnd: endOfWeek.toISOString().split('T')[0]
      });
    } catch (err) {
      console.error("Error fetching weekly XP progress:", err);
      return reply.status(500).send({ message: "Internal server error" });
    }
  };
}
