"use client";
import api from "@/lib/axios";
import Image from "next/image";
import Link from "next/link";
import { useState} from "react";
import {InputLogin} from "@/components/LoginInput"
import {LoginButton} from "@/components/loginButton"
import LoginPageWrapper from "@/components/LoginWrapComp";
import { InputOTPWithSeparator } from "@/components/InputOtp";
import {isStrongPassword, getPasswordStrengthMessage, isValidUsername, getUsernameErrorMessage} from "@/lib/sanitize";


export default function SignUp() {
  const [failedLog, setFailedLog] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [emailData, setEmailVef] = useState<{email: string; player_id: number}>({
    email: "",
    player_id: 0,
  });
  const SignUpCread = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries()); 
    const rawUsername = data.username?.toString() || "";
    if (!isValidUsername(rawUsername)) {
      setFailedLog(getUsernameErrorMessage(rawUsername));
      return;
    }
    const password = data.password?.toString() || "";
    if (!isStrongPassword(password)) {
      setFailedLog(getPasswordStrengthMessage(password));
      return;
    }
    try{
      const res = await api.post("/auth/Sign-up", data)
      if (res.data?.user){
        setEmailVef({ email: res.data.user.email as string , player_id: res.data.user.id as number });
        setShowOtp(true);
      }
      else {
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
        <div className="relative h-full w-300 w-max-350 md:h-[850px] md:w-350 md:ml-10 md:mr-10 bg-white/5 border-white backdrop-blur-lg ring-1
          ring-amber-50/20 backdrop-brightness-[150%] rounded-[35px] shadow-[10px_10px_10px_10px_rgba(0,0,0,0.3)] flex flex-row-reverse  gap-10">
          <div className=" z-100 bg-whitebg/50  w-full  md:w-[650px] md:pt-35 h-full 
            rounded-bl-[35px] rounded-tl-[35px] md:rounded-bl-[0px] 
            rounded-r-[35px] rounded-tr-[35px] sm:rounded-tl-[80px] px-20 
            shadow-[10px_0px_10px_0px_rgba(0,0,0,0.2)] flex flex-col 
            justify-center items-center"
          > 
          {!showOtp ?(
            <>
                <h1 className=" text-center text-2xl md:-mt-20 sm:text-[36px]
                font-bold text-shadow-lg/10 mb-0">
                    Create your account 
                  </h1>
                  <p 
                  className=" text-center text-sm md:-mt-0.5 font-light">
                    Register now for more fun!
                  </p>
                    {failedLog && (
                      <p className="text-red-800 font-medium text-center mt-2">
                        {failedLog}
                      </p>
                    )}
                  <form onSubmit={SignUpCread} className="mt-10 w-full flex flex-col items-center justify-between gap-8">
                    <div className="flex justify-between w-full gap-5 sm:gap-10 items-center">
                    <InputLogin type="text" name="firstName" placeholder="First Name"/>
                    <InputLogin  type="text" name="lastName" placeholder="Last Name"/>
                    </div>
                      <InputLogin  type="text" name="username" placeholder="Username"/>
                      <InputLogin  type="email" name="email" placeholder="Email"/>
                      <div className="relative mb-0 w-full">
                      <InputLogin  type={showPassword ? "text" : "password"} name="password" placeholder="Password"/>
                        <button type="button"  onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 flex items-center z-20 px-3 cursor-pointer text-gray-400 hover:text-blue-600"
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
                    <LoginButton
                      types="submit"
                      className="whitespace-nowrap">
                      Sign Up
                    </LoginButton>
                  </form>
                    <LoginButton 
                    types="submit" 
                    className="inline-flex justify-center mt-3"
                    onClicks={() => (window.location.href = "/api/auth/google")}
                    >
                      <Image className="mr-3" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={32} height={32} priority/>
                      Sign Up with Google
                    </LoginButton>
                    <p className="text-md sm:text-[18px] text-[12px] text-center mt-4 sm:mt-5">Already have an acoount? <Link className="ml-1 font-bold text-blue-murder hover:underline underline-offset-2 
                    cursor-pointer" href="./login">Sign In!</Link></p>
                 </>
                ) :
                (
                  <InputOTPWithSeparator email={emailData.email} player_id={emailData.player_id}/>
                )}
                </div>
                <Image className="z-0 hidden md:w-[700px] left-10 h-full  md:block absolute"
                  alt="Logo for  a ping pong" src="/images/logo-S.png" 
                  width={500} height={500} priority/>
                </div>
                </div>
                </LoginPageWrapper>
              );
            }
            