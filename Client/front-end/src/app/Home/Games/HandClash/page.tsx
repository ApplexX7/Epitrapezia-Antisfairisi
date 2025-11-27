'use client';
import { useState } from 'react';
import { RotateCcw } from 'lucide-react';

export default function Home() {
  const[board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState();
  const [winner, setWinner] = useState(null);

  function handleClick(index: number) {
    if (board[index] || winner) 
      return;

    const newBoard = board.slice();
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  }

  const buttonAnimation = (condition: boolean) =>
    condition 
      ? "opacity-100 scale-100 pointer-events-auto"
      : "opacity-0 scale-95 pointer-events-none";

  return (
    <main className="flex items-center justify-center h-screen bg-[#F5F5F5]/10   rounded-xl border-none
      shadow-[2px_2px_5px_3px_rgba(0,0,0,0.3)] m-2 md:m-10">

      <div className="grid grid-cols-3 gap-4">
          {board.map((value, index) => {
             const isWinningCell = winner?.line?.includes(index);
             return(
              <button
                key={index}
                onClick={() => handleClick(index)}
                className={`w-85 h-85 md:w-85 md:h-85 rounded-full bg-[#F5F5F5]/10 flex items-center justify-center 
                  text-10xl md:text-2xl font-meduim z-10 transition-all duration-400 ease-in-out hover:bg-[#F5F5F5]/25
                  shadow-[2px_2px_5px_3px_rgba(0,0,0,0.2),_inset_2px_2px_5px_rgba(0,0,0,0.2)]
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
    </main>
  );
}
