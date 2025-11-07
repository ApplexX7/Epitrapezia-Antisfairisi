"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.friends = friends;
const server_1 = require("../server");
const GetFriends_1 = require("../controllers/GetFriends");
const friendsRequets_1 = require("../controllers/friendsRequets");
function friends() {
    server_1.Server.instance().get("/friends/", (0, GetFriends_1.Getfriends)());
    server_1.Server.instance().post("/friends/Invite", friendsRequets_1.FriendRequest);
}
