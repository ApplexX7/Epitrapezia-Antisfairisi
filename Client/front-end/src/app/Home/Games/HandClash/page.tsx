'use client';
import { useState } from 'react';

export default function Home() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const winner = calculateWinner(board);

  function handleClick(index: number) {
    if (board[index] || winner) return; // ignore if clicked or game ended

    const newBoard = board.slice();
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  }

  function handleRestart() {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Tic Tac Toe</h1>

      <div className="grid grid-cols-3 gap-2">
        {board.map((value, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className="w-20 h-20 text-3xl font-bold bg-gray-800 border border-gray-600 hover:bg-gray-700"
          >
            {value}
          </button>
        ))}
      </div>

      <div className="mt-6 text-lg">
        {winner ? (
          <p className="text-green-400 font-bold">
            🎉 Winner: {winner}
          </p>
        ) : board.every(Boolean) ? (
          <p className="text-yellow-400 font-bold">It's a Draw!</p>
        ) : (
          <p>Next Player: {isXNext ? 'X' : 'O'}</p>
        )}
      </div>

      <button
        onClick={handleRestart}
        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
      >
        Restart Game
      </button>
    </main>
  );
}

// Helper function
function calculateWinner(squares: string[]) {
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

  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
