import { FastifyRequest, FastifyReply } from "fastify";
import { Database } from "sqlite3";
import { playerExist } from '../modules/playerExist'
import bcrypt from 'bcrypt';
import { db } from '../databases/db'



export  function Login  (){
    return async ( req: FastifyRequest<{ Body: { username: string; password: string } }>,
     reply: FastifyReply,
   ) => {
     const { username, password } = req.body;
     if (!username || !password) {
       return reply.status(400).send({ error: "Bad Request", message: "Missing username or password" });
     }
     return { message: "Logged in", username };
   }
 }