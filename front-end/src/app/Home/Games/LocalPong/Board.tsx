'use client'
import { useState , useEffect} from "react";


export default function Board() {
  const [startGameCounter, setStartGameCounter] = useState(5);

useEffect(() => {
  if (startGameCounter <= 0) return;

  const intervalId = setInterval(() => {
    setStartGameCounter(prev => prev - 1);
  }, 1000);

  return () => clearInterval(intervalId);
}, [startGameCounter]);

  return (
    <div
      className="relative m-auto w-[80vw] h-[75vh]"
      style={{ backgroundColor: "#0A0F2A" }}
    >
      <div
        className="absolute left-0 top-1/2 w-[19px] h-[20%] rounded-sm -translate-y-1/2"
        style={{ backgroundColor: "#FF007F" }}
      ></div>
      <div className="absolute left-1/2 top-0 h-full w-[1%] -translate-x-1/2 bg-white-smoke"></div>
      <div
        className="absolute left-1/2 top-1/2 w-[24px] h-[24px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ backgroundColor: "#FF007F" }}
      ></div>
      <div
        className="absolute right-0 top-1/2 w-[19px] h-[20%] rounded-sm -translate-y-1/2"
        style={{ backgroundColor: "#FF007F" }}
      ></div>
      {startGameCounter > 0 ?
      <p
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                   font-extrabold text-white opacity-80  transition-all duration-200"
        style={{
          fontSize: "15vh",
          lineHeight: "1",
        }}
      >
        {startGameCounter}
      </p> : null}
    </div>
  );
}
