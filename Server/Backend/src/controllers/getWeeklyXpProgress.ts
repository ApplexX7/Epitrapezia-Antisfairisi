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

      // Get all attendance records for the week
      const attendanceRecords: any[] = await new Promise((resolve, reject) => {
        db.all(
          `SELECT date FROM attendance WHERE player_id = ? AND date BETWEEN ? AND ? ORDER BY date ASC`,
          [playerId, startOfWeek.toISOString().split('T')[0], endOfWeek.toISOString().split('T')[0]],
          (err, rows) => (err ? reject(err) : resolve(rows || []))
        );
      });

      // Get player's level for XP calculation
      const player: any = await new Promise((resolve, reject) => {
        db.get(
          `SELECT level FROM players WHERE id = ?`,
          [playerId],
          (err, row) => (err ? reject(err) : resolve(row))
        );
      });

      if (!player) {
        return reply.status(404).send({ message: "Player not found" });
      }

      const playerLevel = player.level || 1;

      // Create daily data structure
      const weekData = [];
      const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayName = dayNames[i];

        // Check if there's attendance on this day
        const hasAttendance = attendanceRecords.some(record => record.date === dateStr);

        // Calculate XP for this day
        // If attendance marked: floor(0.25 * level), otherwise 0
        const dayXp = hasAttendance ? Math.floor(playerLevel * 0.25) : 0;

        weekData.push({
          day: dayName,
          xp: dayXp,
          attendance: hasAttendance ? 1 : 0
        });
      }

      // Calculate total weekly XP
      const totalWeeklyXp = weekData.reduce((sum, day) => sum + day.xp, 0);

      return reply.status(200).send({
        weekData,
        totalWeeklyXp,
        weekStart: startOfWeek.toISOString().split('T')[0],
        weekEnd: endOfWeek.toISOString().split('T')[0],
        playerLevel
      });
    } catch (err) {
      console.error("Error fetching weekly XP progress:", err);
      return reply.status(500).send({ message: "Internal server error" });
    }
  };
}
