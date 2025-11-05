"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playerSettings = playerSettings;
const server_1 = require("../server");
const playerAvatare_1 = require("../controllers/playerAvatare");
const UserSearch_1 = require("../controllers/UserSearch");
function playerSettings() {
    server_1.Server.instance().post("/settings/avatar", (0, playerAvatare_1.playerAvatare)());
    server_1.Server.instance().get("/search", (0, UserSearch_1.UserSearch)());
}
