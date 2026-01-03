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

      // Get all attendance records for the player
      const attendanceRecords: any[] = await new Promise((resolve, reject) => {
        db.all(
          "SELECT date FROM attendance WHERE player_id = ? ORDER BY date ASC",
          [targetPlayerId],
          (err, rows) => (err ? reject(err) : resolve(rows || []))
        );
      });

      // Calculate XP progression by weeks
      const today = new Date();
      const xpData: any[] = [];
      
      // Start from 12 weeks ago or from earliest attendance
      let startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 84); // 12 weeks ago
      
      if (attendanceRecords.length > 0) {
        const earliestAttendance = new Date(attendanceRecords[0].date);
        if (earliestAttendance > startDate) {
          startDate = new Date(earliestAttendance);
        }
      }

      let currentWeekStart = new Date(startDate);
      currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay()); // Start of week (Sunday)
      
      let cumulativeXp = 0;
      let currentLevel = 1;
      let weekCount = 0;

      // Create entries for each week
      while (currentWeekStart <= today && weekCount < 12) {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        // Count attendance in this week
        const weekAttendance = attendanceRecords.filter((record) => {
          const recordDate = new Date(record.date);
          return recordDate >= currentWeekStart && recordDate <= weekEnd;
        }).length;

        // Calculate XP gained in this week
        // Each attendance = 0.25 * level
        const weekXpGain = Math.floor(weekAttendance * currentLevel * 0.25);
        cumulativeXp += weekXpGain;

        // Estimate level from cumulative XP (assuming 100 XP per level)
        currentLevel = Math.floor(1 + cumulativeXp / 100);

        const weekLabel = `Week ${weekCount + 1}`;

        xpData.push({
          week: weekLabel,
          date: currentWeekStart.toISOString().split('T')[0],
          xp: cumulativeXp,
          weekGain: weekXpGain
        });

        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        weekCount++;
      }

      // If no data, return single entry with current experience
      if (xpData.length === 0) {
        xpData.push({
          week: "Week 1",
          date: new Date().toISOString().split('T')[0],
          xp: player.experience,
          weekGain: 0
        });
      }

      return reply.status(200).send({
        xpHistory: xpData,
        currentExperience: player.experience
      });
    } catch (err) {
      console.error("Error fetching XP history:", err);
      return reply.status(500).send({ message: "Internal server error" });
    }
  };
}
