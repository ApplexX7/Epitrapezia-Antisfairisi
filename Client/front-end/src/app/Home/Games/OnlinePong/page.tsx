"use client";

import { useEffect, useState } from "react";
import { useSocketStore } from "@/components/hooks/SocketIOproviders";
import { useAuth } from "@/components/hooks/authProvider";
import RemoteBoard from "../LocalPong/RemoteBoard";

// -------------------
// TYPES
// -------------------
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
  const { socket, isConnected } = useSocketStore();
  const { user } = useAuth();

  const [status, setStatus] = useState<string>("");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [role, setRole] = useState<"left" | "right" | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameOver, setGameOver] = useState<GameOverPayload | null>(null);

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

    const handleGameOver = (payload: GameOverPayload) =>
      setStatus(`❌ ${payload.message}`);
    const handleGameOverWrapped = (payload: GameOverPayload) => {
      setGameOver(payload);
      setStatus(`❌ ${payload.message}`);
    };

    socket.on("waiting", handleWaiting);
    socket.on("matched", handleMatched);
    socket.on("gameState", handleGameState);
  socket.on("gameOver", handleGameOverWrapped);

    return () => {
      socket.off("waiting", handleWaiting);
      socket.off("matched", handleMatched);
      socket.off("gameState", handleGameState);
      socket.off("gameOver", handleGameOverWrapped);
    };
  }, [socket]);

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
      setStatus("❌ Socket not connected");
      return;
    }
    socket.emit("joinmatchup");
    setStatus("⚡ Searching for opponent...");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      {!roomId ? (
        <>
          <button
            className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 transition"
            onClick={handleJoin}
          >
            Join Matchup
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
              _boardColor="default"
              _ballColor="default"
              _paddleColor="default"
              winnerMessage={gameOver?.message ?? null}
            />
          ) : (
            <div className="relative w-[800px] h-[500px] bg-black overflow-hidden border-2 border-white">
              <p className="absolute inset-0 flex items-center justify-center text-white">Waiting for game state...</p>
            </div>
          )}

          {/* Info overlay */}
          <p className="absolute top-0 left-1/2 -translate-x-1/2 text-white mt-2">
            Room: {roomId} | Role: {role}
          </p>
        </div>
      )}
    </main>
  );
}
