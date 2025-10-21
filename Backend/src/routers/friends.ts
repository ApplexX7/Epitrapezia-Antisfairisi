import { Server } from "../server"
import { Getfriends } from "../controllers/GetFriends";
import { FriendRequest } from "../controllers/friendsRequets";

export function friends (){
    Server.instance().get("/friends/", Getfriends());
    Server.instance().post("/friends/Invite", FriendRequest);
}