"use client"
import Image from "next/image";
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="h-screen w-screen bg-[url('/images/bg-image.png')] bg-cover bg-center flex justify-center items-center">
      <div className="h-full w-full md:h-[950px] md:w-[1400px]
        md:ml-10 md:mr-10 bg-white/5 border-white backdrop-blur-lg ring-1
        ring-amber-50/20 backdrop-brightness-[150%] rounded-[35px] 
        shadow-[10px_10px_10px_10px_rgba(0,0,0,0.3)] 
        flex flex-col justify-center items-center px-8">
        
        <div className="flex flex-col items-center justify-center space-y-6">
          <Image 
            className="w-60 opacity-80" 
            alt="Logo for a ping pong" 
            src="/images/logo.png" 
            width={400} 
            height={320} 
            priority
          />
          
          <div className="text-center space-y-4">
            <h1 className="text-[120px] sm:text-[180px] font-bold text-red-purple/80 
              text-shadow-lg leading-none">
              404
            </h1>
            
            <h2 className="text-[32px] sm:text-[48px] text-white-smoke/90 
              text-shadow-lg/30 font-semibold">
              Oops! Ball Out of Bounds
            </h2>
            
            <p className="text-lg sm:text-xl font-medium text-shadow-sm text-white-smoke/60 max-w-md mx-auto">
              The page you're looking for seems to have bounced out of the game. 
              Let's get you back on the court!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link href="/Home">
              <button className="px-12 py-5 text-[20px] sm:text-[24px] 
                rounded-[25px] shadow-lg/30 bg-red-purple/80 
                font-medium text-black
                hover:text-white/90 hover:bg-orange-400/50 
                transition-transform duration-300 ease-in-out 
                hover:scale-110 focus:scale-110">
                Go to Home
              </button>
            </Link>
            
            <Link href="/login">
              <button className="px-12 py-5 text-[20px] sm:text-[24px] 
                rounded-[25px] shadow-lg/30 
                bg-white/10 backdrop-blur-sm
                font-medium text-white-smoke/90
                hover:bg-white/20 hover:text-white
                transition-transform duration-300 ease-in-out 
                hover:scale-110 focus:scale-110
                ring-1 ring-white-smoke/30">
                Back to Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
