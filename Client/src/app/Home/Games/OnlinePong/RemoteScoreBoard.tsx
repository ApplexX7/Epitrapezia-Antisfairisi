"use client";
import Image from "next/image";
import React from "react";
import { useAuth } from "@/components/hooks/authProvider";

type RemoteGameState = {
  ball: { x: number; y: number };
  paddles: Record<string, number>;
  playerOrder?: number[];
  scores?: Record<string, number>;
};

type ScoreBarProps = {
  gameState: RemoteGameState;
  rightPlayer: string;
  leftPlayer: string;
  role: "left" | "right" | null;
  leftAvatar : string;
  rightAvatar : string;
};

export default function RemoteScoreBoard({
  gameState,
  rightPlayer,
  leftPlayer,
  role,
  leftAvatar,
  rightAvatar
}: ScoreBarProps) {
  const { user } = useAuth();
  const imageWidth = 100;

  const leftId = gameState.playerOrder ? String(gameState.playerOrder[0]) : null;
  const rightId = gameState.playerOrder ? String(gameState.playerOrder[1]) : null;
  const scores = gameState.scores ?? {};
  const leftScore = leftId ? scores[leftId] ?? 0 : 0;
  const rightScore = rightId ? scores[rightId] ?? 0 : 0;

  const isLeft = role === "left";
const myName = user?.username ?? "";
const opponentName = leftPlayer === myName || rightPlayer === myName
  ? (leftPlayer === myName ? rightPlayer : leftPlayer)
  : leftPlayer; // fallback

const leftName = isLeft ? myName : opponentName;
const rightName = isLeft ? opponentName : myName;

// const leftAvatar = isLeft ? myAvatar : opponentAvatar;
// const rightAvatar = isLeft ? opponentAvatar : myAvatar;


  return (
    <div
      className="relative"
      style={{
        width: "38vw",
        height: "7vh",
        position: "absolute",
        left: "50%",
        top: "5vh",
        transform: "translateX(-50%)",
        maxWidth: "650px",
        maxHeight: "109px",
        zIndex: 10,
      }}
    >
      <div className="bg-white/20 backdrop-blur-sm rounded-lg w-full h-full relative">
        <span
          className="absolute top-1/2 -translate-y-1/2 font-bold"
          style={{ left: `${imageWidth / 2 + 10}px` }}
        >
          {leftName}
        </span>

        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-extrabold text-lg">
          {leftScore}-{rightScore}
        </span>

        <span
          className="absolute top-1/2 -translate-y-1/2 font-bold"
          style={{ right: `${imageWidth / 2 + 10}px` }}
        >
          {rightName}
        </span>
      </div>

      <div className="absolute top-0 left-0 h-full -translate-x-1/2 flex items-center">
        <Image
          src={leftAvatar || "/images/default.png"}
          alt="Left player"
          width={imageWidth}
          height={100}
          style={{ height: "100%", width: "auto", objectFit: "contain" }}
          className="rounded-full"
        />
      </div>
      <div className="absolute top-0 right-0 h-full translate-x-1/2 flex items-center">
        <Image
          src={rightAvatar || "/images/default.png"}
          alt="Right player"
          width={imageWidth}
          height={100}
          style={{ height: "100%", width: "auto", objectFit: "contain" }}
          className="rounded-full"
        />
      </div>
    </div>
  );
}
