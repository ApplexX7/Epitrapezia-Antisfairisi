"use client";
import { BoxLayout } from '@/components/BoxLayout'
import React from "react";
import BarProgressionLevel  from '@/components/BarProgressionLevel'
import {ChartLineDefault} from '@/components/LineChart'
import { ChartBarDefault } from '@/components/TimeLineLogin'
import { useAuth } from '@/components/hooks/authProvider';


export default function Home() {
  const user = useAuth.getState().user
  return (
    <>
      <h1
        className="text-shadow-md sm:-mt-10 ml-10 text-2xl font-semibold
        bg-gradient-to-l from-white-smoke to-white-smoke/85
        text-transparent bg-clip-text z-1" 
      >
       {`Welcome ${user?.username}`}
      </h1>
      <div className="-mt-4 grid grid-cols-4 
        gap-5 w-full h-[calc(100%-232px)] p-5  auto-rows-min">
        <BoxLayout className="grid grid-cols-1 md:grid-cols-3 row-span-10 gap-5 col-span-4">
          <BoxLayout className="card  h-full w-full col-span-1 bg-[url('/images/OneVSOne.png')] bg-no-repeat bg-center bg-cover hover:" >
            <div className="w-full h-full flex items-center justify-center backdrop-blur-sm rounded-[35px] 
              transition-transform duration-300 ease-in-out focus:scale-110 cursor-pointer hover:scale-110">
              <h1 className="text-white-smoke font-bold text-5xl text-shadow-lg/30 hover:text-shadow-white-smoke/50" >Matchup</h1>
            </div>
          </BoxLayout>
          <BoxLayout className="card col-span-1 bg-[url('/images/Tournaments.png')] bg-size-[500px] bg-no-repeat bg-center" >
          <div className="w-full h-full flex items-center justify-center backdrop-blur-sm rounded-[35px] 
              transition-transform duration-300 ease-in-out focus:scale-110   cursor-pointer hover:scale-110">
              <h1 className="text-white-smoke font-bold text-5xl text-shadow-lg/30 hover:text-shadow-white-smoke/50" >Master Arena</h1>
            </div>
          </BoxLayout>
          <BoxLayout className="card col-span-1 bg-[url('/images/rockPaper.png')] bg-size-[500px] bg-no-repeat bg-center" >
            <div className="w-full h-full flex items-center justify-center backdrop-blur-sm rounded-[35px] 
                transition-transform duration-300 ease-in-out focus:scale-110  cursor-pointer hover:scale-110">
                <h1 className="text-white-smoke font-bold text-5xl text-shadow-lg/30  hover:text-shadow-white-smoke/50" >TriStrike</h1>
              </div>
          </BoxLayout>
        </BoxLayout>
        <BoxLayout className="card col-span-4  md:col-span-3 h-fit py-20">
          <ChartBarDefault />
        </BoxLayout>
        <BoxLayout className="col-span-4 md:col-span-1 grid gap-5" >
          <BoxLayout className="card px-5 h-fit" >
            <BarProgressionLevel level={20} progression={60}/>
          </BoxLayout>
          <BoxLayout className="py-18 card h-full xl:row-span-auto" >
            <ChartLineDefault/>
          </BoxLayout>
        </BoxLayout>
        <BoxLayout className="col-span-3  w-full h-50 xl:-mt-50">
          <div className="flex flex-col w-full h-full p-0">
            <h1 className="text-white-smoke text-shadow-md 
            ml-10 text-2xl font-semibold">
              Recent Games
            </h1>
            <div className="card w-full h-full flex">
            </div>
          </div>
        </BoxLayout>
      </div>
    </>
  );
}
