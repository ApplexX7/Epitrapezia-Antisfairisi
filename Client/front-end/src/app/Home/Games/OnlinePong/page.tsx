"use client";

import { useEffect, useState } from "react";
import { useSocketStore } from "@/components/hooks/SocketIOproviders";
import { useAuth } from "@/components/hooks/authProvider";
import RemoteBoard from "../LocalPong/RemoteBoard";
import GameCostum from "./GameCostum";

type MatchedPayload = {
  opponent: string;
  roomId: string;
  role: "left" | "right";
};

type WaitingPayload = {
  message: string;
};

type GameState = {
  ball: { x: number; y: number };
  paddles: Record<string, number>; // key = userId (stringified), value = y position
  playerOrder?: number[]; // [leftId, rightId]
  scores?: Record<string, number>;
};

type GameOverPayload = {
  message: string;
};

type MovePaddlePayload = {
  roomId: string;
  direction: "up" | "down";
};

// -------------------
// COMPONENT
// -------------------
export default function Page() {
  let [boardColor, setBoardColor] = useState("default");
    let [ballColor, setBallColor] = useState("default");
    let [paddleColor, setPaddleColor] = useState("default");
    let [gameDiff, setGameDiff] = useState("easy");
  const { socket, isConnected } = useSocketStore();
  const { user } = useAuth();

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
      setStatus(`✅ Matched with ${payload.opponent}`);
      setRoomId(payload.roomId);
      setRole(payload.role);
    };

    const handleGameState = (state: GameState) => setGameState(state);
    const handleGameStateWrapped = (state: GameState) => {
      setGameState(state);
      setCountdown(null);
    };

    const handleGameOver = (payload: GameOverPayload) =>
      setStatus(`❌ ${payload.message}`);
    const handleGameOverWrapped = (payload: GameOverPayload) => {
      setGameOver(payload);
      setStatus(`❌ ${payload.message}`);
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
    // Only bind key handlers once we're in a room and we know our role
    if (!socket || !roomId || !role) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        const payload: MovePaddlePayload = { roomId, direction: "up" };
        socket.emit("movePaddle", payload);
      } else if (e.key === "ArrowDown") {
        const payload: MovePaddlePayload = { roomId, direction: "down" };
        socket.emit("movePaddle", payload);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [roomId, socket, role]);


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
          <button
            className="px-6 py-3 bg-purple-600 rounded hover:bg-purple-800 cursor-pointer transition"
            onClick={handleJoin}
          >
            {MatchupText}
          </button>
          <p className="mt-4 text-lg">{status}</p>
        </>
      ) : (
        <div className="mt-6">
      
          {gameState ? (
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
          ) : (
            <div className="relative w-[800px] h-[500px] bg-black overflow-hidden border-2 border-white">
              <p className="absolute inset-0 flex items-center justify-center text-white">Waiting for game state</p>
            </div>
          )}

          {/* <p className="absolute top-0 left-1/2 -translate-x-1/2 text-white mt-2">
            Room: {roomId} | Role: {role}
          </p> */}
        </div>
      )}
    </main>
  );
}
