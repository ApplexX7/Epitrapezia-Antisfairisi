"use client"
import React, { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Board from "./Board";
import ScoreBar from "./ScoreBar";
import GameCostum from "./GameCostum";
import OpenGameCostumButton from './OpenGameCostumButton';
export default function LocalPong() {
    const [rightPlayerScore, setRightPlayerScore] = useState(0);
    const [leftPlayerScore, setLeftPlayerScore] = useState(0);
    const [boardColor, setBoardColor] = useState("default");
    const [ballColor, setBallColor] = useState("default");
    const [paddleColor, setPaddleColor] = useState("default");
    const [gameDiff, setGameDiff] = useState("easy");
    const [openSettings, setOpenSettings] = useState(true);
        const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
        const search = useSearchParams();
        const router = useRouter();
        const t = search.get('t');
        const m = search.get('m');
        const p1 = search.get('p1');
        const p2 = search.get('p2');
        const n1 = search.get('n1');
        const n2 = search.get('n2');
        const isTournamentGame = !!(t && t !== 'local');

        const [playerOneName, setPlayerOneName] = useState<string>(n1 || 'Player 1');
        const [playerTwoName, setPlayerTwoName] = useState<string>(n2 || 'Player 2');
        const [playerOneAvatar, setPlayerOneAvatar] = useState<string | null>(null);
        const [playerTwoAvatar, setPlayerTwoAvatar] = useState<string | null>(null);

        const [resultReported, setResultReported] = useState(false);
        const [reportError, setReportError] = useState<string | null>(null);

          const goToTournament = useCallback(() => {
              if (isTournamentGame) return router.replace(`/Home/Games/Tournament/lobby/${t}`);
              return router.replace('/Home/Games/Tournament');
          }, [isTournamentGame, router, t]);

          const onGameEnd = useCallback(async (winner: "playerOne" | "playerTwo") => {
              const winnerId = winner === 'playerOne' ? p1 : p2;
              const loserId = winner === 'playerOne' ? p2 : p1;
              if (!winnerId || !loserId) {
                  setReportError('Missing player ids for result reporting');
                  setResultReported(true);
                  if (isTournamentGame) setRedirectCountdown(3);
                    return;
              }

              const matchIdNum = m ? Number(m) : null;
              const payload = {
                matchId: matchIdNum && !Number.isNaN(matchIdNum) ? matchIdNum : m,
                winnerId: Number(winnerId) || winnerId,
                loserId: Number(loserId) || loserId,
              };

              try {
                  if (isTournamentGame) {
                      await api.post(`/tournaments/${t}/result`, payload);
                  }
                  setReportError(null);
              } catch (_e) {
                  const error = _e as { response?: { data?: { message?: string } } };
                  console.warn('Failed to report match result', _e);
                  setReportError(error?.response?.data?.message || 'Failed to report result');
              } finally {
                  setResultReported(true);
                  if (isTournamentGame) setRedirectCountdown(3);
              }
          }, [t, m, p1, p2, isTournamentGame]);

        useEffect(() => {
            if (!isTournamentGame || !resultReported) return;
            if (redirectCountdown === null) setRedirectCountdown(3);
        }, [isTournamentGame, resultReported, redirectCountdown]);

        useEffect(() => {
            if (redirectCountdown === null) return;
            if (redirectCountdown <= 0) return goToTournament();

            const timer = setTimeout(() => {
                setRedirectCountdown((prev) => (prev === null ? prev : prev - 1));
            }, 1000);

            return () => clearTimeout(timer);
        }, [redirectCountdown, goToTournament]);

        // Keep names in sync with URL (tournament passes n1/n2)
        useEffect(() => {
            if (n1) setPlayerOneName(n1);
            if (n2) setPlayerTwoName(n2);
        }, [n1, n2]);

        // Fetch avatars for tournament players by id
        useEffect(() => {
            const loadAvatars = async () => {
                try {
                    const extractAvatar = (res: { data?: { avatar?: string; user?: { avatar?: string }; userInof?: { avatar?: string }; userInfo?: { avatar?: string } } } | null): string | null => {
                        const d = res?.data;
                        return (
                            d?.avatar ??
                            d?.user?.avatar ??
                            d?.userInof?.avatar ??
                            d?.userInfo?.avatar ??
                            null
                        );
                    };

                    const fetchUser = async (id: string) => {
                        try {
                            // Backend route: GET /user/:id
                            return await api.get(`/user/${id}`);
                        } catch {
                            // Fallback (some older client code uses this path)
                            return await api.get(`/userInfo/${id}`);
                        }
                    };

                    const [a, b] = await Promise.all([
                        p1 ? fetchUser(p1) : Promise.resolve(null),
                        p2 ? fetchUser(p2) : Promise.resolve(null),
                    ]);

                    const aAvatar = extractAvatar(a);
                    const bAvatar = extractAvatar(b);
                    if (aAvatar) setPlayerOneAvatar(aAvatar);
                    if (bAvatar) setPlayerTwoAvatar(bAvatar);
                } catch (__e) {
                    void __e; // swallow
                }
            };
            if (p1 || p2) loadAvatars();
        }, [p1, p2]);

    // Fallback: if Board misses the end callback, detect win state from scores and trigger finish
    useEffect(() => {
        if (resultReported) return;
        const leftLead = leftPlayerScore - rightPlayerScore;
        const rightLead = rightPlayerScore - leftPlayerScore;
        if (rightPlayerScore > 5 && rightLead >= 2) {
            onGameEnd('playerOne');
        } else if (leftPlayerScore > 5 && leftLead >= 2) {
            onGameEnd('playerTwo');
        }
    }, [leftPlayerScore, rightPlayerScore, onGameEnd, resultReported]);

          return (
       <>
     <OpenGameCostumButton
        isOpen = {openSettings}
        setIsOpen={setOpenSettings}
    />
     <GameCostum 
     currentBoard = {boardColor}
     currentBall = {ballColor}
     currentPaddle = {paddleColor}
     currentDiff = {gameDiff}
     setCurrentBall={setBallColor}
     setCurrentBoard={setBoardColor}
     setCurrentDiff={setGameDiff}
     setCurrentPaddle={setPaddleColor}
     isOpen = {openSettings}
     setIsOpen={setOpenSettings}
     />
     <ScoreBar 
     playerOneScore = {rightPlayerScore}
     playerTwoScore = {leftPlayerScore}
    playerOneName={playerOneName}
    playerTwoName={playerTwoName}
    playerOneAvatar={playerOneAvatar || undefined}
    playerTwoAvatar={playerTwoAvatar || undefined}
     />
          <Board 
      playerOneScore = {rightPlayerScore}
      playerTwoScore= {leftPlayerScore}
      setPlayerOneScore = {setRightPlayerScore}
      setPlayerTwoScore = {setLeftPlayerScore}
      _boardColor = {boardColor}
      _ballColor = {ballColor}
      _paddleColor = {paddleColor}
      _gameDiff = {gameDiff}
          onGameEnd={onGameEnd}
          showStartButton={!resultReported}
      />
          {resultReported && isTournamentGame && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full text-center space-y-4">
                    <h3 className="text-lg font-bold">Match finished</h3>
                    {reportError ? (
                        <p className="text-red-600 text-sm">{reportError}</p>
                    ) : (
                        <p className="text-gray-700 text-sm">Returning to the tournament lobby{redirectCountdown !== null ? ` in ${redirectCountdown}s` : ''}.</p>
                    )}
                    <button
                        onClick={goToTournament}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                        Go to tournament lobby
                    </button>
                </div>
            </div>
        )}
        {resultReported && !t && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full text-center space-y-4">
                    <h3 className="text-lg font-bold">Match finished</h3>
                    {reportError ? (
                        <p className="text-red-600 text-sm">{reportError}</p>
                    ) : (
                        <p className="text-gray-700 text-sm">Result recorded.</p>
                    )}
                    <button
                        onClick={goToTournament}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                        Return to tournament
                    </button>
                </div>
            </div>
        )}
     </>
    );
}