"use client";
import { BoxLayout } from '@/components/BoxLayout'
import GameHistory from '@/components/GameHistory'
import React, { useRef } from "react";
import BarProgressionLevel  from '@/components/BarProgressionLevel'
import {ChartLineDefault} from '@/components/LineChart'
import { ChartBarDefault } from '@/components/TimeLineLogin'
import { useAuth } from '@/components/hooks/authProvider';
import { useSocketStore } from '@/components/hooks/SocketIOproviders';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

interface GameHistory {
  [key: string]: unknown;
}

interface FriendRequest {
  senderId: number;
  senderUsername: string;
}

export default function Home() {
  const user = useAuth.getState().user
  const router = useRouter();
  const [, setGamesHistory] = React.useState<GameHistory[]>([]);
  const [xpRefreshKey, setXpRefreshKey] = React.useState(0);
  const hasFetchedPendingRequests = useRef(false);

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

  const fetchPendingRequests = React.useCallback(async () => {
    // Prevent multiple fetches
    if (hasFetchedPendingRequests.current) return;
    hasFetchedPendingRequests.current = true;
    
    try {
      const res = await api.get("/friends/requests/pending");
      if (res.data?.requests && res.data.requests.length > 0) {
        // Get current state directly to avoid stale closure
        const currentNotifications = useSocketStore.getState().notifications;
        const addNotification = useSocketStore.getState().addNotification;
        
        // Add pending requests as notifications if they're not already there
        res.data.requests.forEach((request: FriendRequest) => {
          // Check if there's already a friend-request notification from this sender
          const exists = currentNotifications.some((n: unknown) => {
            const notif = n as { type?: string; from?: { id?: string | number } };
            return notif.type === "friend-request" && 
              (notif.from?.id === String(request.senderId) || notif.from?.id === request.senderId);
          });
          if (!exists) {
            addNotification({
              id: `friend-request-${request.senderId}`,
              type: "friend-request",
              message: `${request.senderUsername} sent you a friend request`,
              from: { id: String(request.senderId), username: request.senderUsername },
              time: new Date().toISOString(),
              read: false
            });
          }
        });
      }
    } catch (err) {
      console.error("Error fetching pending requests:", err);
      hasFetchedPendingRequests.current = false; // Allow retry on error
    }
  }, []);

  React.useEffect(() => {
    historyGames();
    // Fetch pending friend requests on page load
    fetchPendingRequests();
    // Mark attendance on page load
    api.post('/attendance/mark')
      .then(() => setXpRefreshKey((k) => k + 1))
      .catch(error => {
        console.error("Error marking attendance:", error);
      });
  }, [fetchPendingRequests]);
  return (
    <>
      <h1
        className="text-shadow-md sm:-mt-5 ml-10 text-2xl font-semibold
        bg-gradient-to-l from-white-smoke to-white-smoke/85
        text-transparent bg-clip-text z-1" 
      >
       {`Welcome ${user?.username}`}
      </h1>
      <div className="-mt-4 grid grid-cols-4 
        gap-5 w-full h-[calc(100%-232px)] p-5  auto-rows-min">
        <BoxLayout className="grid grid-cols-1 xl:grid-cols-3 row-span-10 gap-5 col-span-4">
          <BoxLayout className="card  h-full w-full col-span-1 bg-[url('/images/OneVSOne.png')] bg-no-repeat bg-center bg-cover hover:" >
            <button
              type="button"
              onClick={() => router.push('/Home/Games/OnlinePong')}
              className="w-full h-full flex items-center justify-center backdrop-blur-sm rounded-[35px] 
              transition-transform duration-300 ease-in-out focus:scale-110 cursor-pointer hover:scale-110 focus:outline-none"
            >
              <h1 className="text-white-smoke font-bold text-2xl md:text-5xl text-shadow-lg/30 hover:text-shadow-white-smoke/50" >Matchup</h1>
            </button>
          </BoxLayout>
          <BoxLayout className="card col-span-1 bg-[url('/images/Tournaments.png')]  bg-no-repeat bg-cover bg-center" >
          <button
            type="button"
            onClick={() => router.push('/Home/Games/Tournament')}
            className="w-full h-full flex items-center justify-center backdrop-blur-sm rounded-[35px] 
              transition-transform duration-300 ease-in-out focus:scale-110   cursor-pointer hover:scale-110 focus:outline-none"
          >
              <h1 className="text-white-smoke font-bold  text-2xl  md:text-5xl text-shadow-lg/30 hover:text-shadow-white-smoke/50" >Master Arena</h1>
            </button>
          </BoxLayout>
          <BoxLayout className="card col-span-1 bg-[url('/images/rockPaper.png')]  bg-no-repeat  bg-cover bg-center" >
            <button
              type="button"
              onClick={() => router.push('Home/Games/TicTacToe/online')}
              className="w-full h-full flex items-center justify-center backdrop-blur-sm rounded-[35px] 
                transition-transform duration-300 ease-in-out focus:scale-110  cursor-pointer hover:scale-110 focus:outline-none"
            >
                <h1 className="text-white-smoke font-bold text-2xl  md:text-5xl text-shadow-lg/30  hover:text-shadow-white-smoke/50" >TTT</h1>
              </button>
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
            <ChartLineDefault refreshKey={xpRefreshKey}/>
          </BoxLayout>
        </BoxLayout>
        <BoxLayout className="col-span-4 w-full  xl:-mt-60 xl:col-span-3">
          <div className="xl:-mt-5 flex flex-col w-full h-full p-0">
            <h1 className="text-white-smoke text-shadow-md ml-10 text-2xl font-semibold">
              Recent Games
            </h1>
            <div className="card w-full flex flex-col h-full overflow-y-auto">
              <GameHistory playerId={user?.id || 0} />
            </div>
          </div>
        </BoxLayout>
      </div>
    </>
  );
}
