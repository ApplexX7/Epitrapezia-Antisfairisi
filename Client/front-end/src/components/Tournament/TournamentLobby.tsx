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
  const [pendingMatch, setPendingMatch] = useState<{ a: Player; b: Player; matchId: string } | null>(null);
  const [matchToResolve, setMatchToResolve] = useState<string | null>(null);
  const [matchesState, setMatchesState] = useState<Record<string, { a?: Player | null; b?: Player | null; winnerId?: string | null; loserId?: string | null; status?: string }>>({});

  useEffect(() => {
    // initial lobby state: try to get from server, otherwise create local with creator
    const load = async () => {
      try {
        const res = await api.get(`/tournaments/${tournamentId}`);
        const remotePlayers: Player[] = res.data?.players?.map((p: any) => ({ id: p.playerId || p.id || p.id, name: p.displayName || p.name })) || [];
        if (remotePlayers.length) setPlayers(remotePlayers);
        else setPlayers([{ id: String(currentUser?.id || `creator-${Date.now()}`), name: currentUser?.username || "Creator", local: true }]);
      } catch {
        setPlayers([{ id: String(currentUser?.id || `creator-${Date.now()}`), name: currentUser?.username || "Creator", local: true }]);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId]);

  useEffect(() => {
    // when 4 players present, initialize semi-final slots if not present
    if (players.length >= 4) {
      setMatchesState((s) => {
        const next = { ...s };
        if (!next["semi-1"]) next["semi-1"] = { a: players[0], b: players[1], status: "idle" };
        if (!next["semi-2"]) next["semi-2"] = { a: players[2], b: players[3], status: "idle" };
        return next;
      });
    }
  }, [players]);

  const addLocalPlayer = () => {
    if (!nameEntry.trim()) return toast.error("Enter a player name");
    if (players.length >= 4) return toast.error("Tournament is limited to 4 players");
    const p: Player = { id: `local-${Date.now()}`, name: nameEntry.trim(), local: true };
    setPlayers((s) => [...s, p]);
    setNameEntry("");
  };

  const requestOtpAndVerify = async (a: Player, b: Player, matchId?: string) => {
    try {
      const res = await api.post(`/tournaments/${tournamentId}/send-otp`, { playerId: b.id });
      // backend may return otp for dev; show message accordingly
      if (res.data?.otp) toast.success(`OTP (dev): ${res.data.otp}`);
      else toast.success(`OTP sent for ${b.name}`);
      setVerifyTarget(b);
      const id = matchId || `m-${Date.now()}`;
      setPendingMatch({ a, b, matchId: id });
      setMatchesState((s) => ({ ...s, [id]: { a, b, status: "otp_sent" } }));
      setOtpOpen(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send OTP");
    }
  };

  const onOtpVerified = () => {
    if (!pendingMatch) return;
    toast.success(`OTP verified for ${pendingMatch.b.name}. Choose the match winner.`);
    setMatchesState((s) => ({ ...s, [pendingMatch.matchId]: { ...(s[pendingMatch.matchId] || {}), status: "verified" } }));
    setMatchToResolve(pendingMatch.matchId);
  };

  const resolveMatch = async (matchId: string, winnerId: string) => {
    setMatchesState((prev) => {
      const m = prev[matchId];
      if (!m) { toast.error("Match not found"); return prev; }
      const a = m.a as Player | undefined;
      const b = m.b as Player | undefined;
      const loserId = a?.id === winnerId ? b?.id : a?.id;
      const next = { ...prev, [matchId]: { ...m, winnerId, loserId, status: "finished" } };

      // if both semis finished, create final and third place
      const s1 = next["semi-1"];
      const s2 = next["semi-2"];
      if (s1 && s2 && s1.status === "finished" && s2.status === "finished") {
        const winner1 = s1.winnerId === s1.a?.id ? s1.a : s1.b;
        const winner2 = s2.winnerId === s2.a?.id ? s2.a : s2.b;
        const loser1 = s1.loserId === s1.a?.id ? s1.a : s1.b;
        const loser2 = s2.loserId === s2.a?.id ? s2.a : s2.b;
        if (winner1 && winner2) next["final-1"] = { a: winner1, b: winner2, status: "idle" };
        if (loser1 && loser2) next["third-1"] = { a: loser1, b: loser2, status: "idle" };
      }

      return next;
    });

    setMatchToResolve(null);
    setPendingMatch(null);

    // Send this match result to backend
    try {
      const m = matchesState[matchId] || {};
      const winner = winnerId;
      const loser = (m.a?.id === winnerId ? m.b?.id : m.a?.id) || null;
      await api.post(`/tournaments/${tournamentId}/result`, { matchId, winnerId: winner, loserId: loser, stage: matchId.startsWith("final") ? "final" : matchId.startsWith("third") ? "third" : matchId.startsWith("semi") ? "semi" : "match" });
      toast.success("Match result sent to server");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send match result to server");
    }

    // If both final and third finished, send overall tournament standings
    const final = (matchesState['final-1'] && matchesState['final-1'].status === 'finished') || (matchId === 'final-1');
    const third = (matchesState['third-1'] && matchesState['third-1'].status === 'finished') || (matchId === 'third-1');
    if (final && third) {
      // compute standings from matchesState
      const f = matchesState['final-1'];
      const t = matchesState['third-1'];
      const firstId = f?.winnerId || null;
      const secondId = f?.loserId || null;
      const thirdId = t?.winnerId || null;
      const fourthId = t?.loserId || null;
      try {
        await api.post(`/tournaments/${tournamentId}/complete`, { winnerId: firstId, runnerUpId: secondId, thirdId, fourthId });
        toast.success('Tournament results sent to server');
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to send tournament results');
      }
    }
  };

  const startSemiMatch = (slot: number) => {
    if (players.length < 4) return toast.error("Need 4 players to start bracket");
    const idxA = slot === 1 ? 0 : 2;
    const idxB = idxA + 1;
    const a = players[idxA];
    const b = players[idxB];
    if (!a || !b) return toast.error("Both players must be present");
    const semiId = `semi-${slot}`;
    setMatchesState((s) => ({ ...s, [semiId]: { a, b, status: "pending" } }));
    requestOtpAndVerify(a, b, semiId);
  };

  const startFinalOrThird = (matchId: string) => {
    const match = matchesState[matchId];
    if (!match || !match.a || !match.b) return toast.error("Match not ready");
    requestOtpAndVerify(match.a as Player, match.b as Player, matchId);
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
        <h3 className="font-semibold mb-2">Bracket (4 players)</h3>
        <p className="text-sm text-gray-600 mb-3">Semi-finals: 1v2 and 3v4. Winners → Final. Losers → 3rd place.</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border rounded">
            <div className="font-medium">Semi-final 1</div>
            <div className="mt-2">{players[0]?.name || "TBD"} vs {players[1]?.name || "TBD"}</div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => startSemiMatch(1)} className="px-3 py-1 rounded bg-green-600 text-white">Start</button>
              <div className="px-3 py-1 rounded bg-gray-100">Status: {matchesState['semi-1']?.status || 'idle'}</div>
            </div>
          </div>

          <div className="p-3 border rounded">
            <div className="font-medium">Semi-final 2</div>
            <div className="mt-2">{players[2]?.name || "TBD"} vs {players[3]?.name || "TBD"}</div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => startSemiMatch(2)} className="px-3 py-1 rounded bg-green-600 text-white">Start</button>
              <div className="px-3 py-1 rounded bg-gray-100">Status: {matchesState['semi-2']?.status || 'idle'}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-3 border rounded">
            <div className="font-medium">Final</div>
            <div className="mt-2">{matchesState['final-1'] ? `${matchesState['final-1'].a?.name} vs ${matchesState['final-1'].b?.name}` : 'TBD'}</div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => startFinalOrThird('final-1')} className="px-3 py-1 rounded bg-blue-600 text-white">Start Final</button>
              <div className="px-3 py-1 rounded bg-gray-100">Status: {matchesState['final-1']?.status || 'idle'}</div>
            </div>
          </div>

          <div className="p-3 border rounded">
            <div className="font-medium">3rd Place</div>
            <div className="mt-2">{matchesState['third-1'] ? `${matchesState['third-1'].a?.name} vs ${matchesState['third-1'].b?.name}` : 'TBD'}</div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => startFinalOrThird('third-1')} className="px-3 py-1 rounded bg-blue-600 text-white">Start 3rd</button>
              <div className="px-3 py-1 rounded bg-gray-100">Status: {matchesState['third-1']?.status || 'idle'}</div>
            </div>
          </div>
        </div>
      </div>

      <OtpModal open={otpOpen} onClose={() => { setOtpOpen(false); setPendingMatch(null); }} tournamentId={tournamentId} playerId={verifyTarget?.id || ""} onVerified={onOtpVerified} />

      {matchToResolve && matchesState[matchToResolve] && (
        <div className="fixed bottom-6 right-6 bg-white p-4 rounded shadow-lg">
          <div className="font-semibold mb-2">Resolve match</div>
          <div className="mb-3">{matchesState[matchToResolve].a?.name} vs {matchesState[matchToResolve].b?.name}</div>
          <div className="flex gap-2">
            <button onClick={() => resolveMatch(matchToResolve, matchesState[matchToResolve].a!.id)} className="px-3 py-1 bg-green-600 text-white rounded">{matchesState[matchToResolve].a?.name} wins</button>
            <button onClick={() => resolveMatch(matchToResolve, matchesState[matchToResolve].b!.id)} className="px-3 py-1 bg-green-600 text-white rounded">{matchesState[matchToResolve].b?.name} wins</button>
          </div>
        </div>
      )}

    </div>
  );
}
