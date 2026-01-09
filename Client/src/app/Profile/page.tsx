"use client"
import React from "react";
import { BoxLayout } from "@/components/BoxLayout";
import Playerinfo from "@/components/PlayerInfo";
import GameHistory from "@/components/GameHistory";
import { ChartRadarDefault } from '@/components/RadarGraph'
import { ChartAreaDefault } from '@/components/TimeWInGraph'
import { PingPong, CrownSimple , Star} from "@phosphor-icons/react/ssr";
import { useAuth } from '@/components/hooks/authProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';


export default function Profile() {
  const { user: currentUser } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const profileUsername = searchParams.get('user');
  const [profileUser, setProfileUser] = React.useState(currentUser);
  const [isOwnProfile, setIsOwnProfile] = React.useState(true);
  const [stats, setStats] = React.useState({ totalGames: 0, wins: 0, losses: 0, winRate: 0 });
  const pageTitle = isOwnProfile ? "My Account" : `${profileUser?.username || profileUsername || "Account"} Account`;

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (profileUsername && profileUsername !== currentUser?.username) {
        try {
          // Fetch other users profile
          const response = await api.get(`/user/${profileUsername}`);
          setProfileUser(response.data);
          setIsOwnProfile(false);
          
          // Fetch game stats
          try {
            const statsResponse = await api.get(`/stats/${response.data.id}`);
            const { total_games, wins, losses } = statsResponse.data;
            setStats({
              totalGames: total_games || 0,
              wins: wins || 0,
              losses: losses || 0,
              winRate: total_games > 0 ? parseFloat(((wins / total_games) * 100).toFixed(2)) : 0
            });
          } catch (err) {
            console.error("Error fetching stats:", err);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setProfileUser(currentUser);
          setIsOwnProfile(true);
      }
    } else {
      // Show current user's profile
      setProfileUser(currentUser);
      setIsOwnProfile(true);
      
        if (currentUser?.id) {
          try {
            const statsResponse = await api.get(`/stats/${currentUser.id}`);
            const { total_games, wins, losses } = statsResponse.data;
            setStats({
              totalGames: total_games || 0,
              wins: wins || 0,
              losses: losses || 0,
              winRate: total_games > 0 ? parseFloat(((wins / total_games) * 100).toFixed(2)) : 0
            });
          } catch (err) {
            console.error("Error fetching stats:", err);
          }
        }
      }
    };

    fetchProfile();
  }, [profileUsername, currentUser]);
    return (
      <div className="flex h-full w-full flex-col  scale-90">
        <div className="flex items-center justify-between pr-8">
          <h1 className="pl-20 text-shadow-md text-4xl -mb-6 font-semibold
            bg-gradient-to-r from-white-smoke to-white-smoke/60
            text-transparent bg-clip-text z-10">{pageTitle}</h1>
          <button
            onClick={() => router.push('/Home')}
            className="mr-4 px-4 py-2 rounded-[10px] text-sm font-semibold text-white
              bg-gradient-to-r from-white/25 via-white/10 to-transparent
              border border-white/20 backdrop-blur-md
              shadow-md shadow-black/20
              hover:scale-[1.02] hover:shadow-lg hover:shadow-black/25 hover:bg-white/30
              active:scale-[0.99] transition-transform transition-colors"
          >
            Back to Home
          </button>
        </div>
        <div className="grid grid-cols-4 gap-5 w-full h-full  auto-rows-min mt-[10px]">
          <BoxLayout className="w-full h-ful   card col-span-3 row-span-2">
            <Playerinfo user={profileUser ?? undefined}/>
          </BoxLayout>
          <BoxLayout className="grid  gap-5 col-span-1 grid-rows-8 row-span-8" >
            <BoxLayout className="card row-span-4 col-span-1">
              <ChartRadarDefault playerId={profileUser?.id || 0} />
            </BoxLayout>
            <BoxLayout className="card row-span-4  col-span-1 overflow-hidden">
              <GameHistory playerId={profileUser?.id || 0} />
            </BoxLayout>
          </BoxLayout>
          <BoxLayout className="grid grid-flow-col col-span-3 row-span-2 gap-5 ">
            <BoxLayout className="card col-span-1 h-full w-full">
              <div className="flex flex-col items-center justify-center h-full w-full">
                <div className="flex  items-center">
                  <PingPong size={94} color="#0D0C22" weight="fill"/>
                  <p className="font-bold text-3xl text-shadow-2xs" >{stats.totalGames}</p>
                </div>
                <p className="font-bold text-3xl text-shadow-lg" >Games Played</p>
              </div>
            </BoxLayout>
            <BoxLayout className="card col-span-1">
              <div className="flex flex-col items-center justify-center h-full w-full">
                <div className="flex  items-center">
                  <CrownSimple size={94} color="#0D0C22" weight="fill" />
                  <p className="font-bold text-3xl text-shadow-2xs" >{stats.wins}</p>
                </div>
                <p className="font-bold text-3xl text-shadow-lg" >Games Wins</p>
              </div>
            </BoxLayout>
            <BoxLayout className="card col-span-1">
              <div className="flex flex-col items-center justify-center h-full w-full">
                <div className="flex  items-center">
                 <Star size={94} color="#0D0C22" weight="fill" />
                <p className="font-bold text-3xl text-shadow-2xs" >{stats.winRate}%</p>
                </div>
              <p className="font-bold text-3xl text-shadow-lg" >Win Rate</p>
              </div>
            </BoxLayout>
          </BoxLayout>
          <BoxLayout className="card col-span-3  w-full h-full row-span-4">
            <ChartAreaDefault playerId={profileUser?.id || 0} />
          </BoxLayout>
        </div>
      </div>
    );
  }