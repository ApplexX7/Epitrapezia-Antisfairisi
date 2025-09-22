import fastify from "fastify";
import { Server } from "./server";
import {createTable} from './db'
import { SignUp } from './controllers/auth'


const db = createTable();


Server.route('post', '/auth/sign-up', SignUp);
Server.route('post', '/auth/sign-up', Login);


Server.start()