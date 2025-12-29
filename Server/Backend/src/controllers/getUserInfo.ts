import { db } from "../databases/db";
import { User } from "../interfaces/userInterface";
import { FastifyRequest, FastifyReply } from "fastify";

export async  function getUserInfo(req : FastifyRequest, reply : FastifyReply){
    const { id } = req.params as { id?: string };
    if (!id)
        return reply.status(400).send({ mesage : "Missing identifier for user"});
    try{
        const exist = await new Promise<User>((resolve, reject) => {
            // Try to find by ID first, then by username
            const query = isNaN(Number(id)) 
                ? "SELECT * FROM players WHERE username = ?" 
                : "SELECT * FROM players WHERE id = ?";
            db.get(
                query,
                [isNaN(Number(id)) ? id : Number(id)],
                (err, user : User) => err ? reject(err) : resolve(user)
            );
        })
        if (!exist)
            return reply.code(404).send({message: "User not found"})
        const userInof = {
            id : exist.id,
            username : exist.username,
            avatar : exist.avatar,
            level: exist.level || 1,
            experience: exist.experience || 0,
            progression: ((exist.experience || 0) % 100),
        }
        reply.code(200).send({
            user: userInof,
        });
    } catch (err){
        return reply.code(500).send({message : "Internal Server Error"});
    }
}