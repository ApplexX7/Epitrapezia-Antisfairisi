import { FastifyRequest, FastifyReply } from "fastify";
import { Database } from "sqlite3";
import { playerExist } from '../modules/playerExist'
import bcrypt from 'bcrypt';
import { db } from '../databases/db'


export  function SignUp  (){
  return async ( req: FastifyRequest<{ Body: { firstName: string; lastName : string ; email : string ;username: string;password: string } }>,
   reply: FastifyReply,
 ) => {
   const { username, password, firstName, lastName, email} = req.body;
   if (!username || !password || !email || !firstName || !lastName) {
     return reply.status(400).send({ error: "Bad Request", message: "All the field should be filled" });
   }
   try{
    const varr = await playerExist(email, username);
    console.log(varr)
    if (varr)
      return reply.code(409).send({message: "this username or email already registred"})
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run(
      'INSERT INTO players (firstName, lastName, username, email, password) VALUES (?, ?, ?,  ?, ?)',
      [firstName, lastName, username, email, hashedPassword],
    )
  }catch(err){
      reply.status(500).send({ message: 'Internal server error during registration' });
  }
  return reply.status(201).send({message: 'User created successfully'});
 }
}
