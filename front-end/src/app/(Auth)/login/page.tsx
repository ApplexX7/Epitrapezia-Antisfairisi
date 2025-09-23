"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useUser } from "@/context/playerContext"
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const { setUser }  = useUser()
  const checkAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get("username");
    const password = formData.get("password");
    try {
      const res = await api.post("/auth/Login", { login: name, password });
      console.log(res);
      if (!res?.data?.token?.accessToken || !res.data.user) {
        alert("Login failed: Invalid server response");
        return;
      }
      sessionStorage.setItem("accessToken", res.data.token.accessToken);
      setUser(res.data.user);
      router.push("/Home");
    } catch (err: any) {
      if (err.response) {
        console.error(err.response.data?.message || err.response.statusText);
        alert(err.response.data?.message || "Login failed");
      } else {
        console.error(err.message);
        alert("Login failed: " + err.message);
      }
    }
    
  };
  return (
    <div className="h-screen bg-[url('/images/bg-image.png')] bg-cover bg-center flex justify-center items-center">
      <div className="relative h-full w-full md:h-[900px] md:w-[1600px] md:ml-10 md:mr-10 bg-white/5 border-white backdrop-blur-lg ring-1
        ring-amber-50/20 backdrop-brightness-[150%] rounded-[35px] shadow-[10px_10px_10px_10px_rgba(0,0,0,0.3)] flex flex-row  gap-10">
        <div className=" bg-whitebg/50 w-full  sm:w-[718px] sm:pt-35 h-full rounded-l-[35px] rounded-tr-[80px] px-20 shadow-[10px_0px_10px_0px_rgba(0,0,0,0.2)]  flex flex-col justify-center items-center">
            <h1 className=" text-center text-2xl md:-mt-20 sm:text-[36px] font-bold text-shadow-lg/10 mb-0"> Welcome Back! </h1>
            <p className=" text-center text-sm md:-mt-3 font-light">sign-in to acces your account </p>
            <form onSubmit={checkAuth} className="mt-10 w-full flex flex-col items-center justify-between gap-8">
              <input className="py-2 md:py-5 bg-white-smoke/60 pr-5 pl-5 w-full block rounded-[10px] placeholder:text-black-nave 
                sm:placeholder:text-[22px] sm:text-[22px] font-normal focus:ring-blue-200 focus:outline-indigo-300 shadow-[2px_0px_2px_2px_rgba(0,0,0,0.2)]"
               type="text"  name="username" placeholder="Username" required/>
               <div className="relative mb-0 w-full">
                <input  className="py-2 md:py-5 bg-white-smoke/60 pr-5 pl-5 w-full block rounded-[10px] placeholder:text-black-nave 
                  sm:placeholder:text-[22px] sm:text-[22px] font-normal focus:ring-blue-200 focus:outline-indigo-300 shadow-[2px_0px_2px_2px_rgba(0,0,0,0.2)]"
                  type={showPassword ? "text" : "password"} name="password" placeholder="Password" required/>
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
              <div className="flex items-center w-full -mt-6 ml-5">
                <input type="checkbox" id="Remember" className="mr-1 w-3 h-3 appearance-none border-2 cursor-pointer checked:bg-blue-950 rounded-full sm:w-5 sm:h-5" value="Rember me?"/>
                 <label htmlFor="Remember" className="text-black-nave font-light">Remember me</label>
              </div>
              <button type="submit" className="sm:mt-3 py-5 sm:py-4 w-full px-5 text-center text-md sm:text-[28px] items-center whitespace-nowrap font-medium bg-black-nave text-white-smoke 
              shadow-[2px_2px_2px_0px_rgba(0,0,0,0.2)] rounded-[10px]
              hover:bg-black/70 transition-transform duration-300 ease-in-out focus:scale-110
              ">Sign In</button>
            </form>
              <button type="submit" className="mt-5 py-2 sm:py-4 px-2 inline-flex text-md  sm:text-[28px] items-center justify-center bg-black-nave text-white-smoke w-full
              shadow-[2px_2px_2px_0px_rgba(0,0,0,0.2)] rounded-[10px]
              hover:bg-black/70 transition-transform duration-300 ease-in-out focus:scale-110
              "><Image className="mr-3" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={32} height={32}/>Sign in with Google</button>
              <p className="text-md sm:text-[18px] text-center mt-4 sm:mt-8"> Dont Have an account? <Link className="ml-1 font-bold text-blue-murder hover:underline underline-offset-2 
              cursor-pointer" href="./sign-up">Sign Up!</Link></p>
        </div>
        <Image className="hidden md:w-[700px] right-[100px] h-full  md:block absolute"  alt="Logo for  a ping pong" src="/images/logo-S.png" width={500} height={500}/>
      </div>
    </div>
  );
}
