import jwt from '@fastify/jwt';
import { Server } from '../server'


export async function jwtGenerate(){
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    const data = {
}