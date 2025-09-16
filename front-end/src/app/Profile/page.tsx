import React from "react";
import { BoxLayout } from "@/components/BoxLayout";
import Playerinfo from "@/components/PlayerInfo";
import { ChartRadarDefault } from '@/components/RadarGraph'
import { ChartAreaDefault } from '@/components/TimeWInGraph'
import { PingPong, CrownSimple , Star} from "@phosphor-icons/react/ssr";


export default function Profile() {
    return (
      <div className="flex h-full w-full flex-col py-10">
      <h1 className="pl-20 text-shadow-md text-4xl -mb-6 font-semibold
        bg-gradient-to-r from-white-smoke to-white-smoke/60
        text-transparent bg-clip-text z-10" >My Account</h1>
        <div className="grid py-5 px-10 grid-cols-5 grid-rows-8 gap-5 w-full h-full max-w-480">
          <BoxLayout className="w-full h-ful   card col-span-3 row-span-2">
            <Playerinfo />
          </BoxLayout>
          <BoxLayout className="grid  gap-5 col-span-2 grid-rows-8 row-span-8" >
            <BoxLayout className="card row-span-4 col-span-2">
              <ChartRadarDefault/>
            </BoxLayout>
            <BoxLayout className="card row-span-4  col-span-2">
            </BoxLayout>
          </BoxLayout>
          <BoxLayout className="grid grid-flow-col col-span-3 row-span-2 gap-5 ">
            <BoxLayout className="card col-span-1 h-full w-full">
              <div className="flex flex-col items-center justify-center h-full w-full">
                <div className="flex  items-center">
                  <PingPong size={94} color="#0D0C22" weight="fill"/>
                  <p className="font-bold text-3xl text-shadow-2xs" >158</p>
                </div>
                <p className="font-bold text-3xl text-shadow-lg" >Games Played</p>
              </div>
            </BoxLayout>
            <BoxLayout className="card col-span-1">
              <div className="flex flex-col items-center justify-center h-full w-full">
                <div className="flex  items-center">
                  <CrownSimple size={94} color="#0D0C22" weight="fill" />
                  <p className="font-bold text-3xl text-shadow-2xs" >158</p>
                </div>
                <p className="font-bold text-3xl text-shadow-lg" >Games Wins</p>
              </div>
            </BoxLayout>
            <BoxLayout className="card col-span-1">
              <div className="flex flex-col items-center justify-center h-full w-full">
                <div className="flex  items-center">
                 <Star size={94} color="#0D0C22" weight="fill" />
                <p className="font-bold text-3xl text-shadow-2xs" >64.53%</p>
                </div>
              <p className="font-bold text-3xl text-shadow-lg" >Win Rate</p>
              </div>
            </BoxLayout>
          </BoxLayout>
          <BoxLayout className="card col-span-3  w-full h-full row-span-4">
            <ChartAreaDefault />
          </BoxLayout>
        </div>
      </div>
    );
  }