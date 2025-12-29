"use client"
import React, { useState, useCallback } from "react";
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
        const search = useSearchParams();
        const router = useRouter();
        const t = search.get('t');
        const m = search.get('m');
        const p1 = search.get('p1');
        const p2 = search.get('p2');

        const [resultReported, setResultReported] = useState(false);
        const [reportError, setReportError] = useState<string | null>(null);

        const onGameEnd = useCallback(async (winner: "playerOne" | "playerTwo") => {
            const winnerId = winner === 'playerOne' ? p1 : p2;
            const loserId = winner === 'playerOne' ? p2 : p1;
            if (!winnerId || !loserId) {
                setReportError('Missing player ids for result reporting');
                setResultReported(true);
                return;
            }
            try {
                if (t && t !== 'local' && m) {
                    await api.post(`/tournaments/${t}/result`, { matchId: Number(m), winnerId: Number(winnerId), loserId: Number(loserId) });
                }
                setReportError(null);
            } catch (e: any) {
                console.warn('Failed to report match result', e);
                setReportError(e?.response?.data?.message || 'Failed to report result');
            } finally {
                setResultReported(true);
                // Immediately return to tournament lobby when applicable
                if (t && t !== 'local') router.push(`/Home/Games/Tournament/lobby/${t}`);
            }
        }, [t, m, p1, p2, router]);

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
                        onClick={() => router.push('/Home/Games/Tournament')}
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