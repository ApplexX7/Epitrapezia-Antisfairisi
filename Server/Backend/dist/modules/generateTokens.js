"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function getEnvVar(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
}
const accessTokenSecret = getEnvVar("ACCESS_TOKEN");
const refreshTokenSecret = getEnvVar("REFRESH_TOKEN");
function generateAccessToken(player) {
    return jsonwebtoken_1.default.sign({ id: player.id, username: player.username, email: player.email }, accessTokenSecret, { expiresIn: "15m" });
}
function generateRefreshToken(player) {
    return jsonwebtoken_1.default.sign({ id: player.id }, refreshTokenSecret, { expiresIn: "7d" });
}
