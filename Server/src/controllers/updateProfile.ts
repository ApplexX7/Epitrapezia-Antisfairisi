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

export function updateProfile() {
  return async (
    req: FastifyRequest<{ Body: { firstName?: string; lastName?: string; bio?: string; github?: string; instagram?: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const authUser = (req as any).user;
      if (!authUser?.id) return reply.code(401).send({ message: "Unauthorized" });

      const { firstName, lastName, bio = "", github = "", instagram = "" } = req.body;

      if (!firstName?.trim() || !lastName?.trim()) {
        return reply.code(400).send({ message: "firstName and lastName are required" });
      }

      if (bio.length > 300) {
        return reply.code(400).send({ message: "Bio must be 300 characters or fewer" });
      }

      // Update names on players
      await new Promise<void>((resolve, reject) => {
        db.run(
          "UPDATE players SET firstName = ?, lastName = ? WHERE id = ?",
          [firstName.trim(), lastName.trim(), authUser.id],
          (err) => (err ? reject(err) : resolve())
        );
      });

      // Update socials as JSON in player_infos
      const socialsJson = JSON.stringify({
        github: github.trim(),
        instagram: instagram.trim()
      });

      // Update bio (desp) and socials in player_infos, create row if missing
      const bioValue = bio.trim();
      await new Promise<void>((resolve, reject) => {
        db.run(
          "UPDATE player_infos SET desp = ?, socials = ? WHERE player_id = ?",
          [bioValue, socialsJson, authUser.id],
          function (err) {
            if (err) return reject(err);
            if (this.changes === 0) {
              db.run(
                "INSERT INTO player_infos (player_id, desp, socials) VALUES (?, ?, ?)",
                [authUser.id, bioValue, socialsJson],
                (insertErr) => (insertErr ? reject(insertErr) : resolve())
              );
            } else {
              resolve();
            }
          }
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

      return reply.code(200).send({ user: mapUser(updated) });
    } catch (err) {
      console.error("updateProfile error", err);
      return reply.code(400).send({ message: "Internal Server Error" });
    }
  };
}
