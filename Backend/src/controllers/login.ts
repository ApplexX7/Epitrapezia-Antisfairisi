import { FastifyRequest, FastifyReply } from "fastify";
import { playerExist } from '../modules/playerExist'
import bcrypt from 'bcrypt';
import {  storeRefrechTokenInDb } from '../modules/storeRefreshTokenInDb'
import { generateAccessToken, generateRefreshToken } from "../modules/generateTokens";

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
        const user  = { id : exist.id, username : exist.username, email : exist.email}
        const accessToken = generateAccessToken(user)
        const refreshToken = generateRefreshToken(user)
        await storeRefrechTokenInDb(refreshToken, user)
        return reply.setCookie("refreshToken", refreshToken, {
          httpOnly : true,
          secure : false,
          sameSite : "strict",
          path : "/"
        }).status(200).send({
          message : "Login successful",
          user,
          token : {
            accessToken,
          },
        });

    }catch(err){
      return reply.status(500).send({ message: 'Internal server error during registration' });
    }
   }
 }