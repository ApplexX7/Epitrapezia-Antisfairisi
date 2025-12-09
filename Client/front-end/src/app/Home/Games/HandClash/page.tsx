'use client';
import { useState, useEffect } from 'react';
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
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (winner) {
      // Update scores when there's a winner
      if (winner.player === 'X') {
        const newScore = player1Score + 1;
        setPlayer1Score(newScore);
        if (newScore >= 3) {
          setGameOver(true);
        }
      } else {
        const newScore = player2Score + 1;
        setPlayer2Score(newScore);
        if (newScore >= 3) {
          setGameOver(true);
        }
      }
    }
  }, [winner]);

  function handleClick(index: number) {
    if (board[index] || winner || gameOver) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";

    setBoard(newBoard);
    const win = checkWinner(newBoard);
    if (win) {
      setWinner(win);
    }
    setIsXNext(!isXNext);
  }

  function resetRound() {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsXNext(true);
  }

  function resetGame() {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsXNext(true);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setGameOver(false);
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-[#F5F5F5]/10 rounded-xl border-none shadow-[2px_2px_5px_3px_rgba(0,0,0,0.3)] m-2 md:m-10">
      <VSBanner
        player1Name="Saloua_X"
        player2Name="Saloua_O"
        player1Avatar="/images/defaultAvatare.jpg"
        player2Avatar="/images/defaultAvatare.jpg"
        winner={winner}
        player1Score={player1Score}
        player2Score={player2Score}
      />

      {gameOver && (
        <div className="mb-4 bg-yellow-400 text-purple-900 rounded-2xl px-6 py-3 text-center animate-bounce">
          <p className="text-2xl font-bold">
            🏆 {player1Score >= 3 ? 'Saloua (Left)' : 'Saloua (Right)'} WINS THE MATCH! 🏆
          </p>
        </div>
      )}

      <GameBoard
        board={board}
        winner={winner}
        onCellClick={handleClick}
      />

      <div className="flex gap-4 mt-4">
        {winner && !gameOver && (
          <button
            onClick={resetRound}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-semibold transition-all"
          >
            Next Round
          </button>
        )}
        
        <ResetButton onReset={resetGame} />
      </div>
    </main>
  );
}