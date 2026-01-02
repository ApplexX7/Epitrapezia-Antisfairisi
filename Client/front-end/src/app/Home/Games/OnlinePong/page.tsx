"use client";

import { useEffect, useState, useRef } from "react";
import { useSocketStore } from "@/components/hooks/SocketIOproviders";
import { useAuth } from "@/components/hooks/authProvider";
import RemoteBoard from "../LocalPong/RemoteBoard";
import GameCostum from "./GameCostum";
import RemoteScoreBoard from "./RemoteScoreBoard"
import { Button } from "@/components/ui/button";
import Link from 'next/link'

type MatchedPayload = {
  opponent: {
    id: number;
    username: string;
    avatar: string;
  };
  roomId: string;
  role: "left" | "right";
};

type WaitingPayload = {
  message: string;
};

type GameState = {
  ball: { x: number; y: number };
  paddles: Record<string, number>;
  playerOrder?: number[];
  scores?: Record<string, number>;
};

type GameOverPayload = {
  message: string;
};

type MovePaddlePayload = {
  roomId: string;
  direction: "up" | "down";
};

export default function Page() {
  let [boardColor, setBoardColor] = useState("default");
    let [ballColor, setBallColor] = useState("default");
    let [paddleColor, setPaddleColor] = useState("default");
    let [gameDiff, setGameDiff] = useState("easy");
  const { socket, isConnected } = useSocketStore();
  const [playerName, setPlayerName] = useState<string | null>(null);
const [opponentName, setOpponentName] = useState<string | null>(null);
const [opponentAvatar, setOpponentAvatar] = useState<string | null>(null);
  const { user } = useAuth();
  useEffect(() => {
    if (user?.username) {
      setPlayerName(user.username);
    }
  }, [user]);
  
  const [status, setStatus] = useState<string>("");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [role, setRole] = useState<"left" | "right" | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameOver, setGameOver] = useState<GameOverPayload | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  let [MatchupText, setMatchupText] = useState("Join Matchup");

  // Register socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleWaiting = (payload: WaitingPayload) =>
      setStatus(`⏳ ${payload.message}`);

    const handleMatched = (payload: MatchedPayload) => {
      setStatus(`Matched with ${payload.opponent.username}`);
      setOpponentName(payload.opponent.username);
      setOpponentAvatar(payload.opponent.avatar);
      setRoomId(payload.roomId);
      setRole(payload.role);
    };

    const handleGameState = (state: GameState) => setGameState(state);
    const handleGameStateWrapped = (state: GameState) => {
      setGameState(state);
      setCountdown(null);
    };

    const handleGameOver = (payload: GameOverPayload) =>
      setStatus(` ${payload.message}`);
    const handleGameOverWrapped = (payload: GameOverPayload) => {
      setGameOver(payload);
      setStatus(` ${payload.message}`);
    };
    socket.on("stopmatchmaking", handleStopMatchMacking);
    socket.on("waiting", handleWaiting);
    socket.on("matched", handleMatched);
  socket.on("gameState", handleGameStateWrapped);
    socket.on("gameOver", handleGameOverWrapped);
  const handleCountdown = (p: { remaining: number }) => setCountdown(p.remaining);
  socket.on("countdown", handleCountdown);

    return () => {
      socket.off("waiting", handleWaiting);
  socket.off("matched", handleMatched);
  socket.off("gameState", handleGameStateWrapped);
      socket.off("gameOver", handleGameOverWrapped);
      socket.off("countdown", handleCountdown);
    };
  }, [socket]);
  let handleStopMatchMacking = () =>
    {
      setMatchupText("Join Matchup");
      setStatus("");
    }
  // Handle paddle movement (arrow keys)
  useEffect(() => {
    if (!socket || !roomId || !role) return;

    const keysRef = keysRefMap.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;

      if (!keysRef[e.key]) {
        keysRef[e.key] = true;
        const direction = e.key === "ArrowUp" ? "up" : "down";
        socket.emit("movePaddle", { roomId, direction } as MovePaddlePayload);
      }
      e.preventDefault();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      keysRef[e.key] = false;
      e.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    repeatRef.current = window.setInterval(() => {
      if (!socket || !roomId) return;
      if (keysRef["ArrowUp"]) socket.emit("movePaddle", { roomId, direction: "up" });
      if (keysRef["ArrowDown"]) socket.emit("movePaddle", { roomId, direction: "down" });
    }, 60);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (repeatRef.current) {
        clearInterval(repeatRef.current);
        repeatRef.current = null;
      }
      // reset key state
      keysRef["ArrowUp"] = false;
      keysRef["ArrowDown"] = false;
    };
  }, [roomId, socket, role]);

  // re registering handlers on every render.
  const keysRefMap = useRef<Record<string, boolean>>({ ArrowUp: false, ArrowDown: false });
  const repeatRef = useRef<number | null>(null);
  const HandleRePlay = () =>
  {
    window.location.reload();
  }

  // Join matchmaking
  const handleJoin = () => {
    if (!socket || !isConnected) {
      setStatus("Socket not connected");
      return;
    }
    socket.emit("joinmatchup");
    setMatchupText("Cancel Matchup");
    setStatus("Searching for opponent...");
  };
  useEffect(() => {
    if (!socket) return;
  
    const handleBeforeUnload = () => {
      if (roomId) socket.disconnect();
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      if (roomId) socket.disconnect();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [socket, roomId]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen ">
      {!roomId ? (
        <>
            <GameCostum 
       currentBoard = {boardColor}
       currentBall = {ballColor}
       currentPaddle = {paddleColor}
       currentDiff = {gameDiff}
       setCurrentBall={setBallColor}
       setCurrentBoard={setBoardColor}
       setCurrentDiff={setGameDiff}
       setCurrentPaddle={setPaddleColor}
       />
        {/* <Link href="/Home/Games/">
       <Button className="fixed bg-purple-400 top-4 left-4 cursor-pointer">
          Back To Games
       </Button>
        </Link> */}
          <button
            className="px-6 py-3 bg-purple-600 rounded hover:bg-purple-800 cursor-pointer transition"
            onClick={handleJoin}
          >
            {MatchupText}
          </button>
          <p className="mt-4 text-lg">{status}</p>
        </>
      ) : (
        <div className="mt-6 flex gap-8 flex-col">
      
          {gameState ? (
            <div>
       <RemoteScoreBoard
  role={role}
  gameState={gameState}
  leftPlayer={role === "left" ? playerName ?? "" : opponentName ?? ""}
  rightPlayer={role === "right" ? playerName ?? "" : opponentName ?? ""}
  leftAvatar={role === "left" ? user?.avatar ?? "/images/player2.png" : opponentAvatar ?? "/images/player2.png"}
  rightAvatar={role === "right" ? user?.avatar ?? "/images/player2.png" : opponentAvatar ?? "/images/player2.png"}
/>





            <RemoteBoard
              gameState={gameState}
              role={role}
              userId={user?.id ?? null}
              _boardColor={boardColor}
              _ballColor={ballColor}
              _paddleColor={paddleColor}
              winnerMessage={gameOver?.message ?? null}
              countdownRemaining={countdown}
            />
            </div>
          ) : (
            <div className="relative w-[800px] h-[500px] bg-black overflow-hidden border-2 border-white">
              <p className="absolute inset-0 flex items-center justify-center text-white">Waiting for game state</p>
            </div>
          )}
          {
            (gameOver &&
            <>
              <button className="bg-purple-700 hover:bg-purple-950 transition-transform cursor-pointer font-bold  m-auto rounded-xl text-white-smoke w-40 h-12" onClick={HandleRePlay}> RePlay </button>
            </>
            )
            
          }
          {/* <p className="absolute top-0 left-1/2 -translate-x-1/2 text-white mt-2">
            Room: {roomId} | Role: {role}
          </p> */}
        </div>
      )}
    </main>
  );
}
