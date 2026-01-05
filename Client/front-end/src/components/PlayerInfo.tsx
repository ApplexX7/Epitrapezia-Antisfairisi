import { Progress } from '@/components/animate-ui/components/radix/progress';
import {InstagramLogo, GithubLogo } from "@phosphor-icons/react/ssr";
import Image from "next/image";
import { User } from '@/components/hooks/authProvider';
import { getAvatarUrl } from '@/lib/utils';
import { useState } from 'react';


export type UserInfo = {
  level: number;
  progression: number;
};


export default function Playerinfo({ user }: { user?: User }){
  const [avatarError, setAvatarError] = useState(false);
  
  return (
    <div className="flex px-10 gap-1 items-center w-full h-full rouded-[35px]">
      <div className="py-5 flex flex-col items-center justify-center h-full w-[250px]">
        <Image
          src={avatarError ? "/images/defaultAvatare.jpg" : getAvatarUrl(user?.avatar)}
          alt="Profile image player"
          width={180}
          height={180}
          className="rounded-full object-cover"
          quality={100}
          priority
          unoptimized
          key={user?.avatar}
          onError={() => setAvatarError(true)}
        />
        <p className="text-black font-medium text-wrap text-center ">
          {user?.bio || "The ball is always in your court, make every shot count."}
        </p>
      </div>
      <div className="flex -mt-10 mb-0 flex-col w-180 h-full justify-center flex-1">
        <div className="flex flex-row gap-1 pb-5">
          <div>
            <h1 className="text-4xl text-black-nave font-medium text-shadow-lg/20">{`${user?.username}`}</h1>
            <p className="pl-2 text-[12px]">{`${user?.dateJoined ? user?.dateJoined : "Joined April 2022"}`}</p>
          </div>
        </div>
        <p className="self-end font-bold mr-8 text-md">{`${user?.experience ? `${user.experience % 100}/100` : "0/100"}`}</p>
        <div className="relative">
          <Progress className="h-15 inset-shadow-sm w-full" value={user?.progression || 0} />
          <h1 className="text-2xl font-bold absolute  self-center 
            bg-gradient-to-r from-[#0D0C22] to-[#762675]
            text-transparent bg-clip-text inset-0 
            text-shadow-2xs text-center top-1/4">
            {`Level: ${user?.level || 1}`}
          </h1>
        </div>
      </div>
      <div className="self-start gap-2 mt-5 flex">
        {user?.github && (
          <a 
            href={user.github} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:opacity-75 transition-opacity cursor-pointer"
          >
            <GithubLogo size={32} weight="bold" />
          </a>
        )}
        {user?.instagram && (
          <a 
            href={user.instagram} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:opacity-75 transition-opacity cursor-pointer"
          >
            <InstagramLogo size={36} weight="bold" />
          </a>
        )}
      </div>
    </div>
  )
}