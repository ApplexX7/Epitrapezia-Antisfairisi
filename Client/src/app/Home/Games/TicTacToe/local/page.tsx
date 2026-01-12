'use client';
import { useState, useEffect } from 'react';
import VSBanner from '../companents/VSBanner';
import GameBoard from '../companents/GameBoard';
import ResetButton from '../companents/ResetButton';
import { checkWinner } from '../utils/checkWinner';

export default function Home() {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<null | { player: string; line: number[] }>(null);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if(winner) {
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
  }, [winner, player1Score, player2Score]);

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
    <main className="flex flex-col items-center self-center justify-center w-full h-screen max-w-350 bg-[#F5F5F5]/10 rounded-xl border-none 
      shadow-[2px_2px_5px_3px_rgba(0,0,0,0.3)] px-5 py-2 m-2 md:m-10 mb-[20px]">
      <VSBanner
        player1Name="Player_X"
        player2Name="Player_O"
        player1Avatar="/images/defaultAvatare.jpg"
        player2Avatar="/images/defaultAvatare.jpg"
        winner={winner}
        player1Score={player1Score}
        player2Score={player2Score}
      />

      {gameOver && (
        <div className=" mb-4 bg-yellow-400 text-purple-900 rounded-2xl px-6 py-3 text-center animate-bounce">
          <p className="text-2xl font-bold">
            🏆 {player1Score >= 3 ? 'Player_X' : 'Player_O'} WINS THE MATCH! 🏆
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
            className="mt-7 p-3 rounded-xl hover:scale-110 bg-[#F5F5F5]/25 text-2xl text-white flex items-center gap-2 
            transition-all duration-300 ease-in-out hover:bg-[#F5F5F5]/10 hover:scale-110 cursor-pointer 
              shadow-[2px_3px_7px_0px_rgba(0,0,0,0.3)]"
          >
            Next Round
          </button>
        )}
        
        <ResetButton onReset={resetGame} />
      </div>
    </main>
  );
}