'use client';
import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import Image from "next/image";

export default function TicTacToe() {
  const[board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<null | { player: string; line: number[] }>(null);

  function handleClick(index: number) {
    if (board[index] || winner) 
      return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";

    setBoard(newBoard);
    const win = checkWinner(newBoard);
    if (win) {
      setWinner(win);
    }
    setIsXNext(!isXNext);
  }


  const checkWinner = (square) =>{
    const lines = [
      [0, 1, 2], // rows
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6], // cols
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8], // diagonals
      [2, 4, 6],
    ];

    for(let line of lines){
      const [a, b, c] = line;
      if (square[a] && square[a] === square[b] && square[b] === square[c]){
        return {player: square[a]!, line};
      }
    }
    return null;
  }

  function resetGame() {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsXNext(true);
  }

  const buttonAnimation = (condition: boolean) =>
    condition 
      ? "opacity-100 scale-100 pointer-events-auto"
      : "opacity-0 scale-95 pointer-events-none";

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-[#F5F5F5]/10   rounded-xl border-none
      shadow-[2px_2px_5px_3px_rgba(0,0,0,0.3)] m-2 md:m-10">

    <div className="relative w-[38vw] h-[7vh] ml-[34vw] mr-[34vw] mb-[8vh] max-w-[650px] max-h-[109px]">``
      <div className="absolute bg-white/10 backdrop-blur-sm rounded-lg w-full h-full">
        <span className="absolute top-1/2 -translate-y-1/2 font-bold left-60">b</span>
        <span className="absolute top-1/2 -translate-y-1/2 font-bold ">v</span>
        <span className="absolute top-1/2 -translate-y-1/2 font-bold right-60">y</span>
      </div>

      <div className="absolute  w-[38vw] h-[7vh]">
        <img src="/images/defaultAvatare.jpg" alt="player 1"className="h-[6vh] rounded-full left-0"/>
      </div>
    </div>
    
      <div className="grid grid-cols-3 gap-4">
          {board.map((value, index) => {
             const isWinningCell = winner?.line?.includes(index);
             return(
              <button
                key={index}
                onClick={() => handleClick(index)}
                className={`w-85 h-85 md:w-85 md:h-85 rounded-full bg-[#F5F5F5]/10 flex items-center justify-center 
                  text-10xl md:text-2xl font-meduim z-10 transition-all duration-400 ease-in-out hover:bg-[#F5F5F5]/25
                  shadow-[c,_inset_2px_2px_5px_rgba(0,0,0,0.2)]
                  ${
                    winner
                    ? buttonAnimation(isWinningCell)
                    : buttonAnimation(true)
                  }
                  }`}
              >
              { value}
              </button>
             );
          })}
      </div>

      <button
        onClick={resetGame}
        className = "mt-7 p-3 rounded-xl bg-[#F5F5F5]/25 text-2xl text-white flex items-center gap-2 transition-all duration-300 ease-in-out hover:bg-[#F5F5F5]/10 cursor-pointer shadow-[2px_3px_7px_0px_rgba(0,0,0,0.3)]"
      >
        <RotateCcw size={30} /> Reset
      </button>
    </main>
  );
}
