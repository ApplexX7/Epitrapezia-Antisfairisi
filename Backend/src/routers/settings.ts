import { Server } from "../server";
import { playerAvatare } from "../controllers/playerAvatare";


export function playerSettings(){
    Server.instance().post("/settings/avatar", playerAvatare());

}