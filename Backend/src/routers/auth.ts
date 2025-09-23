import { FastifyInstance } from "fastify";
import { Server } from "../server";
import { Login } from "../controllers/login";
import { SignUp } from "../controllers/signUp";

export function authRouters(){
  Server.instance().post<{ Body: { login: string; password: string } }>(
    "/auth/Login",
    Login()
  );
  
  Server.instance().post<{ Body: { firstName: string; lastName : string ; email : string ;username: string;password: string } }>(
    "/auth/Sign-up",
    {
         schema: {
                body: {
                type: 'object',
                required: ['firstName', 'lastName', 'username', 'email', 'password'],
                properties: {
                    firstName: { type : 'string'},
                    lastName : { type : 'string'},
                    username: { type: 'string' },
                    email: { type: 'string', format: 'email'},
                    password: { type: 'string', minLength: 8 }
                }
            }
        }
    },
    SignUp()
  );
}