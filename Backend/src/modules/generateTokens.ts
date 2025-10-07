import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {User} from "../interfaces/userInterface"

dotenv.config();

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

const accessTokenSecret = getEnvVar("ACCESS_TOKEN");
const refreshTokenSecret = getEnvVar("REFRESH_TOKEN");

export function generateAccessToken(player: User) {
  return jwt.sign(
    { id: player.id, username: player.username, email: player.email },
    accessTokenSecret,
    { expiresIn: "15m" }
  );
}

export function generateRefreshToken(player: User) {
  return jwt.sign(
    { id: player.id },
    refreshTokenSecret,
    { expiresIn: "7d" }
  );
}
