"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSocketStore } from "@/components/hooks/SocketIOproviders";

type Tournament = { 
  id: string; 
  name: string; 
  isUserJoined?: boolean;
  playerCount?: number;
};

export default function JoinTournament(): JSX.Element {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { socket } = useSocketStore();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/tournaments");
        setTournaments(res.data?.tournaments || []);
      } catch (err) {
        toast.error("Failed to load tournaments");
        // keep empty list if server unavailable
        setTournaments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Listen for tournament updates via socket
  useEffect(() => {
    if (!socket) return;

    const handleTournamentUpdate = (data: { tournamentId: number; tournament: any }) => {
      console.log("Tournament updated:", data);
      
      // Update the specific tournament in the list
      setTournaments((prev) =>
        prev.map((t) =>
          t.id === String(data.tournamentId)
            ? {
                ...t,
                playerCount: data.tournament.playerCount || t.playerCount,
                isUserJoined: data.tournament.isUserJoined ?? t.isUserJoined,
              }
            : t
        )
      );
    };

    socket.on("tournament:updated", handleTournamentUpdate);

    return () => {
      socket.off("tournament:updated", handleTournamentUpdate);
    };
  }, [socket]);

  const handleChange = (id: string, value: string) => {
    setPasswords((p) => ({ ...p, [id]: value }));
  };

  const handleJoin = async (t: Tournament) => {
    if (t.isUserJoined) {
      router.push(`/Home/Games/Tournament/lobby/${t.id}`);
      return;
    }

    try {
      const pwd = passwords[t.id] || "";
      if (!pwd) {
        return toast.error("Enter tournament password");
      }

      const res = await api.post(`/tournaments/${t.id}/join`, { password: pwd });
      const id = res.data?.tournament?.id || t.id;
      toast.success("Joined tournament!");
      router.push(`/Home/Games/Tournament/lobby/${id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Join failed — check password");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading tournaments...</div>
      </div>
    );
  }

  const joinedTournaments = tournaments.filter((t) => t.isUserJoined);
  const availableTournaments = tournaments.filter((t) => !t.isUserJoined);

  return (
    <div className="flex justify-center mt-10 px-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-purple-700 mb-8 text-center">Join a Tournament</h1>

        {/* Your Tournaments */}
        {joinedTournaments.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-green-700 mb-4">✓ Your Tournaments</h2>
            <div className="flex flex-col gap-4 mb-8">
              {joinedTournaments.map((t) => (
                <div
                  key={t.id}
                  style={{
                    backgroundImage: "url('/images/rps.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  className="bg-green-100/80 backdrop-blur-md rounded-xl p-4 flex flex-col shadow-md border-2 border-green-400"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-green-900">{t.name}</h3>
                      <div className="text-sm text-green-800">
                        Players: {t.playerCount || 0}/4
                      </div>
                    </div>
                    <button
                      className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition font-semibold cursor-pointer"
                      onClick={() => handleJoin(t)}
                    >
                      Enter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Tournaments */}
        {availableTournaments.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-purple-700 mb-4">
              {joinedTournaments.length > 0 ? "Available Tournaments" : "All Tournaments"}
            </h2>
            <div className="flex flex-col gap-4">
              {availableTournaments.map((t) => (
                <div
                  key={t.id}
                  style={{
                    backgroundImage: "url('/images/rps.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  className="bg-white/50 backdrop-blur-md rounded-xl p-4 flex flex-col shadow-md border border-purple-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-lg font-semibold text-white-smoke">{t.name}</h2>
                      <div className="text-sm text-gray-200">
                        Players: {t.playerCount || 0}/4
                      </div>
                    </div>
                    <button
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition cursor-pointer font-semibold"
                      onClick={() => handleJoin(t)}
                    >
                      Join
                    </button>
                  </div>

                  <div className="text-sm text-purple-900/80">
                    <div className="text-sm text-white font-bold flex items-center gap-2">
                      Password:
                      <input
                        type="password"
                        value={passwords[t.id] || ""}
                        onChange={(e) => handleChange(t.id, e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleJoin(t)}
                        placeholder="Enter password"
                        className="bg-white/30 text-white font-bold px-3 py-1 rounded-lg outline-none placeholder-white/60 ml-2 flex-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tournaments.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <p>No tournaments available yet.</p>
            <p className="text-sm mt-2">Create one or wait for others to create tournaments!</p>
          </div>
        )}
      </div>
    </div>
  );
}
