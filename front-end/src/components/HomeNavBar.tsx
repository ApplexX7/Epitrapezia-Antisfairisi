
import "@/app/globals.css";
import Image from "next/image";
import { NavBar } from '@/components/Navbar'
import { MagnifyingGlass , Bell} from "@phosphor-icons/react/ssr";
import { CustomButton } from "@/components/CostumButton"
import { NavigationMenuDemo } from "@/components/profileBar"
import { useState } from "react";
import Link from "next/link";

export default function HomeNavBar (){
    const [clicked, isClicked] = useState(false);
    const [search, isSearching] = useState(false);
    return (
        <div className="relative mt-10 min-[1400px]:-mt-5 min-[1400px]:mb-0 mb-10 flex justify-center items-center gap-5 w-full xl:px-10 px-5">
            <Image className="hidden ml-10 min-[1400px]:block w-[180px] h-[200px]"  alt="Logo for  a ping pong" src="/images/logo-S.png" width={500} height={500} priority/>
            <div className={`ml-10  lg:block hidden xl:ml-0 w-full rounded-full h-[70px]  xl:mt-0`}>
                {
                    search ? (

                        <NavBar />
                        ) : (
                            <div className={`ml-10  rounded-full h-[70px]`}>
                            <input  type="search"
                            placeholder="Search"
                            className="px-3 md:px-4 py-2 rounded-4xl focus:outline-none focus:ring-1
                            focus:ring-white border-none
                            bg-white-smoke/10 backdrop-blur-lg
                            brightness-150 text-md font-medium
                            w-full
                            sm:h-full
                            md:text-base"
                            autoFocus/>
                            </div>
                )
                }
            </div>
            <div className={`flex gap-5 h-[70px]  xl:mt-0 md:mr-10 items-center  justify-between w-full xl:w-150 xl:justify-center`}>
                <div className="relative">
                <button
                    className={`items-center lg:hidden   left-0 ml-5`}
                        onClick={() => isClicked(!clicked)}>
                    <>
                        {clicked ? (
                            <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-list-chevrons-up-down scale-90 
                            transition-transform duration-75 ease-in-out 
                            active:scale-110"
                            >
                            <path d="M3 5h8" />
                            <path d="M3 12h8" />
                            <path d="M3 19h8" />
                            <path d="m15 8 3-3 3 3" />
                            <path d="m15 16 3 3 3-3" />
                            </svg>
                        ) : (
                            <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-list-chevrons-down-up 
                            scale-90 transition-transform duration-75 ease-in-out
                            active:scale-110"
                            >
                            <path d="M3 5h8" />
                            <path d="M3 12h8" />
                            <path d="M3 19h8" />
                            <path d="m15 5 3 3 3-3" />
                            <path d="m15 19 3-3 3 3" />
                            </svg>
                        )}
                    </>
                </button>
                    <div
                        className={`absolute left-0 z-10
                        transition-all duration-200 ease-in-out
                        cursor-pointer
                        ${clicked ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
                        bg-white-smoke/40 w-[250px] h-[200px] backdrop-blur-2xl
                        rounded-lg flex flex-col items-center justify-around gap-2 
                        backdrop-blur-0 bg-opacity-100 `}
                        onClick={() => isClicked(!clicked)}>
                        <Link href="/Home" className="active:bg-blue-purple font-medium hover:bg-blue-purple flex h-full items-center justify-center rounded-t-lg w-full py-2 hover:text-white">Home</Link>
                        <Link href="/Home/Chat" className="active:bg-blue-purple font-medium hover:bg-blue-purple flex h-full items-center justify-center w-full py-2 hover:text-white">Chat</Link>
                        <Link href="/Home/Settings" className="active:bg-blue-purple font-medium hover:bg-blue-purple flex h-full items-center justify-center w-full py-2 hover:text-white">Settings</Link>
                        <Link href="/Home/Games" className="active:bg-blue-purple hover:bg-blue-purple font-medium flex h-full items-center rounded-b-lg justify-center w-full py-2 hover:text-white">Games</Link>
                    </div>
                </div>
                <div className={`ml-10  ${search ? "hidden" : "lg:hidden"} lg:hidden rounded-full h-[70px]`}>
                            <input  type="search"
                            placeholder="Search"
                            className="px-3 md:px-4 py-2 rounded-4xl focus:outline-none focus:ring-1
                            focus:ring-white border-none
                            bg-white-smoke/10 backdrop-blur-lg
                            brightness-150 text-md font-medium
                            w-full
                            sm:h-full
                            md:text-base"
                            autoFocus/>
                            </div>
                <div className={`flex items-center  h-full gap-4`}>
                <CustomButton onClick={() => isSearching(!search)}
                     className={`bg-white-smoke/30  w-[48px] 
                     h-[48px] sm:w-[84px] sm:h-full transition-all duration-300 ease-in-out`}>
                    <MagnifyingGlass size={36} color="#0d0c22" weight="bold"/>
                </CustomButton>
                <CustomButton
                    className="bg-white-smoke/30 w-[48px] h-[48px] sm:w-[84px] sm:h-full "> 
                    <Bell size={36} color="#0d0c22" weight="bold" /> 
                </CustomButton>
                <NavigationMenuDemo />
                </div>
                
            </div>
        </div>
    );
}