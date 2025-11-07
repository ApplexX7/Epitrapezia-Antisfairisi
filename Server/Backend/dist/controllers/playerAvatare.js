"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.playerAvatare = playerAvatare;
const db_1 = require("../databases/db");
const authRefresh_1 = require("./authRefresh");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function playerAvatare() {
    return async (req, reply) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken)
                return reply.status(401).send({ message: "No refresh token" });
            const expiredDate = await (0, authRefresh_1.refreshTokenDate)(refreshToken);
            if (!expiredDate)
                return reply.status(403).send({ message: "RefreshToken Expired" });
            const user = await (0, authRefresh_1.verifyRefreshToken)(refreshToken);
            if (!user) {
                return reply.status(403).send({ message: "Invalid refresh token" });
            }
            const data = await req.file();
            if (!data) {
                return reply.code(400).send({ message: "Not file to uplaod" });
            }
            const filename = data.filename;
            const filePath = path_1.default.join(__dirname, 'uplaods', filename);
            if (!fs_1.default.existsSync(path_1.default.dirname(filePath)))
                fs_1.default.mkdirSync(path_1.default.dirname(filePath), { recursive: true });
            const writeStream = fs_1.default.createWriteStream(filePath);
            data.file.pipe(writeStream);
            writeStream.on('finish', async () => {
                try {
                    const updateAvatar = await new Promise((resolve, reject) => {
                        db_1.db.run("UPDATE player_infos SET avatar = ? WHERE id = ?", [filePath, user.player_id], function (err) {
                            if (err)
                                reject(err);
                            else
                                resolve();
                        });
                    });
                    reply.code(201).send({
                        message: "avatare Uplaoded Succefully",
                        user,
                    });
                }
                catch (err) {
                    return reply.code(500).send({ message: "Internal Server Error" });
                }
            });
            writeStream.on('error', (err) => {
                reply.status(500).send({ message: 'Error uploading file', error: err.message });
            });
        }
        catch (err) {
            return reply.code(500).send({ message: "Internal Server Error" });
        }
    };
}
