import { FastifyRequest, FastifyReply } from "fastify";
import { playerExist } from '../modules/playerExist'
import bcrypt from 'bcrypt';
import {  storeRefrechTokenInDb } from '../modules/storeRefreshTokenInDb'
import { generateAccessToken, generateRefreshToken } from "../modules/generateTokens";
import { generateOTP, saveOTP } from "../modules/generateOtp";
import { db } from "../databases/db";

async function sendTwoFactorEmail(email: string, otp: string) {
  const { SendEmail } = await import("../modules/mailer");
  const html = `
    <h2>Two-Factor Login</h2>
    <p>Your login code is: <b>${otp}</b></p>
    <p>This code will expire in 5 minutes.</p>
  `;
  await SendEmail(email, "Your login code", html);
}

async function getUserWithProfile(playerId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT p.*, COALESCE(pi.desp, '') AS bio, COALESCE(pi.socials, '') AS socials
       FROM players p
       LEFT JOIN player_infos pi ON pi.player_id = p.id
       WHERE p.id = ?`,
      [playerId],
      (err, row) => (err ? reject(err) : resolve(row))
    );
  });
}

export  function Login  (){
    return async ( req: FastifyRequest<{ Body: { login: string; password: string } }>,
     reply: FastifyReply,
   ) => {
     const { login, password } = req.body;
     if (!login || !password) {
       return reply.status(400).send({ error: "Bad Request", message: "Missing login or password" });
     }
     try{
        const exist = await playerExist(login, login)
        if (!exist)
          return reply.code(401).send({message: "Invalid username/email or password"})
        const verifyPassowrd = await  bcrypt.compare(password, exist.password);
        if (!verifyPassowrd)
          return reply.code(401).send({message: "Invalid username/email or password"})

        // Check if 2FA is enabled
        if (exist.two_factor_enabled) {
          const otp = generateOTP();
          await saveOTP(exist.id, otp, "login_2fa", 300);
          await sendTwoFactorEmail(exist.email, otp);
          return reply.status(200).send({
            requiresOTP: true,
            player_id: exist.id,
            message: "Two-factor code sent to your email",
          });
        }

        // Normal login without 2FA
        const userRow = await getUserWithProfile(exist.id);
        let github = "";
        let instagram = "";
        
        if (userRow.socials) {
          try {
            const socials = JSON.parse(userRow.socials);
            github = socials.github ?? "";
            instagram = socials.instagram ?? "";
          } catch (e) {
            // If socials is not valid JSON, leave as empty strings
          }
        }
        
        const user  = { 
          id : userRow.id, 
          username : userRow.username, 
          email : userRow.email, 
          firstName: userRow.firstName,
          lastName: userRow.lastName,
          avatar: userRow.avatar,
          level: userRow.level || 1,
          experience: userRow.experience || 0,
          progression: (userRow.experience || 0) % 100,
          bio: userRow.bio ?? "",
          github,
          instagram,
          dateJoined: userRow.created_at ? new Date(userRow.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Joined recently",
          twoFactorEnabled: Boolean(userRow.two_factor_enabled),
        }
        const accessToken = generateAccessToken(user)
        const refreshToken = generateRefreshToken(user)
        await storeRefrechTokenInDb(refreshToken, user)
        return reply
        .setCookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 7 * 24 * 60 * 60,
        })
        .status(200)
        .send({
          message: 'Login successful',
          user,
          token: {
            accessToken,
          },
        });
    }catch(err){
      return reply.status(500).send({ message: 'Internal server error during registration' });
    }
   }
 }