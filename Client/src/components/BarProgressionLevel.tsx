import React from "react";
import { Progress } from '@/components/animate-ui/components/radix/progress';
import { CustomButton } from './CostumButton'
import { useRouter } from 'next/navigation';

export type UserInfo = {
  level: number;
  progression: number;
};


export default function BarProgressionLevel({ level, progression }: UserInfo) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-5 w-full pb-15 ">
        <h1 className="pt-15 text-shadow-xs ml-3 font-semibold 
        self-start text-2xl">
            Formation status :
            </h1>
        <div className="">
            <h2 className="ml-5  pt-5 font-medium 
            self-start text-xl text-shadow-sm" >
                Level: {level}
                </h2>
            <Progress className="h-15  w-full" value={progression} />
        </div>
        <CustomButton 
            onClick={() => router.push('/Home/LeaderBoard')}
            className="self-center font-medium 
        shadow-none text-xl bg-[#D9D9D9]/5 h-15 w-70 
        transition-transform duration-300 ease-in-out active:scale-110">
            See more
        </CustomButton>
    </div>
  );
}
