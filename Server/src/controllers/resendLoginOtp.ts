import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../databases/db";
import { generateOTP, saveOTP } from "../modules/generateOtp";

async function sendTwoFactorEmail(email: string, otp: string) {
  const { SendEmail } = await import("../modules/mailer");
  const html = `
    <h2>Two-Factor Login</h2>
    <p>Your login code is: <b>${otp}</b></p>
    <p>This code will expire in 5 minutes.</p>
  `;
  await SendEmail(email, "Your login code", html);
}

async function getUserById(playerId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM players WHERE id = ?", [playerId], (err, user) =>
      err ? reject(err) : resolve(user)
    );
  });
}

export function ResendLoginOtp() {
  return async (
    req: FastifyRequest<{ Body: { player_id: number } }>,
    reply: FastifyReply
  ) => {
    const { player_id } = req.body;
    if (!player_id) {
      return reply.status(400).send({ message: "player_id is required" });
    }

    try {
      const user = await getUserById(player_id);
      if (!user) return reply.status(404).send({ message: "User not found" });
      if (!user.email) return reply.status(400).send({ message: "User email missing" });

      await new Promise<void>((resolve, reject) => {
        db.run(
          "DELETE FROM player_otps WHERE player_id = ? AND purpose = ?",
          [player_id, "login_2fa"],
          (err) => (err ? reject(err) : resolve())
        );
      });

      const otp = generateOTP();
      await saveOTP(player_id, otp, "login_2fa", 300);
      await sendTwoFactorEmail(user.email, otp);

      return reply.status(200).send({ message: "Two-factor code resent" });
    } catch (err) {
      return reply.status(400).send({ message: "Internal server error" });
    }
  };
}
