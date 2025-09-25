'use client'
import Image from "next/image";

export default function ScoreBar() {
  const playerOneScore = 4;
  const playerTwoScore = 5;
  const playerOneName = "asedoun";
  const playerTwoName = "asedoun";

  const imageWidth = 100;

  return (
    <div
      className="relative"
      style={{
        width: "38vw",
        height: "7vh",
        marginLeft: "34vw",
        marginTop: "8vh",
        maxWidth: "650px",
        maxHeight: "109px",
      }}
    >
      <div className="bg-white/20 backdrop-blur-sm rounded-lg w-full h-full relative">
        <span
          className="absolute top-1/2 -translate-y-1/2 font-bold"
          style={{ left: `${imageWidth / 2 + 10}px` }}
        >
          {playerOneName}
        </span>

        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-extrabold text-lg">
          {playerOneScore}-{playerTwoScore}
        </span>

        <span
          className="absolute top-1/2 -translate-y-1/2 font-bold"
          style={{ right: `${imageWidth / 2 + 10}px` }}
        >
          {playerTwoName}
        </span>
      </div>

      <div className="absolute top-0 left-0 h-full -translate-x-1/2 flex items-center">
        <Image
          src="/images/player1.png"
          alt="Player 1"
          width={imageWidth}
          height={100}
          style={{ height: "100%", width: "auto", objectFit: "contain" }}
          className="rounded-full"
        />
      </div>

      <div className="absolute top-0 right-0 h-full translate-x-1/2 flex items-center">
        <Image
          src="/images/player2.png"
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
