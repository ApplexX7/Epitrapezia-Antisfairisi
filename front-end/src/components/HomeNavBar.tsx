
import "@/app/globals.css";
import Link from "next/link";
import Image from "next/image";
import { NavBar } from '@/components/Navbar'
import { MagnifyingGlass , Bell} from "@phosphor-icons/react/ssr";
import { CustomButton } from "@/components/CostumButton"
import {NavigationMenuDemo } from "@/components/profileBar"

export default function HomeNavBar (){
    return (
        <div className="-mt-5 flex justify-center items-center w-full  gap-5">
            <Image className="hidden ml-10 xl:block w-[180px] h-[200px]"  alt="Logo for  a ping pong" src="/images/logo-S.png" width={500} height={500}/>
            <div className="ml-10 xl:ml-0 w-full rounded-full h-[70px] mt-15 xl:mt-0">
                <NavBar />
            </div>
            <div className="flex gap-5 h-[70px] mt-15 xl:mt-0 mr-10">
                <CustomButton className="bg-white-smoke/30 w-[84px] h-full "><MagnifyingGlass size={48} color="#0d0c22" weight="bold"/> </CustomButton>
                <CustomButton className="bg-white-smoke/30 w-[84px] h-full "> <Bell size={48} color="#0d0c22" weight="bold" /> </CustomButton>
                <NavigationMenuDemo />
                {/* <Link href="/Profile">
                    <CustomButton
                        bgImage="/images/defaultAvatare.jpg"
                        className="bg-white-smoke/30 bg-cover bg-no-repeat bg-center w-[84px] h-full"
                        />
                </Link> */}
            </div>
        </div>
    );
}