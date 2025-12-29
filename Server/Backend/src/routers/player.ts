import { Server } from "../server";
import { playerAvatare } from "../controllers/playerAvatare";
import { UserSearch } from "../controllers/UserSearch";
import { getUserInfo } from "../controllers/getUserInfo";


export function playerSettings(){
    Server.instance().post("/settings/avatar", playerAvatare());
    Server.instance().get("/search", UserSearch());
    Server.instance().get('/user/:id', getUserInfo);
}