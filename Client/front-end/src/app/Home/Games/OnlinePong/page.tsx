"use client";

import { useEffect, useState } from "react";
import { useSocketStore } from "@/components/hooks/SocketIOproviders";
import { useAuth } from "@/components/hooks/authProvider";

export default function Page() {
  const [status, setStatus] = useState("");
  const { socket, isConnected } = useSocketStore();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket) {
      setStatus("⏳ Initializing socket...");
      return;
    }

    setStatus(isConnected ? `🟢 Connected: ${socket.id}` : "🔴 Disconnected");

    // Listen for server events
    const handleWaiting = (payload: any) => {
      setStatus(`⏳ ${payload.message}`);
    };

    const handleMatched = (payload: any) => {
      setStatus(`✅ Matched with: ${payload.opponent}`);
    };

    socket.on("waiting", handleWaiting);
    socket.on("matched", handleMatched);

    return () => {
      socket.off("waiting", handleWaiting);
      socket.off("matched", handleMatched);
    };
  }, [socket, isConnected]);

  const handleJoin = () => {
    if (!socket || !isConnected) {
      setStatus("❌ Not connected to server");
      return;
    }
    console.log("🎮 Emitting joinmatchup event");
    socket.emit("joinmatchup");
    setStatus("⚡ Emitted joinmatchup, waiting for server...");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <button
        className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700"
        onClick={handleJoin}
      >
        Join Matchup
      </button>
      <p className="mt-4">{status}</p>
    </main>
  );
}
