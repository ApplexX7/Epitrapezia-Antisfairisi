import { Server } from "../server";
import { Login } from "../controllers/login";
import { SignUp } from "../controllers/signUp";
import { RefreshToken } from "../controllers/authRefresh"
import { Logout } from "../controllers/logout";
import {VerifyOtp} from "../controllers/verifyOtp"
import { ResendOtp } from "../controllers/resendOtp";
import { GoogleAuthRedirection, GoogleAuthCallback } from "../controllers/googleAuth";
import { LoginBody, SignUpBody } from "../interfaces/types";

const loginSchema = {
  type: "object",
  required: ["login", "password"],
  properties: {
    login: { type: "string" },
    password: { type: "string", minLength: 8 },
  },
} as const;

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
} as const;

export function authRouters() {
  Server.instance().post<{ Body: LoginBody }>(
    "/auth/Login",
    { schema: { body: loginSchema } },
    Login()
  );

  Server.instance().get("/auth/refresh", RefreshToken());
  Server.instance().post("/auth/logout", Logout())
  Server.instance().post("/auth/verify-otp", VerifyOtp());
  Server.instance().post("/auth/resend-otp", ResendOtp());
  Server.instance().get("/auth/google", GoogleAuthRedirection);
  Server.instance().get("/auth/google/callback", GoogleAuthCallback);

  Server.instance().post<{ Body: SignUpBody }>(
    "/auth/Sign-up",
    { schema: { body: signUpSchema } },
    SignUp()
  );
}