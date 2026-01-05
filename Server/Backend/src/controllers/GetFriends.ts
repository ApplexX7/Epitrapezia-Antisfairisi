import { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../databases/db";
import { acceptedFriends } from "../modules/friends";

export function Getfriends(){
    return async (req : FastifyRequest ,
        reply : FastifyReply
    ) => {
        const { userid } = (req as any).user as any;
        try{
            const user = await new Promise((resolve, rejects) => {
                db.get(
                    "SELECT * FROM WHERE players  id = ?",
                    [userid.id],
                    (err : any, user : any) => {
                        if (err)
                            rejects(err);
                        else{
                            resolve(user);
                        }
                    }
                );
            })
            if (!user)
                return reply.code(401).send({message : "Invalid RefreshToken"});
            const friends = await acceptedFriends(user);
            if (!friends)
                return reply.code(404).send({message : "No friend Found"});
            reply.status(200).send({friends});
        }catch(err){

        }
    };
}