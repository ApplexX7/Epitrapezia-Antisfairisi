import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../databases/db";
import { Server } from "../server";

export function MarkAttendance() {
    return async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const playerId = (req as any).user.id;
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

            console.log(`[Attendance] Player ${playerId} marking attendance for ${today}`);

            const existing = await new Promise((resolve, reject) => {
                db.get(
                    `SELECT id FROM attendance WHERE player_id = ? AND date = ?`,
                    [playerId, today],
                    (err : any, row : any) => {
                        if (err) reject(err);
                        else resolve(row);
                    }
                );
            });

            if (existing) {
                console.log(`[Attendance] Player ${playerId} already marked attendance today`);
                return reply.status(200).send({ message: "Attendance already marked for today" });
            }

            // Get player's current level
            const player: any = await new Promise((resolve, reject) => {
                db.get(
                    `SELECT level, experience FROM players WHERE id = ?`,
                    [playerId],
                    (err : any, row : any) => {
                        if (err) reject(err);
                        else resolve(row);
                    }
                );
            });

            if (!player) {
                return reply.status(404).send({ message: "Player not found" });
            }

            // Calculate XP to award: minimum 1 XP, or 0.25 * level (whichever is higher)
            const xpToAward = Math.max(1, Math.floor(player.level * 0.25));
            const newExperience = player.experience + xpToAward;

            // Insert new attendance atomically; ignore if another request already inserted today
            const attendanceInserted = await new Promise<number>((resolve, reject) => {
                db.run(
                    `INSERT OR IGNORE INTO attendance (player_id, date) VALUES (?, ?)`,
                    [playerId, today],
                    function(err : any) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(this.changes); // 1 if inserted, 0 if already existed
                        }
                    }
                );
            });

            if (attendanceInserted === 0) {
                console.log(`[Attendance] Player ${playerId} already marked attendance today (race-safe check)`);
                return reply.status(200).send({ message: "Attendance already marked for today" });
            }

            // Update player's experience
            await new Promise((resolve, reject) => {
                db.run(
                    `UPDATE players SET experience = ? WHERE id = ?`,
                    [newExperience, playerId],
                    function(err : any) {
                        if (err) reject(err);
                        else resolve(this.changes);
                    }
                );
            });

            // Log XP gain in xp_history table
            await new Promise((resolve, reject) => {
                db.run(
                    `INSERT OR REPLACE INTO xp_history (player_id, date, xp_gained, source) VALUES (?, ?, ?, 'attendance')`,
                    [playerId, today, xpToAward],
                    function(err : any) {
                        if (err) {
                            console.error(`[Attendance] Error logging XP history for player ${playerId}:`, err);
                            reject(err);
                        } else {
                            console.log(`[Attendance] Logged ${xpToAward} XP for player ${playerId} in xp_history`);
                            resolve(this.lastID);
                        }
                    }
                );
            });

            // Emit socket event to notify about XP update
            const io = Server.socket();
            io.to(String(playerId)).emit("xp:gained", {
                xpAwarded: xpToAward,
                totalExperience: newExperience,
                type: "daily-attendance"
            });
            io.to(String(playerId)).emit("xp:updated", {
                xpAwarded: xpToAward,
                totalExperience: newExperience
            });

            console.log(`[Attendance] Successfully marked attendance for player ${playerId}, awarded ${xpToAward} XP, total: ${newExperience}`);

            return reply.status(201).send({ 
                message: "Attendance marked successfully",
                xpAwarded: xpToAward,
                totalExperience: newExperience
            });
        } catch (err) {
            return reply.status(400).send({ message: 'Internal server error', error: String(err) });
        }
    };
}

export function GetTodayAttendance() {
    return async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const playerId = (req as any).user.id;
            const today = new Date().toISOString().split('T')[0];

            const todayData = await new Promise<any>((resolve, reject) => {
                db.get(
                    `SELECT hours FROM attendance WHERE player_id = ? AND date = ?`,
                    [playerId, today],
                    (err : any, row : any) => {
                        if (err) reject(err);
                        else resolve(row);
                    }
                );
            });

            const hoursToday = todayData ? todayData.hours : 0;

            return reply.status(200).send({ 
                date: today,
                hours: hoursToday,
                minutes: Math.round(hoursToday * 60)
            });
        } catch (err) {
            return reply.status(400).send({ message: 'Internal server error' });
        }
    };
}
export function GetWeeklyAttendance() {
    return async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const playerId = (req as any).user.id;
            const today = new Date();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday as start
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

            const startDate = startOfWeek.toISOString().split('T')[0];
            const endDate = endOfWeek.toISOString().split('T')[0];

            const attendance = await new Promise<any[]>((resolve, reject) => {
                db.all(
                    `SELECT date, hours FROM attendance WHERE player_id = ? AND date BETWEEN ? AND ? ORDER BY date`,
                    [playerId, startDate, endDate],
                    (err : any, rows : any) => {
                        if (err) reject(err);
                        else resolve(rows);
                    }
                );
            });

            // Create a map of attended dates with hours
            const attendanceMap = new Map(attendance.map(row => [row.date, row.hours]));

            // Generate week days
            const weekDays = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                const hours = attendanceMap.get(dateStr) || 0;
                weekDays.push({
                    date: dateStr,
                    day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    hours: hours,
                    attended: hours > 0
                });
            }

            return reply.status(200).send({ weekDays });
        } catch (err) {
            return reply.status(400).send({ message: 'Internal server error' });
        }
    };
}