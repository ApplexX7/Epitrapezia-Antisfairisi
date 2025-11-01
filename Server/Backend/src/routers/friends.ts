import { Server } from "../server"
import { Getfriends } from "../controllers/GetFriends";
import { AccepteFriendRequest, FriendRequest, RemoveFriendRequest } from "../controllers/friendsRequets";
import { Friendship } from "../controllers/friendship";

export function friends (){
    Server.instance().get("/friends/", Getfriends());
    Server.instance().post("/friends/Invite",  FriendRequest);
    Server.instance().post("/friends/Remove",  RemoveFriendRequest);
    Server.instance().post("/friends/Accept", AccepteFriendRequest);
    Server.instance().put("/friends/friendship", Friendship);

}