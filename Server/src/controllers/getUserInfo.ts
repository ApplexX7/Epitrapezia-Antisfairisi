import { db } from "../databases/db";
import { User } from "../interfaces/userInterface";
import { FastifyRequest, FastifyReply } from "fastify";

export async  function getUserInfo(req : FastifyRequest, reply : FastifyReply){
    const { id } = req.params as { id?: string };
    if (!id)
        return reply.status(400).send({ mesage : "Missing identifier for user"});
    try{
        const exist = await new Promise<User>((resolve, reject) => {
            // Try to find by ID first, then by username, and pull desp as bio and socials
            const query = isNaN(Number(id)) 
                ? `SELECT p.*, COALESCE(pi.desp, '') AS bio, COALESCE(pi.socials, '') AS socials FROM players p LEFT JOIN player_infos pi ON pi.player_id = p.id WHERE p.username = ?`
                : `SELECT p.*, COALESCE(pi.desp, '') AS bio, COALESCE(pi.socials, '') AS socials FROM players p LEFT JOIN player_infos pi ON pi.player_id = p.id WHERE p.id = ?`;
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
            let github = "";
            let instagram = "";
            
            if (exist.socials) {
              try {
                const socials = JSON.parse(exist.socials);
                github = socials.github ?? "";
                instagram = socials.instagram ?? "";
              } catch (e) {
                // If socials is not valid JSON, leave as empty strings
              }
            }
            
            return reply.status(200).send({
                id: exist.id,
                username: exist.username,
                email: exist.email,
                firstName: exist.firstName,
                lastName: exist.lastName,
                level: exist.level || 1,
                experience: exist.experience || 0,
                avatar: exist.avatar,
                progression: ((exist.experience || 0) % 100),
                status: exist.status,
                bio: exist.bio ?? "",
                github,
                instagram,
                dateJoined: exist.created_at ? new Date(exist.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Joined recently",
                twoFactorEnabled: Boolean(exist.two_factor_enabled),
            });
    } catch (err){
        return reply.code(400).send({message : "Internal Server Error"});
    }
}