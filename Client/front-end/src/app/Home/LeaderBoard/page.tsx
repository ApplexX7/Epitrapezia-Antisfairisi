"use client"
import { useAuth } from '@/components/hooks/authProvider';
import api from '@/lib/axios';
import { getAvatarUrl } from '@/lib/utils';
import Image from 'next/image'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type LeaderboardEntry = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  level: number;
  experience: number;
  total_games: number;
  wins: number;
  losses: number;
};

export default function Leaderboard() {
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useAuth.getState().user;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get('/stats/leaderboard');
        setPlayers(data.players ?? []);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        toast.error('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="h-[calc(100%-232px)] flex gap-10 flex-col items-center justify-start pt-6 px-10">
      <div className="w-full max-w-4xl h-full card bg-white/10 backdrop-blur-xl border border-white/25 ring-1 ring-white/20 shadow-2xl p-6 relative flex flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent" />

        <div className="relative flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-white-smoke">Top Players</h2>
          <span className="text-sm text-white-smoke/70">Level → Experience (only after a match)</span>
        </div>

        <div className="relative flex-1 overflow-y-auto scrollbar-hide">
          {loading ? (
            <div className="text-center text-white-smoke/70 py-12">Loading leaderboard…</div>
          ) : players.length === 0 ? (
            <div className="text-center text-white-smoke/70 py-12">Season has not begun yet. Play the first match to kick things off.</div>
          ) : (
            <ul className="divide-y divide-white/10">
              {players.map((player, idx) => {
                const isCurrentUser = currentUser?.id === player.id;
                return (
                <Link key={player.id} href={`/Profile?user=${player.username}`}>
                  <li className={`py-3 px-2 flex items-center justify-between transition rounded-2xl mb-2 cursor-pointer ${
                    isCurrentUser 
                      ? 'bg-gradient-to-r from-purple-500/40  to-amber-500/40 border-2 border-amber-300/60 shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:shadow-[0_0_30px_rgba(251,191,36,0.6)]'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-8 text-center text-lg font-semibold drop-shadow ${
                      isCurrentUser 
                        ? 'text-amber-300' 
                        : 'text-amber-200'
                    }`}>#{idx + 1}</span>
                    <div className={`relative ${isCurrentUser ? 'ring-2 ring-amber-300 rounded-full' : ''}`}>
                      <Image
                        src={getAvatarUrl(player.avatar)}
                        alt={player.username}
                        width={48}
                        height={48}
                        className="rounded-full border border-white/30"
                      />
                    </div>
                    <div>
                      <div className={`font-semibold drop-shadow-sm ${
                        isCurrentUser 
                          ? 'text-amber-200 text-lg' 
                          : 'text-white-smoke'
                      }`}>
                        {isCurrentUser ? 'Me' : player.username}
                      </div>
                      <div className="text-sm text-white-smoke/70">{player.firstName} {player.lastName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-white-smoke/80">
                    <div className="flex flex-col items-end">
                      <span className={`font-semibold ${isCurrentUser ? 'text-amber-200' : ''}`}>Level {player.level}</span>
                      <span className="text-xs text-white-smoke/60">XP {player.experience}</span>
                    </div>
                    <div className="flex flex-col items-end text-white-smoke/60">
                      <span>{player.total_games} games</span>
                      <span>W {player.wins} · L {player.losses}</span>
                    </div>
                  </div>
                </li>
              </Link>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}