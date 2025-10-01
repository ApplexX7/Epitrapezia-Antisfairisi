"use client"
import api from "@/lib/axios";
import Image from "next/image";
import { useState} from "react";
import { useRouter } from "next/navigation";
import { InputOTPWithSeparator } from "@/components/InputOtp";
import { useAuth } from "@/components/hooks/authProvider";



export default function VerifyOtp(){
    const router = useRouter();
    const [failedLog, setFailedLog] = useState("");
    const Otpverify = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.target as HTMLFormElement);
      const data = Object.fromEntries(formData.entries()); 
      try{
        const res = await api.post("/auth/verifyOtp", data)
        if (res.data?.token?.accessToken && res.data.user) {
          const { accessToken } = res.data.token;
          const user = res.data.user;
          useAuth.getState().setAuth(user, accessToken);
          router.push("/Home");
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
        <div className="h-screen bg-[url('/images/bg-image.png')] bg-cover bg-center flex justify-center items-center">
        <div className="relative h-full w-300 w-max-350 md:h-[850px] md:w-350 md:ml-10 md:mr-10 bg-white/5 border-white backdrop-blur-lg ring-1
          ring-amber-50/20 backdrop-brightness-[150%] rounded-[35px] shadow-[10px_10px_10px_10px_rgba(0,0,0,0.3)] flex flex-row-reverse  gap-10">
          <div className=" z-100 bg-whitebg/50  w-full  md:w-[650px] md:pt-35 h-full 
            rounded-bl-[35px] rounded-tl-[35px] md:rounded-bl-[0px] 
            rounded-r-[35px] rounded-tr-[35px] sm:rounded-tl-[80px] px-20 
            shadow-[10px_0px_10px_0px_rgba(0,0,0,0.2)] flex flex-col 
            justify-center items-center"
          >
            <InputOTPWithSeparator/>
          </div>
          <Image className="z-0 hidden md:w-[700px] left-10 h-full  md:block absolute"  alt="Logo for  a ping pong" src="/images/logo-S.png" width={500} height={500}/>
        </div>
      </div>)
}