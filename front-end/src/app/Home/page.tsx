"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BoxLayout } from '@/components/BoxLayout'
import React from "react";
import BarProgressionLevel  from '@/components/BarProgressionLevel'
import {ChartLineDefault} from '@/components/LineChart'
import { ChartBarDefault } from '@/components/TimeLineLogin'


export default function Home() {
  return (
    <>
      <h1
        className="text-shadow-md -mt-10 ml-10 text-2xl font-semibold
        bg-gradient-to-l from-white-smoke to-white-smoke/85
        text-transparent bg-clip-text z-10" 
      >
        Welcome ApplexX7
      </h1>

      <div className="-mt-4 grid grid-cols-4 grid-rows-4
        gap-5 w-full h-[calc(100%-232px)] p-5 z-0">
        <BoxLayout className="grid gap-5 grid-cols-3 col-span-3 row-span-1">
          <BoxLayout className="card  h-full w-full col-span-1 bg-[url('/images/OneVSOne.png')] bg-no-repeat bg-center bg-cover hover:" >
            <div className="w-full h-full flex items-center justify-center backdrop-blur-sm rounded-[35px] 
              transition-transform duration-300 ease-in-out focus:scale-110 hover:scale-110">
              <h1 className="text-white-smoke font-bold text-5xl text-shadow-lg/30 hover:text-shadow-white-smoke/50" >Matchaup</h1>
            </div>
          </BoxLayout>
          <BoxLayout className="card col-span-1 bg-[url('/images/Tournaments.png')] bg-size-[500px] bg-no-repeat bg-center" >
          <div className="w-full h-full flex items-center justify-center backdrop-blur-sm rounded-[35px] 
              transition-transform duration-300 ease-in-out focus:scale-110 hover:scale-110">
              <h1 className="text-white-smoke font-bold text-5xl text-shadow-lg/30 hover:text-shadow-white-smoke/50" >Master Arena</h1>
            </div>
          </BoxLayout>
          <BoxLayout className="card col-span-1 bg-[url('/images/rockPaper.png')] bg-size-[500px] bg-no-repeat bg-center" >
            <div className="w-full h-full flex items-center justify-center backdrop-blur-sm rounded-[35px] 
                transition-transform duration-300 ease-in-out focus:scale-110 hover:scale-110">
                <h1 className="text-white-smoke font-bold text-5xl text-shadow-lg/30 hover:text-shadow-white-smoke/50" >TriStrike</h1>
              </div>
          </BoxLayout>
        </BoxLayout>
        <BoxLayout className="grid gap-5 col-span-1 row-span-auto" >
          <BoxLayout className="card h-fit row-span-auto px-5" >
            <BarProgressionLevel level={20} progression={60}/>
          </BoxLayout>
          <BoxLayout className="py-10 card h-fit row-span-auto" >
            <ChartLineDefault/>
          </BoxLayout>
        </BoxLayout>
        <BoxLayout className="card h-full col-span-3 row-span-2">
          <ChartBarDefault />
        </BoxLayout>
        <BoxLayout className="col-span-4 row-span-1">
          <div className="flex w-full flex-col h-full">
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
