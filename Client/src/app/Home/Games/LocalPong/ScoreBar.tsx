'use client'
import Image from "next/image";
import React from "react";

type ScoreBarProps = {
  playerOneScore: number;
  playerTwoScore: number;
  playerOneName?: string;
  playerTwoName?: string;
  playerOneAvatar?: string;
  playerTwoAvatar?: string;
};

export default function ScoreBar({
  playerOneScore,
  playerTwoScore,
  playerOneName,
  playerTwoName,
  playerOneAvatar,
  playerTwoAvatar,
}: ScoreBarProps) {
  const p1Name = playerOneName || "Player 1";
  const p2Name = playerTwoName || "Player 2";

  const imageWidth = 100;

  return (
    <div
      className="relative "
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
          {p1Name}
        </span>

        <span
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-extrabold text-lg"
        >
          {playerOneScore}-{playerTwoScore}
        </span>

        <span
          className="absolute top-1/2 -translate-y-1/2 font-bold"
          style={{ right: `${imageWidth / 2 + 10}px` }}
        >
          {p2Name}
        </span>
      </div>

      <div className="absolute top-0 left-0 h-full -translate-x-1/2 flex items-center">
        <Image
          src={playerOneAvatar || "/images/player1.png"}
          alt="Player 1"
          width={imageWidth}
          height={100}
          style={{ height: "100%", width: "auto", objectFit: "contain" }}
          className="rounded-full"
        />
      </div>

      <div className="absolute top-0 right-0 h-full translate-x-1/2 flex items-center">
        <Image
          src={playerTwoAvatar || "/images/player2.png"}
          alt="Player 2"
          width={imageWidth}
          height={100}
          style={{ height: "100%", width: "auto", objectFit: "contain" }}
          className="rounded-full"
        />
      </div>
    </div>
  );
}
