import { FastifyRequest, FastifyReply } from "fastify";
import { playerExist } from '../modules/playerExist'
import bcrypt from 'bcrypt';
import {  storeRefrechTokenInDb } from '../modules/storeRefreshTokenInDb'
import { generateAccessToken, generateRefreshToken } from "../modules/generateTokens";


export function Logout(){
    return async (req : FastifyRequest, reply : FastifyReply) => {
        try {
            
        } catch (err){

        }
    }
}