import { FastifyRequest, FastifyReply } from "fastify";
import { playerExist } from '../modules/playerExist'
import bcrypt from 'bcrypt';
import { db } from '../databases/db'
import {generateRefreshToken, generateAccessToken} from '../modules/generateTokens'
import fastifyCookie from "@fastify/cookie";
import { Server } from "../server";
import {  storeRefrechTokenInDb } from '../modules/storeRefreshTokenInDb'


Server.instance().register(fastifyCookie, {
  secret: "super-secret-string",
  hook: "onRequest",
});

export  function SignUp  (){
  return async ( req: FastifyRequest<{ Body: { firstName: string; lastName : string ; email : string ;username: string;password: string } }>,
   reply: FastifyReply,
 ) => {
   const { username, password, firstName, lastName, email} = req.body;
   if (!username || !password || !email || !firstName || !lastName) {
     return reply.status(400).send({ error: "Bad Request", message: "All the field should be filled" });
   }
   try{
    const exist = await playerExist(email, username);
    if (exist)
      return reply.code(409).send({message: "this username or email already registred"})
    const hashedPassword = await bcrypt.hash(password, 10);
    const UserId = await new Promise<number>((resolve, reject) => {
      db.run(
        "INSERT INTO players (firstName, lastName, username, email, password) VALUES (?, ?, ?, ?, ?)",
        [firstName, lastName, username, email, hashedPassword],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
    const user = {id : UserId, username, email}
    const refreshToken =  generateRefreshToken(user)
    const accessToken = generateAccessToken(user)
    await storeRefrechTokenInDb(refreshToken, user)
    const refreshTokenExpiration = new Date();
    refreshTokenExpiration.setDate(refreshTokenExpiration.getDate() + 7);
    return reply
    .setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: refreshTokenExpiration,
      path: '/',
    })
    .status(201)
    .send({
      message: 'user created successfully',
      user,
      token: {
        accessToken,
      },
    });
  }catch(err){
    console.log(err);
      return reply.status(500).send({ message: 'Internal server error during registration' });
  }
 }
}
