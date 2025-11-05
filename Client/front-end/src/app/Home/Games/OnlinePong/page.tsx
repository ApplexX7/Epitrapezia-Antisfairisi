"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

// Hardcoded token for testing (do NOT use in production)
const TEST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsImlhdCI6MTc2MjMwMjk2NSwiZXhwIjoxNzYyOTA3NzY1fQ.ThIYWkcZqmV5Ik41sZeVmgUpp2VoqYDZHocQjPLlvN8";

const URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://server:8080";
const socket: Socket = io(URL, {
  autoConnect: false,
  transports: ["websocket"],
  auth: {
    token: TEST_TOKEN, // <-- hardcoded token
  },
});

export default function Page() {
  const [status, setStatus] = useState("");

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => setStatus(`🟢 Connected: ${socket.id}`));
    socket.on("connect_error", (err) => setStatus(`❌ Connect error: ${err}`));
    socket.on("joinedMatchup", (payload) =>
      setStatus(`🎮 Joined matchup: ${JSON.stringify(payload)}`)
    );

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("joinedMatchup");
    };
  }, []);

  const handleJoin = () => {
    socket.emit("connection");
    socket.emit("joinmatchup");
    setStatus("⚡ Emitted joinmatchup");
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
