"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAuthRedirection = GoogleAuthRedirection;
exports.GoogleAuthCallback = GoogleAuthCallback;
const axios_1 = __importDefault(require("axios"));
const google_auth_library_1 = require("google-auth-library");
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../databases/db");
const playerExist_1 = require("../modules/playerExist");
const generateTokens_1 = require("../modules/generateTokens");
const storeRefreshTokenInDb_1 = require("../modules/storeRefreshTokenInDb");
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const FRONTEND_REDIRECT = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/Home";
const googleClient = new google_auth_library_1.OAuth2Client(CLIENT_ID);
function generateRandomPassword(length = 8) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
async function GoogleAuthRedirection(req, reply) {
    const authUrl = "https://accounts.google.com/o/oauth2/v2/auth?" +
        `client_id=${CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&response_type=code` +
        `&scope=openid%20email%20profile` +
        `&access_type=offline` +
        `&prompt=consent`;
    reply.redirect(authUrl);
}
async function GoogleAuthCallback(req, reply) {
    const { code } = req.query;
    if (!code)
        return reply.code(400).send({ message: "Missing authorization code" });
    try {
        const tokenResponse = await axios_1.default.post("https://oauth2.googleapis.com/token", new URLSearchParams({
            code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: "authorization_code",
        }).toString(), { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
        const { id_token, access_token, refresh_token } = tokenResponse.data;
        const ticket = await googleClient.verifyIdToken({
            idToken: id_token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload)
            throw new Error("Invalid Google ID token");
        const { email, given_name, family_name, name, picture, sub: googleId } = payload;
        if (!email || !name)
            return reply.code(400).send({ message: "Missing user data" });
        let user = await (0, playerExist_1.playerExist)(email, name);
        if (user) {
            if (user.auth_Provider === 'local')
                return reply.code(403).send({ message: "Please log with your google account" });
        }
        else {
            const username = "@" + email.split("@")[0];
            const password = generateRandomPassword(8);
            const hashPassword = await bcrypt_1.default.hash(password, 10);
            const userId = await new Promise((resolve, reject) => {
                db_1.db.run(`INSERT INTO players (firstName, lastName, username, email, password, avatar, is_verified, auth_Provider)
           VALUES (?, ?, ?, ?, ?, ?, 1, ?)`, [
                    given_name || "",
                    family_name || "",
                    username,
                    email,
                    hashPassword,
                    picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(given_name + " " + family_name)}&background=random&color=fff&size=128`,
                    "google",
                ], function (err) {
                    if (err)
                        reject(err);
                    else
                        resolve(this.lastID);
                });
            });
            user = {
                id: userId,
                firstName: given_name,
                lastName: family_name,
                username: username,
                email,
                avatar: picture,
                auth_Provider: "google",
            };
        }
        const appRefreshToken = (0, generateTokens_1.generateRefreshToken)(user);
        await (0, storeRefreshTokenInDb_1.storeRefrechTokenInDb)(appRefreshToken, user);
        reply.setCookie("refreshToken", appRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60,
        });
        reply.redirect(FRONTEND_REDIRECT);
    }
    catch (err) {
        console.error("Google OAuth callback error:", err.response?.data || err);
        reply.code(500).send({ message: "Google OAuth failed" });
    }
}
