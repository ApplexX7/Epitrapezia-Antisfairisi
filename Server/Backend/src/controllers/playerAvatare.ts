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
            const filename = `${Date.now()}_${data.filename}`;
            const uploadsDir = path.join(__dirname, 'uploads');
            const filePath = path.join(uploadsDir, filename);
            const urlPath = `/uploads/${filename}`;
            
            if (!fs.existsSync(uploadsDir))
                    fs.mkdirSync(uploadsDir, {recursive : true});
            const writeStream = fs.createWriteStream(filePath);
            data.file.pipe(writeStream);
            writeStream.on('finish', async () =>{
                try{
                    const updateAvatar : any = await new Promise<void>((resolve, reject) => {
                        db.run(
                            "UPDATE players SET avatar = ? WHERE id = ?",
                            [urlPath, user.id],
                            function(err){
                                if (err) reject(err);
                                else resolve();
                            }
                        )
                    });
                    reply.code(201).send({
                        message : "Avatar uploaded successfully",
                        avatar: urlPath,
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