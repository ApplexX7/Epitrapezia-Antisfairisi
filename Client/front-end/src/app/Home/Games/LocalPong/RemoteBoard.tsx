"use client";
import React from "react";

type RemoteGameState = {
  ball: { x: number; y: number };
  paddles: Record<string, number>;
  playerOrder?: number[];
  scores?: Record<string, number>;
};

type RemoteBoardProps = {
  gameState: RemoteGameState;
  role: "left" | "right" | null;
  userId?: number | null;
  _boardColor?: string;
  _ballColor?: string;
  _paddleColor?: string;
  winnerMessage?: string | null;
};

export default function RemoteBoard({
  gameState,
  role,
  userId,
  _boardColor = "default",
  _ballColor = "default",
  _paddleColor = "default",
  winnerMessage = null,
}: RemoteBoardProps) {
  const ball = gameState.ball ?? { x: 0, y: 0 };
  const paddles = gameState.paddles ?? {};

  // Decide left/right mapping using server-provided playerOrder when available.
  const leftId = gameState.playerOrder ? String(gameState.playerOrder[0]) : null;
  const rightId = gameState.playerOrder ? String(gameState.playerOrder[1]) : null;

  // Fallback: if playerOrder missing, try to infer from role and userId
  const ownIdStr = userId != null ? String(userId) : null;

  const leftOffset = leftId ? paddles[leftId] ?? 0 : ownIdStr && role === "left" ? paddles[ownIdStr] ?? 0 : Object.values(paddles)[0] ?? 0;
  const rightOffset = rightId ? paddles[rightId] ?? 0 : ownIdStr && role === "right" ? paddles[ownIdStr] ?? 0 : Object.values(paddles)[1] ?? 0;

  // Scores
  const scores = gameState.scores ?? {};
  const leftScore = leftId ? scores[String(leftId)] ?? 0 : 0;
  const rightScore = rightId ? scores[String(rightId)] ?? 0 : 0;

  return (
    <div
      className="relative m-auto w-[80vw] h-[75vh]"
      style={{
        backgroundColor:
          _boardColor === "default"
            ? "#0A0F2A"
            : _boardColor === "blue"
            ? "blue"
            : _boardColor === "black"
            ? "black"
            : _boardColor === "red"
            ? "firebrick"
            : "#0A0F2A",
      }}
    >
      <div className="relative w-full h-full">
        {/* Left paddle */}
        <div
          className="absolute left-0 top-1/2 w-[19px] h-[20%] rounded-sm z-20"
          style={{
            backgroundColor:
              _paddleColor === "default"
                ? "#FF007F"
                : _paddleColor === "white"
                ? "white"
                : _paddleColor === "green"
                ? "green"
                : _paddleColor === "yellow"
                ? "yellow"
                : "#FF007F",
            transform: `translateY(-50%) translateY(${leftOffset}px)`,
            transition: "transform 80ms linear",
          }}
        ></div>

        <div className="absolute left-1/2 top-0 h-full w-[0.5%] -translate-x-1/2 bg-white-smoke z-20"></div>

        {/* Ball */}
        <div
          className="absolute left-1/2 top-1/2 w-[24px] h-[24px] rounded-full z-20"
          style={{
            backgroundColor:
              _ballColor === "default"
                ? "#FF007F"
                : _ballColor === "white"
                ? "white"
                : _ballColor === "green"
                ? "green"
                : _ballColor === "yellow"
                ? "yellow"
                : "#FF007F",
            transform: `translate(-50%, -50%) translate(${ball.x}px, ${ball.y}px)`,
          }}
        ></div>

        {/* Right paddle */}
        <div
          className="absolute right-0 top-1/2 w-[19px] h-[20%] rounded-sm z-20"
          style={{
            backgroundColor:
              _paddleColor === "default"
                ? "#FF007F"
                : _paddleColor === "white"
                ? "white"
                : _paddleColor === "green"
                ? "green"
                : _paddleColor === "yellow"
                ? "yellow"
                : "#FF007F",
            transform: `translateY(-50%) translateY(${rightOffset}px)`,
            transition: "transform 80ms linear",
          }}
        ></div>

        {/* Scores */}
        <div className="absolute left-4 top-4 text-white z-30 font-bold text-2xl">{leftScore}</div>
        <div className="absolute right-4 top-4 text-white z-30 font-bold text-2xl">{rightScore}</div>

        {/* Victory overlay */}
        {winnerMessage && (
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center z-40">
            <video className="absolute top-0 left-0 w-full h-full object-cover z-0" autoPlay muted loop>
              <source src="/lost.mp4" type="video/mp4" />
            </video>
            <p className="text-white font-extrabold text-[6vw] z-50 text-center">{winnerMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
