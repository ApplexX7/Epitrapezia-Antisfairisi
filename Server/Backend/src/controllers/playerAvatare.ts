import { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../databases/db";
import { refreshTokenDate , verifyRefreshToken} from "./authRefresh";
import path from "path";
import fs, { write } from 'fs'
import fastifyMultipart from "@fastify/multipart";

export function playerAvatare (){
    return  async(req : FastifyRequest, reply : FastifyReply) => {
        try{
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken)
              return reply.status(401).send({ message: "No refresh token" });
            const expiredDate = await refreshTokenDate(refreshToken);
            if (!expiredDate)
                return reply.status(403).send( {message: "RefreshToken Expired"})
            const user = await verifyRefreshToken(refreshToken);
            if (!user) {
                return reply.status(403).send({ message: "Invalid refresh token" });
            }
            const data = await req.file()
            if (!data){
                return reply.code(400).send({message : "Not file to uplaod"});
            }
            const filename = data.filename;
            const filePath = path.join(__dirname, 'uplaods', filename);
            if (!fs.existsSync(path.dirname(filePath)))
                    fs.mkdirSync(path.dirname(filePath), {recursive : true});
            const writeStream = fs.createWriteStream(filePath);
            data.file.pipe(writeStream);
            writeStream.on('finish', async () =>{
                try{
                    const updateAvatar : any = await new Promise<void>((resolve, reject) => {
                        db.run(
                            "UPDATE player_infos SET avatar = ? WHERE id = ?",
                            [filePath, user.player_id],
                            function(err){
                                if (err) reject(err);
                                else resolve();
                            }
                        )
                    });
                    reply.code(201).send({
                        message : "avatare Uplaoded Succefully",
                        user,
                    });
                }catch(err){
                    return reply.code(500).send({message : "Internal Server Error"});
                }
            })
            writeStream.on('error', (err) => {
                reply.status(500).send({ message: 'Error uploading file', error: err.message });
            });
        }catch(err){
            return reply.code(500).send({message : "Internal Server Error"});
        }
    }
}