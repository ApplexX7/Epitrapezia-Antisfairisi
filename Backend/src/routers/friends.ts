import { Server } from "../server"
import { Getfriends } from "../controllers/GetFriends";

export function friends (){
    Server.instance().get("/friends/", Getfriends());
}