import { Progress } from '@/components/animate-ui/components/radix/progress';
import {InstagramLogo, GithubLogo } from "@phosphor-icons/react/ssr";
import Image from "next/image";
import { useAuth } from '@/components/hooks/authProvider';


export type UserInfo = {
  level: number;
  progression: number;
};


export default function Playerinfo(){
  const user = useAuth.getState().user;
  return (
    <div className="flex px-10 gap-1 items-center w-full h-full rouded-[35px]">
      <div className="py-5 flex flex-col items-center justify-center h-full w-[250px]">
        <Image
          src={user?.avatar ?? "/images/defaultAvatare.jpg"}
          alt="Profile image player"
          width={180}
          height={180}
          className="rounded-full object-cover"
          quality={100}
          priority
        />
        <p className="text-black font-medium text-wrap text-center ">
          {`${user?.des ?
          "The ball is always in your court,make every shot count."
          :
          "The ball is always in your court,make every shot count."}` }
        </p>
      </div>
      <div className="flex -mt-10 mb-0 flex-col w-180 h-full justify-center ">
        <div className="flex flex-row gap-1 pb-5">
          <div>
            <h1 className="text-4xl text-black-nave font-medium text-shadow-lg/20">{`${user?.username}`}</h1>
            <p className="pl-2 text-[12px]">{`${user?.dateJoined ? user?.dateJoined : "Joined April 2022"}`}</p>
          </div>
        </div>
        <p className="self-end font-bold mr-8 text-md">{`${user?.exp ? "2000/3000" : "1900/3000"}`}</p>
        <div className="relative">
          <Progress className="h-15 inset-shadow-sm w-full" value={20} />
          <h1 className="text-2xl font-bold absolute  self-center 
            bg-gradient-to-r from-[#0D0C22] to-[#762675]
            text-transparent bg-clip-text inset-0 
            text-shadow-2xs text-center top-1/4">
            {`Level: ${user?.exp ? 20 : 9}`}
          </h1>
        </div>
      </div>
      <div className=" self-start gap-2 mt-10 flex">
        <GithubLogo size={32} weight="bold" />
        <InstagramLogo size={36} weight="bold" />
      </div>
    </div>
  )
}