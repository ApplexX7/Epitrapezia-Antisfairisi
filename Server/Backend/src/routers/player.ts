import { Server } from "../server";
import { playerAvatar } from "../controllers/playerAvatare";
import { UserSearch } from "../controllers/UserSearch";
import { getUserInfo } from "../controllers/getUserInfo";
import { updateProfile } from "../controllers/updateProfile";
import { updatePassword } from "../controllers/updatePassword";
import { toggleTwoFactor } from "../controllers/toggleTwoFactor";
import { getGameStats } from "../controllers/getGameStats";
import { GetPlayerMetrics } from "../controllers/getPlayerMetrics";
import { GetXpHistory } from "../controllers/getXpHistory";


export function playerSettings(){
    Server.instance().post("/settings/avatar", playerAvatar());
    Server.instance().put("/settings/profile", updateProfile());
    Server.instance().put("/settings/password", updatePassword());
    Server.instance().put("/settings/2fa", toggleTwoFactor());
    Server.instance().get("/search", UserSearch());
    Server.instance().get('/user/:id', getUserInfo);
    Server.instance().get('/stats/:id', getGameStats);
    Server.instance().get('/stats/metrics/:playerId', GetPlayerMetrics());
    Server.instance().get('/stats/xp-history/:playerId', GetXpHistory());
}