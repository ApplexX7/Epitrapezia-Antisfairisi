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

        const onGameEnd = useCallback(async (winner: "playerOne" | "playerTwo") => {
            // map winner to player id
            const winnerId = winner === 'playerOne' ? p1 : p2;
            const loserId = winner === 'playerOne' ? p2 : p1;
            try {
                if (t && t !== 'local' && m) {
                    await api.post(`/tournaments/${t}/result`, { matchId: Number(m), winnerId: Number(winnerId), loserId: Number(loserId) });
                    // create finals if ready happens on server
                }
            } catch (e) {
                console.warn('Failed to report match result', e);
            } finally {
                // navigate back to tournament lobby if possible
                if (t && t !== 'local') router.push(`/Home/Games/Tournament/lobby/${t}`);
                else router.push('/Home/Games/Tournament');
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
     />
     </>
    );
}