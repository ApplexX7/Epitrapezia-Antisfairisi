"use client";

import React from "react";
import { User } from "@/components/hooks/authProvider";
import Image from "next/image";
import api from "@/lib/axios";
import { getAvatarUrl } from "@/lib/utils";
import { Star, CrownSimple } from "@phosphor-icons/react/ssr";

export type GameRecord = {
  id: number;
  player1_id: number;
  player2_id: number;
  player1_score: number;
  player2_score: number;
  winner_id: number;
  created_at: string;
  opponent?: User;
};

export default function GameHistory({ playerId }: { playerId: number }) {
  const [games, setGames] = React.useState<GameRecord[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchGameHistory = async () => {
      setLoading(true);
      try {
        const response = await api.get("/historygames", {
          params: { playerId }
        });
        const gamesData = response.data.games || [];
        
        // Fetch opponent info for each game
        const gamesWithOpponents = await Promise.all(
          gamesData.map(async (game: GameRecord) => {
            const opponentId = game.player1_id === playerId ? game.player2_id : game.player1_id;
            try {
              const opponentResponse = await api.get(`/user/${opponentId}`);
              return { ...game, opponent: opponentResponse.data };
            } catch (err) {
              console.error("Error fetching opponent info:", err);
              return game;
            }
          })
        );

        setGames(gamesWithOpponents);
      } catch (err) {
        console.error("Error fetching game history:", err);
      } finally {
        setLoading(false);
      }
    };

    if (playerId) {
      fetchGameHistory();
    }
  }, [playerId]);

  const getGameScore = (game: GameRecord) => {
    if (game.player1_id === playerId) {
      return { playerScore: game.player1_score, opponentScore: game.player2_score };
    }
    return { playerScore: game.player2_score, opponentScore: game.player1_score };
  };

  const isPlayerWon = (game: GameRecord) => game.winner_id === playerId;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-gray-400">Loading game history...</p>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-gray-400">No games played yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full w-full p-4 overflow-y-auto scrollbar-hide">
      {games.map((game) => {
        const { playerScore, opponentScore } = getGameScore(game);
        const won = isPlayerWon(game);

        return (
          <div
            key={game.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-800/20 to-transparent hover:from-purple-700/30 transition-all"
          >
            {/* Opponent Avatar */}
            <Image
              src={getAvatarUrl(game.opponent?.avatar)}
              alt={game.opponent?.username || "Opponent"}
              width={50}
              height={50}
              className="rounded-full object-cover"
            />

            {/* Opponent Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm truncate">
                {game.opponent?.username || "Unknown"}
              </p>
              <p className="text-xs text-gray-400">
                {formatDate(game.created_at)}
              </p>
            </div>

            {/* Score */}
            <div className="flex items-center gap-2 px-3">
              <p className="font-bold text-lg text-white">{playerScore}</p>
              <p className="text-xs text-gray-400">-</p>
              <p className="font-bold text-lg text-gray-400">{opponentScore}</p>
            </div>

            {/* Win/Loss Badge */}
            <div
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                won
                  ? "bg-yellow-500/30 text-yellow-300"
                  : "bg-blue-500/30 text-blue-300"
              }`}
            >
              {won ? (
                <>
                  <CrownSimple size={14} weight="fill" />
                  <span>Starter</span>
                </>
              ) : (
                <>
                  <Star size={14} weight="fill" />
                  <span>Underdog</span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
