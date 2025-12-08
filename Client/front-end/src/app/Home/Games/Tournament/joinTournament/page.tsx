"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type Tournament = { id: string; name: string };

export default function JoinTournament(): JSX.Element {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/tournaments");
        setTournaments(res.data?.tournaments || []);
      } catch {
        // fallback sample data so UI can be tested without backend
        setTournaments([
          { id: "local-1", name: "Ping Pong Masters" },
          { id: "local-2", name: "Weekend Smash" },
        ]);
      }
    };
    load();
  }, []);

  const handleChange = (id: string, value: string) => {
    setPasswords((p) => ({ ...p, [id]: value }));
  };

  const handleJoin = async (t: Tournament) => {
    try {
      const pwd = passwords[t.id] || "";
      const res = await api.post(`/tournaments/${t.id}/join`, { password: pwd });
      const id = res.data?.tournamentId || t.id;
      toast.success("Joined tournament");
      router.push(`/Home/Games/Tournament/lobby/${id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Join failed — check password");
    }
  };

  return (
    <div className="flex justify-center mt-10">
      <div className="w-full max-w-3xl px-4">
        <h1 className="text-2xl font-semibold text-purple-700 mb-6 text-center">Join a Tournament</h1>

        <div className="flex flex-col gap-4">
          {tournaments.map((t) => (
            <div key={t.id} style={{ backgroundImage: "url('/images/rps.png')", backgroundSize: "cover", backgroundPosition: "center" }} className="bg-white/50 backdrop-blur-md rounded-xl p-4 flex flex-col shadow-md border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white-smoke">{t.name}</h2>
                <button className="px-4 py-1 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition cursor-pointer" onClick={() => handleJoin(t)}>Join</button>
              </div>

              <div className="text-sm text-purple-900/80">
                <div className="text-sm text-white font-bold flex items-center gap-2">
                  Password:
                  <input type="password" value={passwords[t.id] || ""} onChange={(e) => handleChange(t.id, e.target.value)} placeholder="Enter password" className="bg-white/30 text-white font-bold px-3 py-1 rounded-lg outline-none placeholder-white/60 ml-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
