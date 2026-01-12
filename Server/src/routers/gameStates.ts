import { Server } from "../server";
import { GetHistoryGames } from "../controllers/gethistorygames";

export async function gameStatesRouters() {
    const server = Server.instance();

    server.get(
        "/historygames",
        GetHistoryGames()
    );
}