"use client";
import { BoxLayout } from '@/components/BoxLayout'
import GameHistory from '@/components/GameHistory'
import PendingFriendRequests from '@/components/PendingFriendRequests'
import React from "react";
import BarProgressionLevel  from '@/components/BarProgressionLevel'
import {ChartLineDefault} from '@/components/LineChart'
import { ChartBarDefault } from '@/components/TimeLineLogin'
import { useAuth } from '@/components/hooks/authProvider';
import api from '@/lib/axios';


export default function Home() {
  const user = useAuth.getState().user
  const [gamesHistory, setGamesHistory] = React.useState<any[]>([]);
  const historyGames = async () => {
    try {
      const response = await api.get('/historygames');
      setGamesHistory(response.data.games);
      return response.data.games;
    } catch (error) {
      console.error("Error fetching game history:", error);
      return [];
    }
  };

  React.useEffect(() => {
    historyGames();
    // Mark attendance on page load
    api.post('/attendance/mark').catch(error => {
      console.error("Error marking attendance:", error);
    });
  }, []);
  return (
    <>
      <h1
        className="text-shadow-md sm:-mt-5 ml-10 text-2xl font-semibold
        bg-gradient-to-l from-white-smoke to-white-smoke/85
        text-transparent bg-clip-text z-1" 
      >
       {`Welcome ${user?.username}`}
      </h1>
      <div className="p-5 w-full">
        <PendingFriendRequests />
      </div>
      <div className="-mt-4 grid grid-cols-4 
        gap-5 w-full h-[calc(100%-232px)] p-5  auto-rows-min">
        <BoxLayout className="grid grid-cols-1 xl:grid-cols-3 row-span-10 gap-5 col-span-4">
          <BoxLayout className="card  h-full w-full col-span-1 bg-[url('/images/OneVSOne.png')] bg-no-repeat bg-center bg-cover hover:" >
            <div className="w-full h-full flex items-center justify-center backdrop-blur-sm rounded-[35px] 
              transition-transform duration-300 ease-in-out focus:scale-110 cursor-pointer hover:scale-110">
              <h1 className="text-white-smoke font-bold text-2xl md:text-5xl text-shadow-lg/30 hover:text-shadow-white-smoke/50" >Matchup</h1>
            </div>
          </BoxLayout>
          <BoxLayout className="card col-span-1 bg-[url('/images/Tournaments.png')]  bg-no-repeat bg-cover bg-center" >
          <div className="w-full h-full flex items-center justify-center backdrop-blur-sm rounded-[35px] 
              transition-transform duration-300 ease-in-out focus:scale-110   cursor-pointer hover:scale-110">
              <h1 className="text-white-smoke font-bold  text-2xl  md:text-5xl text-shadow-lg/30 hover:text-shadow-white-smoke/50" >Master Arena</h1>
            </div>
          </BoxLayout>
          <BoxLayout className="card col-span-1 bg-[url('/images/rockPaper.png')]  bg-no-repeat  bg-cover bg-center" >
            <div className="w-full h-full flex items-center justify-center backdrop-blur-sm rounded-[35px] 
                transition-transform duration-300 ease-in-out focus:scale-110  cursor-pointer hover:scale-110">
                <h1 className="text-white-smoke font-bold text-2xl  md:text-5xl text-shadow-lg/30  hover:text-shadow-white-smoke/50" >TriStrike</h1>
              </div>
          </BoxLayout>
        </BoxLayout>
        <BoxLayout className="card col-span-4  xl:col-span-3 h-fit py-20">
          <ChartBarDefault />
        </BoxLayout>
        <BoxLayout className="col-span-4 xl:col-span-1 grid gap-5" >
          <BoxLayout className="card px-5 h-fit" >
            <BarProgressionLevel level={user?.level || 1} progression={user?.progression || 0}/>
          </BoxLayout>
          <BoxLayout className="py-18 card h-full xl:row-span-auto" >
            <ChartLineDefault/>
          </BoxLayout>
        </BoxLayout>
        <BoxLayout className="col-span-4 w-full xl:-mt-60 xl:col-span-3">
          <div className="flex flex-col w-full h-full p-0">
            <h1 className="text-white-smoke text-shadow-md ml-10 text-2xl font-semibold">
              Recent Games
            </h1>
            <div className="card w-full h-56 flex flex-col overflow-y-auto">
              <GameHistory playerId={user?.id || 0} />
            </div>
          </div>
        </BoxLayout>
      </div>
    </>
  );
}
