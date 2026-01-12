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
      if (!newPassword) {
        return reply.code(400).send({ message: "newPassword is required" });
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

      // Check if user is purely Google-authenticated (no local password set yet)
      const providers = (user.auth_Provider || "local").split(",").map((p: string) => p.trim());
      const isGoogleOnly = providers.includes("google") && !providers.includes("local");

      // Block Google-only accounts from setting password
      if (isGoogleOnly) {
        return reply.code(403).send({ message: "Password login is disabled for Google-only sign-in accounts" });
      }

      // For non-Google users or users with existing local password, verify current password
      if (!isGoogleOnly) {
        if (!currentPassword) {
          return reply.code(400).send({ message: "currentPassword is required" });
        }
        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) return reply.code(400).send({ message: "Current password is incorrect" });
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      
      // Update auth providers to include "local" if only Google before
      let newAuthProvider = user.auth_Provider;
      if (isGoogleOnly) {
        newAuthProvider = "google,local";
      }

      await new Promise<void>((resolve, reject) => {
        db.run(
          "UPDATE players SET password = ?, auth_Provider = ? WHERE id = ?",
          [hashed, newAuthProvider, authUser.id],
          (err) => (err ? reject(err) : resolve())
        );
      });

      return reply.code(200).send({ message: "Password updated successfully" });
    } catch (err) {
      console.error("updatePassword error", err);
      return reply.code(400).send({ message: "Internal Server Error" });
    }
  };
}
