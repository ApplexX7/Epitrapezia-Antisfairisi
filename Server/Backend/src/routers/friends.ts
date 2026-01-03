import { Server } from "../server"
import { Getfriends } from "../controllers/GetFriends";
import { AccepteFriendRequest, FriendRequest, RemoveFriendRequest } from "../controllers/friendsRequets";
import { Friendship } from "../controllers/friendship";
import { blockUser, unblockUser, getBlockedUsers } from "../controllers/unb_block";
import { getPendingFriendRequests } from "../controllers/getPendingFriendRequests";

export function friends (){
    Server.instance().get("/friends/", Getfriends());
    Server.instance().get("/friends/requests/pending", getPendingFriendRequests);
    Server.instance().post("/friends/Invite",  FriendRequest);
    Server.instance().post("/friends/Remove",  RemoveFriendRequest);
    Server.instance().post("/friends/Accept", AccepteFriendRequest);
    Server.instance().put("/friends/friendship", Friendship);
    Server.instance().post("/friends/block", blockUser);
    Server.instance().post("/friends/unblock", unblockUser);
    Server.instance().put("/friends/blocked", getBlockedUsers);
}