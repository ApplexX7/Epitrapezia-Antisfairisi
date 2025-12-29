"use client"
import React from "react";
import { BoxLayout } from "@/components/BoxLayout";
import Playerinfo from "@/components/PlayerInfo";
import { ChartRadarDefault } from '@/components/RadarGraph'
import { ChartAreaDefault } from '@/components/TimeWInGraph'
import { PingPong, CrownSimple , Star} from "@phosphor-icons/react/ssr";
import { useAuth } from '@/components/hooks/authProvider';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/axios';


export default function Profile() {
  const { user: currentUser } = useAuth();
  const searchParams = useSearchParams();
  const profileUsername = searchParams.get('user');
  const [profileUser, setProfileUser] = React.useState(currentUser);
  const [isOwnProfile, setIsOwnProfile] = React.useState(true);

  React.useEffect(() => {
    if (profileUsername && profileUsername !== currentUser?.username) {
      // Fetch other user's profile
      api.get(`/user/${profileUsername}`)
        .then(response => {
          setProfileUser(response.data.user);
          setIsOwnProfile(false);
        })
        .catch(error => {
          console.error("Error fetching user profile:", error);
          // Fallback to current user
          setProfileUser(currentUser);
          setIsOwnProfile(true);
        });
    } else {
      // Show current user's profile
      setProfileUser(currentUser);
      setIsOwnProfile(true);
    }
  }, [profileUsername, currentUser]);
    return (
      <div className="flex h-full w-full flex-col py-10">
      <h1 className="pl-20 text-shadow-md text-4xl -mb-6 font-semibold
        bg-gradient-to-r from-white-smoke to-white-smoke/60
        text-transparent bg-clip-text z-10" >{isOwnProfile ? 'My Account' : `${profileUser?.username}'s Profile`}</h1>
      <div className="-mt-4 grid grid-cols-4 
        gap-5 w-full h-[calc(100%-232px)] p-5  auto-rows-min">
          <BoxLayout className="w-full h-ful   card col-span-3 row-span-2">
            <Playerinfo user={profileUser}/>
          </BoxLayout>
          <BoxLayout className="grid  gap-5 col-span-1 grid-rows-8 row-span-8" >
            <BoxLayout className="card row-span-4 col-span-1">
              <ChartRadarDefault/>
            </BoxLayout>
            <BoxLayout className="card row-span-4  col-span-1">
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