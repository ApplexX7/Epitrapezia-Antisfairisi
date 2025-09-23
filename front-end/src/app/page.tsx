import Image from "next/image";
import Link from 'next/link';

export default function Intro() {
    return (
      <div className="h-screen bg-[url('/images/bg-image.png')] bg-cover bg-center flex justify-center items-center">
        <div className="h-250 w-300 b m-auto card rounded-[35px] flex flex-col items-center">
            <Image className="w-80 pt-20"  alt="Logo for  a ping pong" src="/images/logo.png" width={500} height={400}/>
            <h1 className="-mt-10 text-center block text-[48px] text-primary text-shadow-lg/30 font-semibold" >Welcome, champ.<br/>Let’s ping. Let’s pong.</h1>
            <p className="text-md font-medium text-shadow-sm text-h"> No paddles, no fun! Jump in—sign up or log in.</p>
            <Link href="/login"><button className="bg-black block px-48 py-6  text-white text-[32px] rounded-[25px] shadow-lg/30
             mt-10 mb-5 hover:text-white hover:bg-black/70 transition-transform duration-300 ease-in-out focus:scale-110">Login-in</button></Link>
            <Link href='/sign-up'> <button className="bg-black block px-48 py-6 text-white text-[32px] rounded-[25px] shadow-lg/30
             hover:text-white/90 hover:bg-black/70 transition-transform duration-300 ease-in-out focus:scale-110">Sign-up</button> </Link>
        </div>
      </div>
    );
}
