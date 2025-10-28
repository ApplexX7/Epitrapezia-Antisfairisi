"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignUp = SignUp;
const playerExist_1 = require("../modules/playerExist");
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../databases/db");
const cookie_1 = __importDefault(require("@fastify/cookie"));
const server_1 = require("../server");
const generateOtp_1 = require("../modules/generateOtp");
server_1.Server.instance().register(cookie_1.default, {
    secret: "super-secret-string",
    hook: "onRequest",
});
function SignUp() {
    return async (req, reply) => {
        const { username, password, firstName, lastName, email } = req.body;
        if (!username || !password || !email || !firstName || !lastName) {
            return reply.status(400).send({ message: "All fields should be filled" });
        }
        try {
            const exist = await (0, playerExist_1.playerExist)(email, username);
            if (exist)
                return reply.code(409).send({ message: "Username or email already registered" });
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            const userId = await new Promise((resolve, reject) => {
                db_1.db.run("INSERT INTO players (firstName, lastName, username, email, password, avatar, is_verified) VALUES (?, ?, ?, ?, ?, ?, 0)", [firstName, lastName, username, email.toLowerCase(), hashedPassword, "/images/defaultAvatare.jpg"], function (err) {
                    if (err)
                        reject(err);
                    else
                        resolve(this.lastID);
                });
            });
            const otp = (0, generateOtp_1.generateOTP)();
            const expiredAt = new Date();
            expiredAt.setMinutes(expiredAt.getMinutes() + 10);
            await (0, generateOtp_1.saveOTP)(userId, otp, "email_verification", 30);
            await (0, generateOtp_1.sendVerificationEmail)(email, otp);
            const user = { id: userId, username, email, firstName, lastName, avatar: "/images/defaultAvatare.jpg", auth_Provider: "local" };
            return reply.status(201).send({
                message: "User created successfully. Please verify your email with the OTP sent.",
                user,
            });
        }
        catch (err) {
            console.log(err);
            return reply.status(500).send({ message: "Internal server error during registration" });
        }
    };
}
