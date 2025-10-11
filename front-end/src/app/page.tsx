"use client"
import Image from "next/image";
import Link from 'next/link';

export default function Intro() {
    return (
      <div className="h-screen w-screen  bg-[url('/images/bg-image.png')] bg-cover bg-center flex justify-center items-center">
        <div className="h-full w-full md:h-[950px] md:w-[1400px]
          md:ml-10 md:mr-10 bg-white/5 border-white backdrop-blur-lg ring-1
          ring-amber-50/20 backdrop-brightness-[150%] rounded-[35px] 
          shadow-[10px_10px_10px_10px_rgba(0,0,0,0.3)] 
          flex flex-col  justify-center items-center px-">
            <Image className="w-80 "  alt="Logo for  a ping pong" src="/images/logo.png" width={500} height={400} priority/>
            <h1 className="-mt-10 text-center block text-[32px] sm:text-[48px] text-white-smoke/80 
            text-shadow-lg/30 font-semibold" >Welcome, champ.<br/>Let’s ping. Let’s pong.</h1>
            <p className="text-md font-medium text-shadow-sm text-white-smoke/50  text-h"> No paddles, no fun! Jump in—sign up or log in.</p>
              <Link href="/login">
                <button className="w-100
                sm:w-full
                mt-5
                py-5
                text-[24px]
                block sm:px-48 sm:py-6
               text-black sm:text-[32px] rounded-[25px] shadow-lg/30
               bg-red-purple/80
               font-medium self-center text-nowrap
               hover:text-white/90 hover:bg-orange-400/50 transition-transform 
                duration-300 ease-in-out focus:scale-110 mb-5">
                  Login-in
                  </button>
              </Link>
            <Link href='/sign-up'>
              <button className="
                sm:w-full
                w-100
                mt-5
                py-5
                text-[24px]
                block sm:px-48 sm:py-6
               text-black sm:text-[32px] rounded-[25px] shadow-lg/30
               bg-red-purple/80
               font-medium
               hover:text-white/90 hover:bg-orange-400/50 transition-transform 
                duration-300 ease-in-out focus:scale-110">
              Sign-up
             </button>
             </Link>
        </div>
      </div>
    );
}
