import { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../databases/db";
import { refreshTokenDate, verifyRefreshToken } from "./authRefresh";
import path from "path";
import fs from "fs";
import { pipeline } from "stream/promises";
import sharp from "sharp";

export function playerAvatar() {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    try {
    const user = (req as any).user;
      const data = await req.file();
      if (!data)
        return reply.code(400).send({ message: "No file to upload" });

      if (!data.mimetype.startsWith("image/")) {
        return reply
          .code(400)
          .send({ message: "Only image files are allowed" });
      }

      // Use process.cwd() for reliable path in both ts-node and build
      const uploadsDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const oldAvatar: string | undefined = await new Promise((resolve) => {
        db.get(
          "SELECT avatar FROM players WHERE id = ?",
          [user.id],
          (err, row: any) => resolve(row?.avatar)
        );
      });

      if (oldAvatar) {
        const oldPath = path.join(uploadsDir, path.basename(oldAvatar));
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      const filename = `avatar_${user.id}.webp`;
      const filePath = path.join(uploadsDir, filename);
      const urlPath = `/uploads/${filename}`;

      await pipeline(
        data.file,
        sharp()
          .resize(256, 256, {
            fit: "cover",
          })
          .toFormat("webp")
          .webp({ quality: 80 }),
        fs.createWriteStream(filePath)
      );

      await new Promise<void>((resolve, reject) => {
        db.run(
          "UPDATE players SET avatar = ? WHERE id = ?",
          [urlPath, user.id],
          (err) => (err ? reject(err) : resolve())
        );
      });

      return reply.code(201).send({
        message: "Avatar uploaded successfully",
        avatar: urlPath,
      });
    } catch (err) {
      return reply.code(500).send({ message: "Internal Server Error" });
    }
  };
}
