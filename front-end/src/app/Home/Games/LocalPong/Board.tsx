"use client";
import { useEffect, useRef, useState } from "react";

export default function Board() {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const leftPaddleRef = useRef<HTMLDivElement | null>(null);
  const rightPaddleRef = useRef<HTMLDivElement | null>(null);
  const ballRef = useRef<HTMLDivElement | null>(null);

  const [startGameCounter, setStartGameCounter] = useState(5);
  const [leftPaddleOffset, setLeftPaddleOffset] = useState(0);
  const [rightPaddleOffset, setRightPaddleOffset] = useState(0);
  const [ballOffset, setBallOffset] = useState(0);
  const [bounds, setBounds] = useState({ min: 0, max: 0 });

  useEffect(() => {
    if (startGameCounter <= 0) return;
    const intervalId = setInterval(() => {
      setStartGameCounter((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [startGameCounter]);

  useEffect(() => {
    function updateBounds() {
      const board = boardRef.current;
      const paddle = leftPaddleRef.current ?? rightPaddleRef.current;
      if (!board || !paddle) return;

      const boardH = board.clientHeight; 
      const paddleH = paddle.offsetHeight; 

      const halfBoard = boardH / 2;
      const halfPaddle = paddleH / 2;

      const min = -(halfBoard - halfPaddle);
      const max = halfBoard - halfPaddle;

      setBounds({ min, max });

      setLeftPaddleOffset((p) => Math.min(max, Math.max(min, p)));
      setRightPaddleOffset((p) => Math.min(max, Math.max(min, p)));
    }

    updateBounds();

    const ro = new ResizeObserver(updateBounds);
    if (boardRef.current) ro.observe(boardRef.current);
    if (leftPaddleRef.current) ro.observe(leftPaddleRef.current);
    window.addEventListener("resize", updateBounds);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateBounds);
    };
  }, []);

  useEffect(() => {
    const pressedKeys = new Set<string>();
    const step = 50;
  
    const handleKeyDown = (e: KeyboardEvent) => {
      pressedKeys.add(e.key);
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
      }
    };
  
    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeys.delete(e.key);
    };
  
    const loop = () => {
      let { min, max } = bounds;
  
      setLeftPaddleOffset((p) => {
        if (pressedKeys.has("w") || pressedKeys.has("W")) {
          return Math.max(min, p - step);
        }
        if (pressedKeys.has("s") || pressedKeys.has("S")) {
          return Math.min(max, p + step);
        }
        return p;
      });
  
      setRightPaddleOffset((p) => {
        if (pressedKeys.has("ArrowUp")) {
          return Math.max(min, p - step);
        }
        if (pressedKeys.has("ArrowDown")) {
          return Math.min(max, p + step);
        }
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
  

  return (
    <div
      ref={boardRef}
      className="relative m-auto w-[80vw] h-[75vh]"
      style={{ backgroundColor: "#0A0F2A" }}
    >
      <div
        ref={leftPaddleRef}
        id="leftPaddle"
        className="absolute left-0 top-1/2 w-[19px] h-[20%] rounded-sm"
        style={{
          backgroundColor: "#FF007F",
          transform: `translateY(-50%) translateY(${leftPaddleOffset}px)`,
        }}
      ></div>

      <div className="absolute left-1/2 top-0 h-full w-[1%] -translate-x-1/2 bg-white-smoke"></div>
      <div
        className="absolute left-1/2 top-1/2 w-[33px] h-[33px] -translate-x-1/2 -translate-y-1/2 rounded-full" ref={ballRef}
        style={{ backgroundColor: "#FF007F" }}
      ></div>
      <div
        ref={rightPaddleRef}
        className="absolute right-0 top-1/2 w-[19px] h-[20%] rounded-sm "
        style={{
          backgroundColor: "#FF007F",
          transform: `translateY(-50%) translateY(${rightPaddleOffset}px)`,
        }}
      ></div>

      {startGameCounter > 0 ? (
        <p
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                     font-extrabold text-white opacity-80 transition-all duration-200"
          style={{
            fontSize: "15vh",
            lineHeight: "1",
          }}
        >
          {startGameCounter}
        </p>
      ) : null}
    </div>
  );
}
