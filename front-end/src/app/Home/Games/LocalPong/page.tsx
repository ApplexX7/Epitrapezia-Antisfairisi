'use client'
import React, { useState } from "react";
import Board from "./Board";
import ScoreBar from "./ScoreBar";

export default function LocalPong() {
    let [rightPlayerScore, setRightPlayerScore] = useState(0);
    let [leftPlayerScore, setLeftPlayerScore] = useState(0);
    return (
     <>
     <ScoreBar 
     playerOneScore = {rightPlayerScore}
     playerTwoScore = {leftPlayerScore}
     />
     <Board 
     playerOneScore = {rightPlayerScore}
     playerTwoScore= {leftPlayerScore}
     setPlayerOneScore = {setRightPlayerScore}
     setPlayerTwoScore = {setLeftPlayerScore}
     />
     </>
    );
  }