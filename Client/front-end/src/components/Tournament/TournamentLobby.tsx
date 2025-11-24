"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import OtpModal from "./OtpModal";
import { useAuth } from "@/components/hooks/authProvider";

type Player = { id: string; name: string; local?: boolean };

type Props = { tournamentId: string };

export default function TournamentLobby({ tournamentId }: Props) {
  const auth = useAuth();
  const currentUser = auth.user;

  const [players, setPlayers] = useState<Player[]>([]);
  const [nameEntry, setNameEntry] = useState("");
  const [otpOpen, setOtpOpen] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState<Player | null>(null);
  const [pendingMatch, setPendingMatch] = useState<{ a: Player; b: Player } | null>(null);

  useEffect(() => {
    // initial lobby state: try to get from server, otherwise create local with creator
    const load = async () => {
      try {
        const res = await api.get(`/tournaments/${tournamentId}`);
        const remotePlayers: Player[] = res.data?.players?.map((p: any) => ({ id: p.id, name: p.name })) || [];
        if (remotePlayers.length) setPlayers(remotePlayers);
        else setPlayers([{ id: String(currentUser?.id || `creator-${Date.now()}`), name: currentUser?.username || "Creator", local: true }]);
      } catch {
        setPlayers([{ id: String(currentUser?.id || `creator-${Date.now()}`), name: currentUser?.username || "Creator", local: true }]);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId]);

  const addLocalPlayer = () => {
    if (!nameEntry.trim()) return toast.error("Enter a player name");
    if (players.length >= 4) return toast.error("Tournament is limited to 4 players");
    const p: Player = { id: `local-${Date.now()}`, name: nameEntry.trim(), local: true };
    setPlayers((s) => [...s, p]);
    setNameEntry("");
  };

  const requestOtpAndVerify = async (a: Player, b: Player) => {
    // send otp for player b (the one who must be present)
    try {
      await api.post(`/tournaments/${tournamentId}/send-otp`, { playerId: b.id });
      toast.success(`OTP sent for ${b.name}`);
      setVerifyTarget(b);
      setPendingMatch({ a, b });
      setOtpOpen(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send OTP");
    }
  };

  const onOtpVerified = () => {
    if (!pendingMatch) return;
    toast.success(`Match starting: ${pendingMatch.a.name} vs ${pendingMatch.b.name}`);
    // Here you'd navigate to a match page or start the local match flow
    setPendingMatch(null);
  };

  const startMatchBetween = (aIdx: number, bIdx: number) => {
    const a = players[aIdx];
    const b = players[bIdx];
    if (!a || !b) return toast.error("Select two players");
    requestOtpAndVerify(a, b);
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4">
      <h2 className="text-xl font-semibold mb-4">Tournament Lobby — {String(tournamentId)}</h2>

      <div className="mb-4">
        <div className="grid grid-cols-2 gap-4">
          {players.map((p, i) => (
            <div key={p.id} className="p-3 bg-white/30 rounded-lg border">
              <div className="font-medium text-gray-900">{p.name}</div>
              <div className="text-xs text-gray-600">{p.local ? "Local" : "Remote"}</div>
            </div>
          ))}
          {players.length < 4 && (
            <div className="p-3 border rounded-lg flex flex-col gap-2">
              <input value={nameEntry} onChange={(e) => setNameEntry(e.target.value)} placeholder="Local player name" className="px-2 py-1 rounded" />
              <button onClick={addLocalPlayer} className="px-3 py-1 bg-purple-600 text-white rounded">Add player</button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Start a match</h3>
        <p className="text-sm text-gray-600 mb-3">Select two players and press Start — the second player will be asked to verify via OTP.</p>
        <div className="grid grid-cols-2 gap-4">
          {players.map((pa, i) => (
            players.map((pb, j) => {
              if (i >= j) return null;
              return (
                <div key={`${pa.id}-${pb.id}`} className="p-3 border rounded flex items-center justify-between">
                  <div>{pa.name} vs {pb.name}</div>
                  <button onClick={() => startMatchBetween(i, j)} className="px-3 py-1 rounded bg-green-600 text-white">Start</button>
                </div>
              );
            })
          ))}
        </div>
      </div>

      <OtpModal open={otpOpen} onClose={() => setOtpOpen(false)} tournamentId={tournamentId} playerId={verifyTarget?.id || ""} onVerified={onOtpVerified} />
    </div>
  );
}
