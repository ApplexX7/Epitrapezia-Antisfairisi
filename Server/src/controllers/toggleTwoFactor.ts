import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../databases/db";

function mapUser(user: any) {
  if (!user) return null;
  let github = "";
  let instagram = "";
  
  if (user.socials) {
    try {
      const socials = JSON.parse(user.socials);
      github = socials.github ?? "";
      instagram = socials.instagram ?? "";
    } catch (e) {
      // If socials is not valid JSON, leave as empty strings
    }
  }
  
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
    level: user.level || 1,
    experience: user.experience || 0,
    progression: (user.experience || 0) % 100,
    bio: user.bio ?? "",
    github,
    instagram,
    dateJoined: user.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Joined recently",
    twoFactorEnabled: Boolean(user.two_factor_enabled),
  };
}

export function toggleTwoFactor() {
  return async (
    req: FastifyRequest<{ Body: { enabled?: boolean } }>,
    reply: FastifyReply
  ) => {
    try {
      const authUser = (req as any).user;
      if (!authUser?.id) return reply.code(401).send({ message: "Unauthorized" });

      const { enabled } = req.body;
      if (typeof enabled !== "boolean") {
        return reply.code(400).send({ message: "enabled boolean is required" });
      }

      // Fetch user to check auth provider
      const user = await new Promise<any>((resolve, reject) => {
        db.get("SELECT auth_Provider FROM players WHERE id = ?", [authUser.id], (err, row) =>
          err ? reject(err) : resolve(row)
        );
      });

      if (!user) return reply.code(404).send({ message: "User not found" });

      // Check if user is purely Google-authenticated
      const providers = (user.auth_Provider || "local").split(",").map((p: string) => p.trim());
      const isGoogleOnly = providers.includes("google") && !providers.includes("local");

      // Block Google-only accounts from enabling 2FA
      if (isGoogleOnly) {
        return reply.code(403).send({ message: "Two-Factor Authentication is disabled for Google-only sign-in accounts" });
      }

      await new Promise<void>((resolve, reject) => {
        db.run(
          "UPDATE players SET two_factor_enabled = ? WHERE id = ?",
          [enabled ? 1 : 0, authUser.id],
          (err) => (err ? reject(err) : resolve())
        );
      });

      const updated = await new Promise<any>((resolve, reject) => {
        db.get(
          `SELECT p.*, COALESCE(pi.desp, '') AS bio, COALESCE(pi.socials, '') AS socials
           FROM players p
           LEFT JOIN player_infos pi ON pi.player_id = p.id
           WHERE p.id = ?`,
          [authUser.id],
          (err, row) => (err ? reject(err) : resolve(row))
        );
      });

      return reply.code(200).send({
        enabled,
        user: mapUser(updated),
        message: enabled
          ? "Two-Factor Authentication enabled"
          : "Two-Factor Authentication disabled",
      });
    } catch (err) {
      console.error("toggleTwoFactor error", err);
      return reply.code(400).send({ message: "Internal Server Error" });
    }
  };
}
