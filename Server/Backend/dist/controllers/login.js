"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Login = Login;
const playerExist_1 = require("../modules/playerExist");
const bcrypt_1 = __importDefault(require("bcrypt"));
const storeRefreshTokenInDb_1 = require("../modules/storeRefreshTokenInDb");
const generateTokens_1 = require("../modules/generateTokens");
function Login() {
    return async (req, reply) => {
        const { login, password } = req.body;
        if (!login || !password) {
            return reply.status(400).send({ error: "Bad Request", message: "Missing login or password" });
        }
        try {
            const exist = await (0, playerExist_1.playerExist)(login, login);
            if (!exist)
                return reply.code(401).send({ message: "Invalid username/email or password" });
            const verifyPassowrd = await bcrypt_1.default.compare(password, exist.password);
            if (!verifyPassowrd)
                return reply.code(401).send({ message: "Invalid username/email or password" });
            const user = { id: exist.id, username: exist.username, email: exist.email, avatar: exist.avatar };
            const accessToken = (0, generateTokens_1.generateAccessToken)(user);
            const refreshToken = (0, generateTokens_1.generateRefreshToken)(user);
            await (0, storeRefreshTokenInDb_1.storeRefrechTokenInDb)(refreshToken, user);
            return reply
                .setCookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 7 * 24 * 60 * 60,
            })
                .status(200)
                .send({
                message: 'Login successful',
                user,
                token: {
                    accessToken,
                },
            });
        }
        catch (err) {
            return reply.status(500).send({ message: 'Internal server error during registration' });
        }
    };
}
