"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouters = authRouters;
const server_1 = require("../server");
const login_1 = require("../controllers/login");
const signUp_1 = require("../controllers/signUp");
const authRefresh_1 = require("../controllers/authRefresh");
const logout_1 = require("../controllers/logout");
const verifyOtp_1 = require("../controllers/verifyOtp");
const resendOtp_1 = require("../controllers/resendOtp");
const googleAuth_1 = require("../controllers/googleAuth");
const loginSchema = {
    type: "object",
    required: ["login", "password"],
    properties: {
        login: { type: "string" },
        password: { type: "string", minLength: 8 },
    },
};
const signUpSchema = {
    type: "object",
    required: ["firstName", "lastName", "username", "email", "password"],
    properties: {
        firstName: { type: "string" },
        lastName: { type: "string" },
        username: { type: "string" },
        email: { type: "string", format: "email" },
        password: { type: "string", minLength: 8 },
    },
};
function authRouters() {
    server_1.Server.instance().post("/auth/Login", { schema: { body: loginSchema } }, (0, login_1.Login)());
    server_1.Server.instance().get("/auth/refresh", (0, authRefresh_1.RefreshToken)());
    server_1.Server.instance().post("/auth/logout", (0, logout_1.Logout)());
    server_1.Server.instance().post("/auth/verify-otp", (0, verifyOtp_1.VerifyOtp)());
    server_1.Server.instance().post("/auth/resend-otp", (0, resendOtp_1.ResendOtp)());
    server_1.Server.instance().get("/auth/google", googleAuth_1.GoogleAuthRedirection);
    server_1.Server.instance().get("/auth/google/callback", googleAuth_1.GoogleAuthCallback);
    server_1.Server.instance().post("/auth/Sign-up", { schema: { body: signUpSchema } }, (0, signUp_1.SignUp)());
}
