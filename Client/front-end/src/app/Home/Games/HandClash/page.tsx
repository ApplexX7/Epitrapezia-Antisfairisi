'use client';
import { useState } from 'react';
import VSBanner from './companents/VSBanner';
import GameBoard from './companents/GameBoard';
import ResetButton from './companents/ResetButton';

export const checkWinner = (square: (string | null)[]) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let line of lines) {
    const [a, b, c] = line;
    if (square[a] && square[a] === square[b] && square[b] === square[c]) {
      return { player: square[a]!, line };
    }
  }
  return null;
};

export default function Home() {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<null | { player: string; line: number[] }>(null);

  function handleClick(index: number) {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";

    setBoard(newBoard);
    const win = checkWinner(newBoard);
    if (win) {
      setWinner(win);
    }
    setIsXNext(!isXNext);
  }

  function resetGame() {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsXNext(true);
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-[#F5F5F5]/10 rounded-xl border-none shadow-[2px_2px_5px_3px_rgba(0,0,0,0.3)] m-2 md:m-10">
      <VSBanner
        player1Name="Saloua"
        player2Name="Saloua"
        player1Avatar="/images/defaultAvatare.jpg"
        player2Avatar="/images/defaultAvatare.jpg"
      />

      <GameBoard
        board={board}
        winner={winner}
        onCellClick={handleClick}
      />

      <ResetButton onReset={resetGame} />
    </main>
  );
}