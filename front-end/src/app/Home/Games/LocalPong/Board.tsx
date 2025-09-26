"use client";
import { useState, useEffect, useRef } from "react";
import { start } from "repl";

export default function Board() {
  const [startGameCounter, setStartGameCounter] = useState(5);
  const [leftPaddleOffset, setLeftPaddleOffset] = useState(0); 
  const [rightPaddleOffset, setRightPaddleOffset] = useState(0);
  const [boardHeight, setBoardHeight] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null); 
  let movingSpeed = 10;
  useEffect (() => 
  {
    if (boardRef.current)
        setBoardHeight(boardRef.current.offsetHeight);
  })
  useEffect(() => {
    if (startGameCounter <= 0) return;

    const intervalId = setInterval(() => {
      setStartGameCounter((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [startGameCounter]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!boardRef.current) return;
      const paddleHeight = boardRef.current.offsetHeight * 0.2;
    
      const minY = -(boardHeight / 2) + paddleHeight ;
      const maxY = (boardHeight / 2) - paddleHeight;
    
      if (e.key === "w") {
        if (leftPaddleOffset - maxY > 0)
            setLeftPaddleOffset(leftPaddleOffset - movingSpeed);
      } else if (e.key === "s") {
        setLeftPaddleOffset((yl) => Math.min(maxY, yl + movingSpeed));
      } else if (e.key === "ArrowUp") {
        setRightPaddleOffset((yr) => Math.max(minY, yr - movingSpeed));
      } else if (e.key === "ArrowDown") {
        setRightPaddleOffset((yr) => Math.min(maxY, yr + movingSpeed));
      }
    };
    

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div ref={boardRef}
      className="relative m-auto w-[80vw] h-[75vh]"
      style={{ backgroundColor: "#0A0F2A" }}
    >
      <div
        id="leftPaddle"
        className="absolute left-0 top-1/2 w-[19px] h-[20%] rounded-sm"
        style={{
          backgroundColor: "#FF007F",
          transform: `translateY(-50%) translateY(${leftPaddleOffset}px)`,
        }}
      ></div>

      <div className="absolute left-1/2 top-0 h-full w-[1%] -translate-x-1/2 bg-white-smoke"></div>
      <div
        className="absolute left-1/2 top-1/2 w-[33px] h-[33px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ backgroundColor: "#FF007F" }}
      ></div>
      <div
        className="absolute right-0 top-1/2 w-[19px] h-[20%] rounded-sm "
        style={{ backgroundColor: "#FF007F",
            transform : `translateY(-50%) translateY(${rightPaddleOffset}px)`
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
