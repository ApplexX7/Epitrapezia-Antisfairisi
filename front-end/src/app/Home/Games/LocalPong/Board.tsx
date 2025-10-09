"use client";
import React, { useEffect, useRef, useState } from "react";

type BoardProps = {
  playerOneScore: number;
  playerTwoScore: number;
  setPlayerOneScore: React.Dispatch<React.SetStateAction<number>>;
  setPlayerTwoScore: React.Dispatch<React.SetStateAction<number>>;
};

export default function Board({
  playerOneScore,
  playerTwoScore,
  setPlayerOneScore,
  setPlayerTwoScore,
}: BoardProps) {
  let lostPlayer;
  let step = 7;
  const boardRef = useRef<HTMLDivElement | null>(null);
  const leftPaddleRef = useRef<HTMLDivElement | null>(null);
  const rightPaddleRef = useRef<HTMLDivElement | null>(null);
  const ballRef = useRef<HTMLDivElement | null>(null);
  const dxRef = useRef(3);
  const dyRef = useRef(3);
  const ballXRef = useRef(0);
  const ballYRef = useRef(0);
  const leftPaddlePosRef = useRef(0);
  const rightPaddlePosRef = useRef(0);
  let nextX = 0;
  let nextY = 0;

  const [startGame, setStartGame] = useState(false);
  const [startGameCounter, setStartGameCounter] = useState(5);
  const [leftPaddleOffset, setLeftPaddleOffset] = useState(0);
  const [rightPaddleOffset, setRightPaddleOffset] = useState(0);
  const [ballOffsetY, setBallOffsetY] = useState(0);
  const [ballOffsetX, setBallOffsetX] = useState(0);
  const [bounds, setBounds] = useState({ min: 0, max: 0 });
  const [ballLimits, setBallLimits] = useState({
    topMax: 0,
    bottomMax: 0,
    leftMax: 0,
    rightMax: 0,
  });

  const [showVictoryVideo, setShowVictoryVideo] = useState(false);

  const handleGameStartClick = () => {
    setStartGame(true);
  };

  useEffect(() => {
    if (startGameCounter <= 0 || !startGame) return;
    const intervalId = setInterval(() => {
      setStartGameCounter((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [startGameCounter, startGame]);

  useEffect(() => {
    function updateBounds() {
      const board = boardRef.current;
      const paddle = leftPaddleRef.current ?? rightPaddleRef.current;
      const ball = ballRef.current;
      if (!board || !paddle || !ball) return;

      const boardH = board.clientHeight;
      const paddleH = paddle.offsetHeight;
      const halfBoard = boardH / 2;
      const halfPaddle = paddleH / 2;
      const min = -(halfBoard - halfPaddle);
      const max = halfBoard - halfPaddle;
      setBounds({ min, max });
      setLeftPaddleOffset((p) => Math.min(max, Math.max(min, p)));
      setRightPaddleOffset((p) => Math.min(max, Math.max(min, p)));

      const boardW = board.clientWidth;
      const ballW = ball.offsetWidth;
      const ballH = ball.offsetHeight;
      setBallLimits({
        topMax: -(boardH / 2 - ballH / 2),
        bottomMax: boardH / 2 - ballH / 2,
        leftMax: -(boardW / 2 - ballW / 2),
        rightMax: boardW / 2 - ballW / 2,
      });
      setBallOffsetY((p) =>
        Math.min(boardH / 2 - ballH / 2, Math.max(-(boardH / 2 - ballH / 2), p))
      );
      setBallOffsetX((p) =>
        Math.min(boardW / 2 - ballW / 2, Math.max(-(boardW / 2 - ballW / 2), p))
      );
    }

    updateBounds();
    const ro = new ResizeObserver(updateBounds);
    if (boardRef.current) ro.observe(boardRef.current);
    if (leftPaddleRef.current) ro.observe(leftPaddleRef.current);
    if (ballRef.current) ro.observe(ballRef.current);
    window.addEventListener("resize", updateBounds);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateBounds);
    };
  }, []);

  useEffect(() => {
    leftPaddlePosRef.current = leftPaddleOffset;
    rightPaddlePosRef.current = rightPaddleOffset;
  }, [leftPaddleOffset, rightPaddleOffset]);

  useEffect(() => {
    const pressedKeys = new Set<string>();
    const handleKeyDown = (e: KeyboardEvent) => {
      pressedKeys.add(e.key);
      if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
    };
    const handleKeyUp = (e: KeyboardEvent) => pressedKeys.delete(e.key);

    const loop = () => {
      let { min, max } = bounds;
      setLeftPaddleOffset((p) => {
        if (pressedKeys.has("w") || pressedKeys.has("W")) return Math.max(min, p - step);
        if (pressedKeys.has("s") || pressedKeys.has("S")) return Math.min(max, p + step);
        return p;
      });
      setRightPaddleOffset((p) => {
        if (pressedKeys.has("ArrowUp")) return Math.max(min, p - step);
        if (pressedKeys.has("ArrowDown")) return Math.min(max, p + step);
        return p;
      });
      requestAnimationFrame(loop);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    loop();
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [bounds]);

  useEffect(() => {
    if (startGameCounter > 0) return;
    const interval = setInterval(() => {
      nextY = ballYRef.current + dyRef.current;
      if (nextY >= ballLimits.bottomMax || nextY <= ballLimits.topMax) {
        dyRef.current = -dyRef.current;
        nextY = ballYRef.current + dyRef.current;
      }

      nextX = ballXRef.current + dxRef.current;

      const ball = ballRef.current;
      const leftPaddle = leftPaddleRef.current;
      const rightPaddle = rightPaddleRef.current;

      if (ball && leftPaddle && rightPaddle) {
        const ballTop = nextY - ball.offsetHeight / 2;
        const ballBottom = nextY + ball.offsetHeight / 2;
        const leftTop = leftPaddlePosRef.current - leftPaddle.offsetHeight / 2;
        const leftBottom = leftPaddlePosRef.current + leftPaddle.offsetHeight / 2;
        const rightTop = rightPaddlePosRef.current - rightPaddle.offsetHeight / 2;
        const rightBottom = rightPaddlePosRef.current + rightPaddle.offsetHeight / 2;

        if (
          nextX <= ballLimits.leftMax + leftPaddle.offsetWidth &&
          ballBottom >= leftTop &&
          ballTop <= leftBottom
        ) {
          dxRef.current = -dxRef.current;
          nextX = ballXRef.current + dxRef.current;
        } else if (
          nextX >= ballLimits.rightMax - rightPaddle.offsetWidth &&
          ballBottom >= rightTop &&
          ballTop <= rightBottom
        ) {
          dxRef.current = -dxRef.current;
          nextX = ballXRef.current + dxRef.current;
        } else if (nextX >= ballLimits.rightMax) {
          nextX = 0;
          nextY = 0;
          dxRef.current = dxRef.current * 1.2;
          dyRef.current = dyRef.current * 1.2;
          step = step * 1.2;
          setPlayerOneScore((prev) => prev + 1);
          setStartGameCounter(3);
        } else if (nextX <= ballLimits.leftMax) {
          nextX = 0;
          nextY = 0;
          dxRef.current = dxRef.current * 1.2;
          dyRef.current = dyRef.current * 1.2;
          step = step * 1.2;
          setPlayerTwoScore((prev) => prev + 1);
          setStartGameCounter(3);
        }
      }

      ballXRef.current = nextX;
      ballYRef.current = nextY;
      setBallOffsetX(nextX);
      setBallOffsetY(nextY);
    }, 16);

    return () => clearInterval(interval);
  }, [ballLimits, startGameCounter]);

  useEffect(() => {
    const handleWin = (winner: "playerOne" | "playerTwo") => {
      nextX = 0;
      nextY = 0;
      dxRef.current = 3;
      dyRef.current = 3;
      step = 7;
      setStartGame(false);
      setShowVictoryVideo(true); 

      setTimeout(() => setShowVictoryVideo(false), 5000);

      setPlayerOneScore(0);
      setPlayerTwoScore(0);
    };

    if (playerOneScore > 5 && playerOneScore - playerTwoScore >= 2) {
      lostPlayer = "rightPlayer";
      handleWin("playerOne");
    } else if (playerTwoScore > 5 && playerTwoScore - playerOneScore >= 2) {
      lostPlayer = "leftPlayer";
      handleWin("playerTwo");
    }
  }, [playerOneScore, playerTwoScore]);

  return (
    <div className="relative m-auto w-[80vw] h-[75vh]" style={{ backgroundColor: "#0A0F2A" }}>
      <div ref={boardRef} className="relative w-full h-full">
      {showVictoryVideo && (
  <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center z-40">
    <video
      className="absolute top-0 left-0 w-full h-full object-cover z-0"
      autoPlay
      muted
      loop
    >
      <source src="/lost.mp4" type="video/mp4" />
    </video>
    <p
      className="text-white font-extrabold text-[10vw] z-50 text-center"
    >
      Player {lostPlayer} is underdog
    </p>
  </div>
)}


        <div
          ref={leftPaddleRef}
          className="absolute left-0 top-1/2 w-[19px] h-[20%] rounded-sm z-20"
          style={{ backgroundColor: "#FF007F", transform: `translateY(-50%) translateY(${leftPaddleOffset}px)` }}
        ></div>

        <div className="absolute left-1/2 top-0 h-full w-[0.5%] -translate-x-1/2 bg-white-smoke z-20"></div>
        {startGame && startGameCounter > 0 && (
      <p
    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-extrabold text-white opacity-90 z-50 transition-all duration-200"
    style={{ fontSize: "15vh", lineHeight: "1" }}
    >
    {startGameCounter}
    </p>
)}

        <div
          ref={ballRef}
          className="absolute left-1/2 top-1/2 w-[24px] h-[24px] rounded-full z-20"
          style={{ backgroundColor: "#FF007F", transform: `translate(-50%, -50%) translate(${ballOffsetX}px, ${ballOffsetY}px)` }}
        ></div>

        <div
          ref={rightPaddleRef}
          className="absolute right-0 top-1/2 w-[19px] h-[20%] rounded-sm z-20"
          style={{ backgroundColor: "#FF007F", transform: `translateY(-50%) translateY(${rightPaddleOffset}px)` }}
        ></div>

{!startGame && !showVictoryVideo && (
  <button
    onClick={handleGameStartClick}
    className="absolute z-30 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[10%] h-[8%] rounded-md bg-[#FF007F] hover:bg-[#e60073] shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer text-white font-semibold"
  >
    Start a New Game
  </button>
)}


      </div>
    </div>
  );
}
