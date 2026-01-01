"use client"
import React, { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Board from "./Board";
import ScoreBar from "./ScoreBar";
import GameCostum from "./GameCostum";
import OpenGameCostumButton from './OpenGameCostumButton';
export default function LocalPong() {
    let [rightPlayerScore, setRightPlayerScore] = useState(0);
    let [leftPlayerScore, setLeftPlayerScore] = useState(0);
    let [boardColor, setBoardColor] = useState("default");
    let [ballColor, setBallColor] = useState("default");
    let [paddleColor, setPaddleColor] = useState("default");
    let [gameDiff, setGameDiff] = useState("easy");
    let [openSettings, setOpenSettings] = useState(true);
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
              } as any;

              try {
                  if (isTournamentGame) {
                      await api.post(`/tournaments/${t}/result`, payload);
                  }
                  setReportError(null);
              } catch (e: any) {
                  console.warn('Failed to report match result', e);
                  setReportError(e?.response?.data?.message || 'Failed to report result');
              } finally {
                  setResultReported(true);
                  if (isTournamentGame) setRedirectCountdown(3);
              }
          }, [t, m, p1, p2, router, isTournamentGame]);

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
                    const [a, b] = await Promise.all([
                        p1 ? api.get(`/userInfo/${p1}`) : Promise.resolve(null),
                        p2 ? api.get(`/userInfo/${p2}`) : Promise.resolve(null),
                    ]);
                    const aAvatar = (a as any)?.data?.user?.avatar;
                    const bAvatar = (b as any)?.data?.user?.avatar;
                    if (aAvatar) setPlayerOneAvatar(aAvatar);
                    if (bAvatar) setPlayerTwoAvatar(bAvatar);
                } catch (e) {
                    // keep defaults
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