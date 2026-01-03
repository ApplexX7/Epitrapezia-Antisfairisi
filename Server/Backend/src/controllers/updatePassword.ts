import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../databases/db";
import bcrypt from "bcrypt";

export function updatePassword() {
  return async (
    req: FastifyRequest<{ Body: { currentPassword?: string; newPassword?: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const authUser = (req as any).user;
      if (!authUser?.id) return reply.code(401).send({ message: "Unauthorized" });

      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return reply.code(400).send({ message: "currentPassword and newPassword are required" });
      }

      if (newPassword.length < 8) {
        return reply.code(400).send({ message: "Password must be at least 8 characters" });
      }

      const user = await new Promise<any>((resolve, reject) => {
        db.get("SELECT * FROM players WHERE id = ?", [authUser.id], (err, row) =>
          err ? reject(err) : resolve(row)
        );
      });

      if (!user) return reply.code(404).send({ message: "User not found" });

      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) return reply.code(400).send({ message: "Current password is incorrect" });

      const hashed = await bcrypt.hash(newPassword, 10);
      await new Promise<void>((resolve, reject) => {
        db.run(
          "UPDATE players SET password = ? WHERE id = ?",
          [hashed, authUser.id],
          (err) => (err ? reject(err) : resolve())
        );
      });

      return reply.code(200).send({ message: "Password updated successfully" });
    } catch (err) {
      console.error("updatePassword error", err);
      return reply.code(500).send({ message: "Internal Server Error" });
    }
  };
}
