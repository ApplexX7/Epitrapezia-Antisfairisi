import { Server } from "../server";
import { MarkAttendance, GetWeeklyAttendance, GetTodayAttendance } from "../controllers/attendance";

export async function attendanceRouters() {
    const server = Server.instance();

    server.post("/attendance/mark", MarkAttendance());
    server.get("/attendance/weekly", GetWeeklyAttendance());
    server.get("/attendance/today", GetTodayAttendance());
}