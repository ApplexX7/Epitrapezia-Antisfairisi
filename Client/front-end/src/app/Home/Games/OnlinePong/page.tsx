"use client";

import { useEffect, useState } from "react";
import { useSocketStore } from "@/components/hooks/SocketIOproviders";
import { useAuth } from "@/components/hooks/authProvider";

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

    socket.on("waiting", handleWaiting);
    socket.on("matched", handleMatched);
    socket.on("gameState", handleGameState);
    socket.on("gameOver", handleGameOver);

    return () => {
      socket.off("waiting", handleWaiting);
      socket.off("matched", handleMatched);
      socket.off("gameState", handleGameState);
      socket.off("gameOver", handleGameOver);
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
        <div className="relative w-[800px] h-[500px] bg-black overflow-hidden border-2 border-white mt-6">
          {gameState && (
            <>
              {/* Ball */}
              <div
                className="absolute w-[20px] h-[20px] bg-white rounded-full"
                style={{
                  left: `${400 + gameState.ball.x}px`,
                  top: `${250 + gameState.ball.y}px`,
                  transform: "translate(-50%, -50%)",
                }}
              />

              {/* Paddles */}
              {Object.entries(gameState.paddles).map(([id, y]) => {
                const isOwn = id === String(user?.id);

                // Use our assigned role to determine left/right positions.
                const leftForOwn = role === "left" ? "20px" : "760px";
                const leftForOpponent = role === "left" ? "760px" : "20px";

                const left = isOwn ? leftForOwn : leftForOpponent;

                return (
                  <div
                    key={id}
                    className="absolute w-[20px] h-[100px] bg-pink-500"
                    style={{
                      left,
                      top: `${250 + y}px`,
                      transform: "translateY(-50%)",
                    }}
                  />
                );
              })}
            </>
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
