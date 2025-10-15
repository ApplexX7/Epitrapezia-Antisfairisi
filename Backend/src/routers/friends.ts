import { Server } from "../server"
import { Getfriend } from "../controllers/GetFriends";

export function friends (){
    Server.instance().get("/friends/", Getfriend());
}