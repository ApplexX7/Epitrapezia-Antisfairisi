import { FastifyRequest, FastifyReply } from "fastify";
import { playerExist } from '../modules/playerExist'
import bcrypt from 'bcrypt';
import { db } from '../databases/db'
import fastifyCookie from "@fastify/cookie";
import { Server } from "../server";
import { saveOTP, generateOTP, sendVerificationEmail } from "../modules/generateOtp";


Server.instance().register(fastifyCookie, {
  secret: "super-secret-string",
  hook: "onRequest",
});

export function SignUp() {
  return async (
    req: FastifyRequest<{ Body: { firstName: string; lastName: string; email: string; username: string; password: string } }>,
    reply: FastifyReply
  ) => {
    const { username, password, firstName, lastName, email } = req.body;
    if (!username || !password || !email || !firstName || !lastName) {
      return reply.status(400).send({ message: "All fields should be filled" });
    }

    try {
      const exist = await playerExist(email, username);
      if (exist)
        return reply.code(409).send({ message: "Username or email already registered" });

      const hashedPassword = await bcrypt.hash(password, 10);

      const userId = await new Promise<number>((resolve, reject) => {
        db.run(
          "INSERT INTO players (firstName, lastName, username, email, password, avatar, is_verified) VALUES (?, ?, ?, ?, ?, ?, 0)",
          [firstName, lastName, username, email, hashedPassword, "/images/defaultAvatare.jpg"],
          function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

      const otp = generateOTP();
      const expiredAt = new Date();
      expiredAt.setMinutes(expiredAt.getMinutes() + 10);
       await saveOTP(userId, otp, "email_verification", 30);


      await sendVerificationEmail(email, otp);

      const user = { id: userId, username, email, firstName, lastName, avatar: "/images/defaultAvatare.jpg" };
      return reply.status(201).send({
        message: "User created successfully. Please verify your email with the OTP sent.",
        user,
      });
    } catch (err) {
      console.log(err);
      return reply.status(500).send({ message: "Internal server error during registration" });
    }
  };
}
