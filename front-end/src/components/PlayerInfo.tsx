import BarProgressionLevel  from '@/components/BarProgressionLevel'
import { Progress } from '@/components/animate-ui/components/radix/progress';
import {InstagramLogo, GithubLogo } from "@phosphor-icons/react/ssr";
import Image from "next/image";


export type UserInfo = {
  level: number;
  progression: number;
};


export default function Playerinfo(){
  return (
    <div className="flex px-10 gap-1 items-center w-full h-full rouded-[35px]">
      <div className="py-5 flex flex-col items-center justify-center h-full w-[250px]">
        <Image src="/images/defaultAvatare.jpg" 
        className="rounded-full w-[200px] " width={500} 
        height={500} alt=" Profile image player"/>
        <p className="text-black font-medium text-wrap text-center ">
          The ball is always in your court,
          make every shot count.
        </p>
      </div>
      <div className="flex -mt-10 mb-0 flex-col w-180 h-full justify-center ">
        <div className="flex flex-row gap-1 pb-5">
          <div>
            <h1 className="text-4xl text-black-nave font-medium text-shadow-lg/20">ApplexX</h1>
            <p className="pl-2 text-[12px]">Joined April 2022</p>
          </div>
        </div>
        <p className="self-end font-bold mr-8 text-md">2900/3000</p>
        <div className="relative">
          <Progress className="h-15 inset-shadow-sm w-full" value={50} />
          <h1 className="text-2xl font-bold absolute  self-center 
            bg-gradient-to-r from-[#0D0C22] to-[#762675]
            text-transparent bg-clip-text inset-0 
            text-shadow-2xs text-center top-1/4">
            Level: 20
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