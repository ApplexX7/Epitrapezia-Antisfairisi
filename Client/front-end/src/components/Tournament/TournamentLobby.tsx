"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useAuth } from "@/components/hooks/authProvider";
import { useRouter } from "next/navigation";

type Player = { id: string; name: string; local?: boolean };

type Match = { a?: Player | null; b?: Player | null; winnerId?: string | null; loserId?: string | null; status?: string; dbId?: number | string };

type Props = { tournamentId: string };

export default function TournamentLobby({ tournamentId }: Props) {
  const auth = useAuth();
  const currentUser = auth.user;
  const router = useRouter();

  const [players, setPlayers] = useState<Player[]>([]);
  const [tournamentInfo, setTournamentInfo] = useState<any>(null);
  const [nameEntry, setNameEntry] = useState("");
  const [matchToResolve, setMatchToResolve] = useState<string | null>(null);
  const [matchesState, setMatchesState] = useState<Record<string, Match>>({});
  const [loading, setLoading] = useState(true);
  const [bracketReady, setBracketReady] = useState(false);
  const [tournamentComplete, setTournamentComplete] = useState(false);
  const [standings, setStandings] = useState<any>(null);
  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hydrateMatches = async (playerList: Player[]) => {
    const matchesRes = await api.get(`/tournaments/${tournamentId}/matches`);
    const matches = matchesRes.data?.matches || [];
    if (!matches.length) return;
    const nextState: Record<string, Match> = {};
    matches.forEach((m: any) => {
      const pa = playerList.find((p) => String(p.id) === String(m.player_a_id)) || { id: String(m.player_a_id), name: m.player_a_name || 'Player' };
      const pb = playerList.find((p) => String(p.id) === String(m.player_b_id)) || { id: String(m.player_b_id), name: m.player_b_name || 'Player' };
      const key = `${m.stage}-${m.match_number}`;
      nextState[key] = { a: pa, b: pb, status: m.status || 'idle', winnerId: m.winner_id ? String(m.winner_id) : null, loserId: m.loser_id ? String(m.loser_id) : null, dbId: m.id } as any;
    });
    setMatchesState((s) => ({ ...s, ...nextState }));
    setBracketReady(true);
  };

  // Load initial data
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/tournaments/${tournamentId}`);
        setTournamentInfo(res.data || null);
        const remotePlayers: Player[] = res.data?.players?.map((p: any) => ({ 
          id: String(p.player_id || p.id), 
          name: p.display_name || p.name 
        })) || [];
        
        if (remotePlayers.length) setPlayers(remotePlayers);
        else {
          const creatorId = String(currentUser?.id || `creator-${Date.now()}`);
          const creatorName = currentUser?.username || "Creator";
          setPlayers([{ id: creatorId, name: creatorName, local: true }]);
        }
        
        // Load tournament status
        if (res.data?.status === 'completed') {
          setTournamentComplete(true);
        }
        // fetch creator username if available
        try {
          const cid = res.data?.creator_id;
          if (cid) {
            const u = await api.get(`/userInfo/${cid}`);
            setCreatorName(u.data?.userInof?.username || null);
          }
        } catch (e) {
          // ignore
        }
        // Prefer creator username from players list if available
        if (!creatorName && res.data?.players?.length) {
          const creatorPlayer = res.data.players.find((p: any) => String(p.player_id) === String(res.data.creator_id));
          if (creatorPlayer?.display_name) setCreatorName(creatorPlayer.display_name);
        }

        // Fetch matches (if any) to hydrate bracket
        try {
          await hydrateMatches(remotePlayers.length ? remotePlayers : []);
        } catch (err) {
          if (process.env.NODE_ENV !== 'production') console.warn('Could not fetch matches on load', err);
        }
      } catch (err) {
        console.warn("Could not load tournament from server, using local mode");
        const creatorId = String(currentUser?.id || `creator-${Date.now()}`);
        const creatorName = currentUser?.username || "Creator";
        setPlayers([{ id: creatorId, name: creatorName, local: true }]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tournamentId, currentUser?.id, currentUser?.username]);

  // when tournamentInfo available and no creatorName yet, try to fetch
  useEffect(() => {
    if (!tournamentInfo || creatorName) return;
    const cid = tournamentInfo?.creator_id;
    if (!cid) return;
    (async () => {
      try {
        const u = await api.get(`/userInfo/${cid}`);
        setCreatorName(u.data?.userInof?.username || null);
      } catch (e) {
        // ignore
      }
    })();
  }, [tournamentInfo, creatorName]);

  // Auto-initialize bracket when 4 players present
  useEffect(() => {
    if (players.length === 4 && !bracketReady && !matchesState['semi-1']) {
      initializeBracket();
    }
  }, [players]);

  // Periodically sync match statuses when bracket exists (helps clear in_progress after games)
  useEffect(() => {
    if (!bracketReady || String(tournamentId).startsWith('local-')) return;
    const id = setInterval(async () => {
      try {
        await hydrateMatches(players);
      } catch (e) {
        // ignore transient errors
      }
    }, 5000);
    return () => clearInterval(id);
  }, [bracketReady, tournamentId, players]);

  // Re-sync matches when user returns to the tab/page (e.g., after back navigation)
  useEffect(() => {
    if (!bracketReady || String(tournamentId).startsWith('local-')) return;

    const refresh = async () => {
      try {
        await hydrateMatches(players);
      } catch (e) {
        // ignore
      }
    };

    const handleVisibility = () => {
      if (!document.hidden) refresh();
    };

    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', handleVisibility);
    refresh();

    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [bracketReady, tournamentId, players]);

  const addLocalPlayer = async () => {
    const username = nameEntry.trim();
    if (!username) {
      setErrorMessage("Enter a player name");
      return;
    }
    if (players.length >= 4) {
      setErrorMessage("Tournament is limited to 4 players");
      return;
    }
    if (!currentUser || !currentUser.id) {
      setErrorMessage("You must be logged in to validate players");
      return;
    }

    try {
      const res = await api.get("/search", { params: { query: username } });
      const results = res.data?.result || [];
      const matched = results.find((u: any) => u.username === username);
      if (!matched) {
        setErrorMessage("Username not found in platform");
        return;
      }
      // Prevent duplicates
      if (players.some((p) => p.id === String(matched.id))) {
        setNameEntry("");
        setErrorMessage("Player already added");
        return;
      }

      // If tournament is server-backed, call add-player endpoint so it's persisted
      if (!String(tournamentId).startsWith('local-')) {
        try {
          const body: any = { username };
          // if current user is not creator we would need password; creator may omit it
          const resp = await api.post(`/tournaments/${tournamentId}/add-player`, body);
          const tour = resp.data?.tournament;
          const remotePlayers: Player[] = tour?.players?.map((p: any) => ({ id: String(p.player_id || p.id), name: p.display_name || p.name })) || [];
          setPlayers(remotePlayers);
          setNameEntry("");
          setErrorMessage(null);
          return;
        } catch (err: any) {
          console.warn("Server add-player failed:", err);
          setErrorMessage(err?.response?.data?.message || 'Failed to add player on server');
          return;
        }
      }

      const p: Player = { id: String(matched.id), name: matched.username, local: true };
      setPlayers((s) => [...s, p]);
      setNameEntry("");
      setErrorMessage(null);
    } catch (err: any) {
      console.warn("User lookup failed:", err);
      setErrorMessage("Failed to validate username");
    }
  };

  const initializeBracket = async () => {
    try {
      await api.post(`/tournaments/${tournamentId}/initialize`, {});
      // fetch matches from server to get DB ids and player assignments
      const res = await api.get(`/tournaments/${tournamentId}/matches`);
      const matches = res.data?.matches || [];
      const nextState: Record<string, Match> = {};
      matches.forEach((m: any) => {
        const pa = players.find((p) => String(p.id) === String(m.player_a_id)) || { id: String(m.player_a_id), name: m.player_a_name || 'Player' };
        const pb = players.find((p) => String(p.id) === String(m.player_b_id)) || { id: String(m.player_b_id), name: m.player_b_name || 'Player' };
        const key = `${m.stage}-${m.match_number}`;
        nextState[key] = { a: pa, b: pb, status: m.status || 'idle', winnerId: m.winner_id, loserId: m.loser_id, dbId: m.id } as any;
      });
      setMatchesState((s) => ({ ...s, ...nextState }));
      setBracketReady(true);
      setErrorMessage(null);
    } catch (err: any) {
      console.warn("Server bracket init failed:", err);
      // If this tournament is server-backed, do not fallback to a local-only bracket
      // (server matches won't have DB ids which are required to start matches).
      if (!String(tournamentId).startsWith('local-')) {
        const msg = err?.response?.data?.message || '';
        // If bracket already exists, hydrate from server instead of erroring out
        if (typeof msg === 'string' && msg.toLowerCase().includes('already initialized')) {
          try {
            await hydrateMatches(players);
            setErrorMessage(null);
          } catch (fetchErr) {
            setErrorMessage(err?.response?.data?.message || 'Failed to initialize bracket on server');
          }
        } else {
          setErrorMessage(err?.response?.data?.message || 'Failed to initialize bracket on server');
        }
        return;
      }

      // Local-only flow: create client-side matches when running in local mode
      const idxA = 0, idxB = 1, idxC = 2, idxD = 3;
      const a = players[idxA], b = players[idxB], c = players[idxC], d = players[idxD];
      setMatchesState({
        'semi-1': { a, b, status: 'idle' },
        'semi-2': { a: c, b: d, status: 'idle' },
      });
      setBracketReady(true);
    }
  };

  const requestStartMatch = async (a: Player, b: Player, key: string) => {
    try {
      if (!String(tournamentId).startsWith('local-')) {
        if (!currentUser || !currentUser.id) {
          setErrorMessage('Must be logged in to start matches');
          return;
        }
        if (!tournamentInfo || tournamentInfo.creator_id !== currentUser.id) {
          setErrorMessage('Only the tournament creator can start matches from server');
          return;
        }

        // find DB id for this match
        const match = (matchesState[key] as any) || (matchesState as any)[key];
        const dbId = match?.dbId;
        if (!dbId) {
          setErrorMessage('Server match id not found');
          return;
        }

        const resp = await api.post(`/tournaments/${tournamentId}/start-match`, { matchId: dbId });
        const matchInfo = resp.data?.match;
        setErrorMessage(null);
        // navigate host to LocalPong with useful params
        const q = `?t=${encodeURIComponent(String(tournamentId))}&m=${encodeURIComponent(String(dbId))}&p1=${encodeURIComponent(String(a.id))}&p2=${encodeURIComponent(String(b.id))}&n1=${encodeURIComponent(a.name)}&n2=${encodeURIComponent(b.name)}`;
        router.push(`/Home/Games/LocalPong${q}`);
        // mark UI match as in_progress
        setMatchesState((s) => ({ ...s, [key]: { ...(s as any)[key], status: 'in_progress' } }));
        return;
      } else {
        // local mode: just open local Pong
        const q = `?t=local&m=${encodeURIComponent(String(Date.now()))}&p1=${encodeURIComponent(String(a.id))}&p2=${encodeURIComponent(String(b.id))}&n1=${encodeURIComponent(a.name)}&n2=${encodeURIComponent(b.name)}`;
        router.push(`/Home/Games/LocalPong${q}`);
      }
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Failed to start match');
    }
  };

  const resolveMatch = async (matchId: string, winnerId: string) => {
    const match = matchesState[matchId];
    if (!match || !match.a || !match.b) {
      setErrorMessage("Match data missing");
      return;
    }

    const loser = match.a.id === winnerId ? match.b : match.a;
    const winner = match.a.id === winnerId ? match.a : match.b;

    setMatchesState((prev) => {
      const next = { ...prev, [matchId]: { ...prev[matchId], winnerId, loserId: loser.id, status: 'finished' } };

      // Check if both semis finished
      const s1 = next['semi-1'], s2 = next['semi-2'];
      if (s1?.status === 'finished' && s2?.status === 'finished') {
        const w1 = s1.a?.id === s1.winnerId ? s1.a : s1.b;
        const w2 = s2.a?.id === s2.winnerId ? s2.a : s2.b;
        const l1 = s1.a?.id === s1.loserId ? s1.a : s1.b;
        const l2 = s2.a?.id === s2.loserId ? s2.a : s2.b;
        
        if (w1 && w2) next['final-1'] = { a: w1, b: w2, status: 'idle' };
        if (l1 && l2) next['third-1'] = { a: l1, b: l2, status: 'idle' };
      }

      return next;
    });

    setMatchToResolve(null);
    setErrorMessage(null);

    // Send to backend
    try {
      const serverMatchId = (match as any).dbId || null;
      if (serverMatchId) {
        await api.post(`/tournaments/${tournamentId}/result`, {
          matchId: Number(serverMatchId),
          winnerId: Number(winnerId),
          loserId: Number(loser.id),
        });
      } else {
        // fallback: try to send a non-numeric id (older local flow)
        await api.post(`/tournaments/${tournamentId}/result`, {
          matchId: matchId,
          winnerId: winnerId,
          loserId: loser.id,
        });
      }
      // force refresh to clear in_progress after result
      try {
        await hydrateMatches(players);
      } catch (err) {
        // ignore
      }
    } catch (err: any) {
      console.warn("Could not save to server:", err.message);
    }
  };

  const startMatch = (matchId: string) => {
    if (!bracketReady && !matchId.startsWith('semi')) {
      setErrorMessage("Bracket not initialized");
      return;
    }
    const match = matchesState[matchId];
    if (!match || !match.a || !match.b) {
      setErrorMessage("Match not ready");
      return;
    }
    
    const dialog = confirm(`Start match: ${match.a.name} vs ${match.b.name}?`);
    if (dialog) {
      requestStartMatch(match.a, match.b, matchId);
    }
  };

  const completeTournament = async () => {
    const f = matchesState['final-1'];
    const t = matchesState['third-1'];
    
    if (!f?.winnerId || !f?.loserId || !t?.winnerId || !t?.loserId) {
      setErrorMessage("All matches must be completed first");
      return;
    }

    try {
      await api.post(`/tournaments/${tournamentId}/complete`, {
        winnerId: f.winnerId,
        runnerUpId: f.loserId,
        thirdId: t.winnerId,
        fourthId: t.loserId,
      });
      setTournamentComplete(true);
      setErrorMessage(null);
    } catch (err: any) {
      console.warn("Could not save completion:", err.message);
      setTournamentComplete(true);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><div className="text-lg">Loading tournament...</div></div>;
  }

  if (tournamentComplete) {
    const f = matchesState['final-1'];
    const t = matchesState['third-1'];
    return (
      <div className="max-w-3xl mx-auto mt-8 p-4">
        <h2 className="text-3xl font-bold text-center mb-8">🏆 Tournament Results</h2>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-6 bg-yellow-100 rounded-lg text-center border-2 border-yellow-500">
            <div className="text-sm text-gray-600 mb-2">🥇 1st Place</div>
            <div className="text-2xl font-bold text-yellow-800">{f?.a?.id === f?.winnerId ? f.a.name : f?.b?.name}</div>
          </div>
          <div className="p-6 bg-gray-100 rounded-lg text-center border-2 border-gray-500">
            <div className="text-sm text-gray-600 mb-2">🥈 2nd Place</div>
            <div className="text-2xl font-bold text-gray-800">{f?.a?.id === f?.loserId ? f.a.name : f?.b?.name}</div>
          </div>
          <div className="p-6 bg-orange-100 rounded-lg text-center border-2 border-orange-500">
            <div className="text-sm text-gray-600 mb-2">🥉 3rd Place</div>
            <div className="text-2xl font-bold text-orange-800">{t?.a?.id === t?.winnerId ? t.a.name : t?.b?.name}</div>
          </div>
          <div className="p-6 bg-blue-100 rounded-lg text-center border-2 border-blue-500">
            <div className="text-sm text-gray-600 mb-2">4th Place</div>
            <div className="text-2xl font-bold text-blue-800">{t?.a?.id === t?.loserId ? t.a.name : t?.b?.name}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <h2 className="text-2xl font-semibold mb-6">Tournament Lobby — {tournamentId}</h2>
      {creatorName && (
        <div className="text-sm text-gray-600 mb-4">Creator: {creatorName}</div>
      )}

      {errorMessage && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      {/* Players Grid */}
      <div className="mb-8 bg-white/50 rounded-lg p-4 border">
        <h3 className="font-semibold mb-4">Players ({players.length}/4)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {players.map((p, i) => (
            <div key={p.id} className="p-3 bg-purple-100 rounded-lg border-2 border-purple-300 text-center">
              <div className="font-medium text-gray-900">{p.name}</div>
              <div className="text-xs text-gray-600">{i + 1}</div>
            </div>
          ))}
          {players.length < 4 && (
            <div className="p-3 border-2 border-dashed rounded-lg flex flex-col gap-2">
              <input 
                value={nameEntry} 
                onChange={(e) => setNameEntry(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addLocalPlayer()}
                placeholder="Name" 
                className="px-2 py-1 rounded text-sm text-center" 
              />
              <button onClick={addLocalPlayer} className="px-2 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">Add</button>
            </div>
          )}
        </div>
        {players.length === 4 && !bracketReady && (
          <button onClick={initializeBracket} className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Initialize Bracket
          </button>
        )}
      </div>

      {/* Bracket */}
      {bracketReady && (
        <div className="mb-8 bg-white/50 rounded-lg p-4 border">
          <h3 className="font-semibold mb-4">Tournament Bracket</h3>
          
          {/* Semi-Finals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {['semi-1', 'semi-2'].map((semiId) => {
              const m = matchesState[semiId];
              return (
                <div key={semiId} className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
                  <div className="font-bold text-sm text-blue-900 mb-3">
                    {semiId === 'semi-1' ? 'Semi-Final 1 (1v2)' : 'Semi-Final 2 (3v4)'}
                  </div>
                  {m && m.a && m.b ? (
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className={m.winnerId === m.a.id ? 'font-bold text-green-700' : ''}>{m.a.name}</span>
                        <span className="text-gray-500">vs</span>
                        <span className={m.winnerId === m.b.id ? 'font-bold text-green-700' : ''}>{m.b.name}</span>
                      </div>
                      <div className="flex gap-2 justify-between">
                        <button 
                          onClick={() => startMatch(semiId)} 
                          disabled={m.status !== 'idle' || (!String(tournamentId).startsWith('local-') && tournamentInfo && currentUser?.id !== tournamentInfo.creator_id)}
                          className="flex-1 px-2 py-1 rounded text-sm bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {m.status === 'idle' ? 'Start' : m.status}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">Waiting for players...</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Finals */}
          {matchesState['final-1'] && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['final-1', 'third-1'].map((matchId) => {
                const m = matchesState[matchId];
                const title = matchId === 'final-1' ? 'Grand Final' : '3rd Place Match';
                const bgColor = matchId === 'final-1' ? 'from-amber-50 to-amber-100' : 'from-slate-50 to-slate-100';
                const titleColor = matchId === 'final-1' ? 'text-amber-900' : 'text-slate-900';

                return (
                  <div key={matchId} className={`p-4 border rounded-lg bg-gradient-to-r ${bgColor}`}>
                    <div className={`font-bold text-sm ${titleColor} mb-3`}>{title}</div>
                    {m && m.a && m.b ? (
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className={m.winnerId === m.a.id ? 'font-bold text-green-700' : ''}>{m.a.name}</span>
                          <span className="text-gray-500">vs</span>
                          <span className={m.winnerId === m.b.id ? 'font-bold text-green-700' : ''}>{m.b.name}</span>
                        </div>
                        <button 
                          onClick={() => startMatch(matchId)} 
                          disabled={m.status !== 'idle' || (!String(tournamentId).startsWith('local-') && tournamentInfo && currentUser?.id !== tournamentInfo.creator_id)}
                          className="w-full px-2 py-1 rounded text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {m.status === 'idle' ? 'Start' : m.status}
                        </button>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">Waiting...</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {matchesState['final-1']?.status === 'finished' && matchesState['third-1']?.status === 'finished' && (
            <button 
              onClick={completeTournament}
              className="w-full mt-6 px-4 py-3 bg-purple-600 text-white font-bold rounded hover:bg-purple-700"
            >
              Complete Tournament 🏆
            </button>
          )}
        </div>
      )}

      {/* OTP flow removed — matches start immediately by creator */}

      {/* Match Resolution Modal */}
      {matchToResolve && matchesState[matchToResolve] && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Who won?</h3>
            <div className="mb-6 text-center">
              <div className="font-semibold">{matchesState[matchToResolve].a?.name} vs {matchesState[matchToResolve].b?.name}</div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => resolveMatch(matchToResolve, matchesState[matchToResolve].a!.id)} 
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
              >
                {matchesState[matchToResolve].a?.name} 🏆
              </button>
              <button 
                onClick={() => resolveMatch(matchToResolve, matchesState[matchToResolve].b!.id)} 
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
              >
                {matchesState[matchToResolve].b?.name} 🏆
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
