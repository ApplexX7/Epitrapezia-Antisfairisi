"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import Link from "next/link";
import Image from "next/image";
import { getAvatarUrl } from "@/lib/utils";
import { Trophy, Medal, ArrowLeft } from "@phosphor-icons/react/ssr";

type TournamentHistoryItem = {
  id: number;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  first_place_id: number | null;
  second_place_id: number | null;
  third_place_id: number | null;
  fourth_place_id: number | null;
  player_placement: number | null;
  players: Record<number, { username: string; avatar?: string }>;
};

export default function TournamentHistory() {
  const [tournaments, setTournaments] = useState<TournamentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/tournaments/history/me");
        setTournaments(res.data?.tournaments || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching tournament history:", err);
        setError("Failed to load tournament history");
        setTournaments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPlacementBadge = (placement: number | null) => {
    switch (placement) {
      case 1:
        return (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/30 text-yellow-300 text-xs font-semibold">
            <Trophy size={14} weight="fill" />
            <span>1st Place</span>
          </div>
        );
      case 2:
        return (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-400/30 text-gray-300 text-xs font-semibold">
            <Medal size={14} weight="fill" />
            <span>2nd Place</span>
          </div>
        );
      case 3:
        return (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/30 text-orange-300 text-xs font-semibold">
            <Medal size={14} weight="fill" />
            <span>3rd Place</span>
          </div>
        );
      case 4:
        return (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/30 text-blue-300 text-xs font-semibold">
            <span>4th Place</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getPlayerInfo = (tournament: TournamentHistoryItem, playerId: number | null) => {
    if (!playerId) return null;
    return tournament.players[playerId] || null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        <p className="text-gray-400">Loading tournament history...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen p-6 gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/Home/Games/Tournament"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-white">Tournament History</h1>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && tournaments.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 gap-4">
          <Trophy size={64} className="text-gray-500" />
          <p className="text-gray-400 text-lg">No completed tournaments yet</p>
          <Link
            href="/Home/Games/Tournament"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
          >
            Join a Tournament
          </Link>
        </div>
      )}

      {/* Tournament List */}
      <div className="flex flex-col gap-4 overflow-y-auto">
        {tournaments.map((tournament) => {
          const winner = getPlayerInfo(tournament, tournament.first_place_id);
          const runnerUp = getPlayerInfo(tournament, tournament.second_place_id);
          const third = getPlayerInfo(tournament, tournament.third_place_id);
          const fourth = getPlayerInfo(tournament, tournament.fourth_place_id);

          return (
            <div
              key={tournament.id}
              className="bg-gradient-to-r from-purple-900/30 to-purple-800/10 rounded-xl p-5 border border-purple-500/20 hover:border-purple-500/40 transition-all"
            >
              {/* Tournament Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">{tournament.name}</h2>
                  <p className="text-sm text-gray-400">
                    Completed: {formatDate(tournament.completed_at)}
                  </p>
                </div>
                {getPlacementBadge(tournament.player_placement)}
              </div>

              {/* Podium */}
              <div className="flex items-end justify-center gap-3 mt-4">
                {/* 2nd Place */}
                <div className="flex flex-col items-center">
                  {runnerUp && (
                    <>
                      <Image
                        src={getAvatarUrl(runnerUp.avatar)}
                        alt={runnerUp.username}
                        width={40}
                        height={40}
                        className="rounded-full object-cover border-2 border-gray-400"
                      />
                      <p className="text-xs text-gray-300 mt-1 truncate max-w-[60px]">
                        {runnerUp.username}
                      </p>
                    </>
                  )}
                  <div className="w-16 h-12 bg-gray-600/50 rounded-t-lg flex items-center justify-center mt-1">
                    <span className="text-gray-300 font-bold">2</span>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center">
                  {winner && (
                    <>
                      <Trophy size={20} className="text-yellow-400 mb-1" weight="fill" />
                      <Image
                        src={getAvatarUrl(winner.avatar)}
                        alt={winner.username}
                        width={48}
                        height={48}
                        className="rounded-full object-cover border-2 border-yellow-400"
                      />
                      <p className="text-xs text-yellow-300 mt-1 truncate max-w-[70px] font-semibold">
                        {winner.username}
                      </p>
                    </>
                  )}
                  <div className="w-16 h-16 bg-yellow-600/50 rounded-t-lg flex items-center justify-center mt-1">
                    <span className="text-yellow-300 font-bold">1</span>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center">
                  {third && (
                    <>
                      <Image
                        src={getAvatarUrl(third.avatar)}
                        alt={third.username}
                        width={36}
                        height={36}
                        className="rounded-full object-cover border-2 border-orange-400"
                      />
                      <p className="text-xs text-gray-300 mt-1 truncate max-w-[55px]">
                        {third.username}
                      </p>
                    </>
                  )}
                  <div className="w-16 h-8 bg-orange-600/50 rounded-t-lg flex items-center justify-center mt-1">
                    <span className="text-orange-300 font-bold">3</span>
                  </div>
                </div>
              </div>

              {/* 4th Place */}
              {fourth && (
                <div className="flex items-center justify-center mt-3 gap-2 text-gray-400 text-sm">
                  <span>4th:</span>
                  <Image
                    src={getAvatarUrl(fourth.avatar)}
                    alt={fourth.username}
                    width={24}
                    height={24}
                    className="rounded-full object-cover"
                  />
                  <span>{fourth.username}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
