import { db } from "../databases/db";
import { User } from "../interfaces/userInterface";
import { FastifyRequest, FastifyReply } from "fastify";

export async  function getUserInfo(req : FastifyRequest, reply : FastifyReply){
    const { id } = req.params as { id?: string };
    if (!id)
        return reply.status(400).send({ mesage : "Messing id for user"});
    try{
        const exist = await new Promise<User>((resolve, reject) => {
            db.get(
                "SELECT * FROM players WHERE id = ? ",
                [id],
                (err, user : User) => err ? reject(err) : resolve(user)
            );
        })
        if (!exist)
            return reply.code(401).send({message: "Invalid username/email"})
        const userInof = {
            id : exist.id,
            username : exist.username,
            avatar : exist.avatar,
            level: exist.level || 1,
            progression: ((exist.experience || 0) % 100),
        }
        reply.code(200).send({
            userInof,
        });
    } catch (err){
        return reply.code(500).send({message : "Internal Server Error"});
    }
}