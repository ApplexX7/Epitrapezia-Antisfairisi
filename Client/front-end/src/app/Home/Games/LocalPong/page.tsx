'use client'
import React, { useState } from "react";
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
     />
     </>
    );
}