"use client";
import api from "@/lib/axios";
import Image from "next/image";
import Link from "next/link";
import { useGoogleAuth } from "@/components/useGoogleAuth";
import {useState} from "react";
import { useRouter } from "next/navigation";
import {InputLogin} from "@/components/LoginInput"
import {LoginButton} from "@/components/loginButton"
import { useAuth } from "@/components/hooks/authProvider";
import LoginPageWrapper from "@/components/LoginWrapComp";


export default function Login() {
  const router = useRouter();
  const [failedLog, setFailedLog] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const checkAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    try {
      const res = await api.post("/auth/Login", data);
      if (res.data?.token?.accessToken && res.data.user) {
        const { accessToken } = res.data.token;
        const user = res.data.user;
        useAuth.getState().setAuth(user, accessToken);
        router.push("/Home");
      } else {
        setFailedLog("Login failed: Invalid server response");
      }
    } catch (err: any) {
      if (err.response) {
        setFailedLog(err.response.data?.message || "Login failed");
      } else {
        setFailedLog("Login failed: No response from server");
      }
    }
  };
  return (
    <LoginPageWrapper>
    <div className="h-screen bg-[url('/images/bg-image.png')] bg-cover bg-center flex justify-center items-center">
      <div className="relative h-full w-300 w-max-350 md:h-[900px] md:w-350 md:ml-10 md:mr-10 bg-white/5 border-white backdrop-blur-lg ring-1
        ring-amber-50/20 backdrop-brightness-[150%] rounded-[35px] shadow-[10px_10px_10px_10px_rgba(0,0,0,0.3)] flex flex-row  gap-10">
        <div className=" bg-whitebg/50 w-full  sm:w-[650px] sm:pt-35 h-full rounded-l-[35px] rounded-tr-[80px] px-20 shadow-[10px_0px_10px_0px_rgba(0,0,0,0.2)]  flex flex-col justify-center items-center">
            <h1 className=" text-center text-2xl md:-mt-20 sm:text-[36px] font-bold text-shadow-lg/10 mb-0"> Welcome Back! </h1>
            <p className=" text-center text-sm md:-mt-3 font-light">sign-in to acces your account </p>
            <form onSubmit={checkAuth} className="mt-10 w-full flex flex-col items-center justify-between gap-8">
              {failedLog && (
                <p className="text-red-800 font-medium text-center mt-2">
                  {failedLog}
                </p>
              )}
              <InputLogin type="text" name="login" placeholder="Username or Email" />
               <div className="relative mb-0 w-full">
                <InputLogin type={showPassword ? "text" : "password"} name="password" placeholder="Password"/>
                  <button type="button"  onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center z-20 px-3 cursor-pointer text-gray-400"
                        >
                          {showPassword ? (
                            <svg
                            className="size-5 text-black-nave"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            >
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          ) : (
                            <svg
                            className="size-5 text-black-nave"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            >
                              <path d="M17.94 17.94A10.43 10.43 0 0 1 12 19c-7 0-10-7-10-7a13.53 13.53 0 0 1 3.23-4.61"></path>
                              <path d="M1 1l22 22"></path>
                            </svg>
                          )}
                </button>
              </div>
              <div className="flex items-center w-full -mt-6 ml-5">
                <Link href="/login" className=" hover:underline hover:decoration-blue-600 focus:underline focus:decoration-blue-500 "> Forget your password ?</Link>
              </div>
              <LoginButton
                types="submit"
                className="whitespace-nowrap">
                  Sign In
                </LoginButton>
            </form>
              <LoginButton 
                types="submit"
                className="inline-flex justify-center mt-3"
                onClicks={() => (window.location.href = "/api/auth/google")}
                >
                <Image className="mr-3" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={32} height={32}/>
                  Sign in with Google
                </LoginButton>
              <p className="text-md sm:text-[18px] text-center mt-4 sm:mt-8"> Dont Have an account? <Link className="ml-1 font-bold text-blue-murder hover:underline underline-offset-2 
              cursor-pointer" href="./sign-up">Sign Up!</Link></p>
        </div>
        <Image className="hidden md:-z-50 md:w-[700px] right-10 h-full  md:block absolute"  alt="Logo for  a ping pong" src="/images/logo-S.png" width={500} height={500} priority/>
      </div>
    </div>
  </LoginPageWrapper>
  );
}
