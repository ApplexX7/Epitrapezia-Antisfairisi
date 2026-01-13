'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocketStore } from "@/components/hooks/SocketIOproviders";
import { useAuth } from "@/components/hooks/authProvider";
import { useRouter } from 'next/navigation';
import OnlineVSBanner from '../companents/OnlineVSBanner';
import OnlineGameBoard from '../companents/OnlineGameBoard';
import { RotateCcw, LogOut } from 'lucide-react';

type TttMatchedPayload = {
  opponent: {
    id: number;
    username: string;
    avatar: string;
  };
  symbol: "X" | "O";
  roomId: string;
};

type TttGameState = {
  board: (string | null)[];
  currentTurn: number | null;
  scores: Record<number, number>;
  playerSymbols: Record<number, "X" | "O">;
  winner: { oderId: number; line: number[]; username: string } | null;
  isDraw: boolean;
  matchOver?: boolean;
  matchWinner?: { id: number; username: string };
};

type TttGameOverPayload = {
  message: string;
  disconnected?: number;
  winner?: { id: number; username: string } | null;
  forfeit?: boolean;
};

export default function OnlineTicTacToe() {
  const { socket, isConnected } = useSocketStore();
  const { user } = useAuth();
  const router = useRouter();
  
  const [status, setStatus] = useState<string>("");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [symbol, setSymbol] = useState<"X" | "O" | null>(null);
  const [opponentInfo, setOpponentInfo] = useState<{ id: number; username: string; avatar: string } | null>(null);
  const [gameState, setGameState] = useState<TttGameState | null>(null);
  const [matchupText, setMatchupText] = useState("Join Matchup");
  const [showNextRound, setShowNextRound] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [endMessage, setEndMessage] = useState<string | null>(null);
  
  // Ref to track roomId for cleanup functions
  const roomIdRef = useRef<string | null>(null);
  
  // Keep roomIdRef in sync
  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  // Function to leave the game
  const leaveGame = useCallback(() => {
    if (socket && roomIdRef.current) {
      socket.emit("ttt:leaveGame", { roomId: roomIdRef.current });
    }
  }, [socket]);

  // Register socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleWaiting = (payload: { message: string }) => {
      setStatus(`⏳ ${payload.message}`);
    };

    const handleStopMatchmaking = () => {
      setMatchupText("Join Matchup");
      setStatus("");
    };

    const handleMatched = (payload: TttMatchedPayload) => {
      setStatus(`Matched with ${payload.opponent.username}`);
      setOpponentInfo(payload.opponent);
      setRoomId(payload.roomId);
      setSymbol(payload.symbol);
      setGameEnded(false);
      setEndMessage(null);
    };

    const handleGameState = (state: TttGameState) => {
      setGameState(state);
      
      // Show next round button if there's a round winner OR draw, but match isn't over
      if ((state.winner || state.isDraw) && !state.matchOver) {
        setShowNextRound(true);
      } else {
        setShowNextRound(false);
      }
    };

    const handleGameOver = (payload: TttGameOverPayload) => {
      setGameEnded(true);
      setEndMessage(payload.message);
      setStatus(`🎮 ${payload.message}`);
      
      // If opponent disconnected/left, we won
      if (payload.winner && payload.winner.id === user?.id) {
        setStatus(`🏆 You won! ${payload.message}`);
      } else if (payload.disconnected === user?.id) {
        setStatus(`😔 You lost. ${payload.message}`);
      }
    };

    const handleError = (payload: { message: string }) => {
      console.error("TicTacToe error:", payload.message);
      setStatus(`❌ Error: ${payload.message}`);
    };

    socket.on("ttt:waiting", handleWaiting);
    socket.on("ttt:stopMatchmaking", handleStopMatchmaking);
    socket.on("ttt:matched", handleMatched);
    socket.on("ttt:gameState", handleGameState);
    socket.on("ttt:gameOver", handleGameOver);
    socket.on("ttt:error", handleError);

    return () => {
      socket.off("ttt:waiting", handleWaiting);
      socket.off("ttt:stopMatchmaking", handleStopMatchmaking);
      socket.off("ttt:matched", handleMatched);
      socket.off("ttt:gameState", handleGameState);
      socket.off("ttt:gameOver", handleGameOver);
      socket.off("ttt:error", handleError);
    };
  }, [socket, user?.id]);

  // Handle page unload (browser close, refresh, etc.)
  useEffect(() => {
    if (!socket) return;

    const handleBeforeUnload = (__e: BeforeUnloadEvent) => {
      void __e; // prevent unused variable warning
      if (roomIdRef.current && !gameEnded) {
        // Emit leave game before page unloads
        socket.emit("ttt:leaveGame", { roomId: roomIdRef.current });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [socket, gameEnded]);

  // Handle visibility change (tab switch - optional warning)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && roomIdRef.current && !gameEnded) {
        // Player switched tabs during active game - could add warning here
        console.log("Player switched tabs during TicTacToe game");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [gameEnded]);

  // Cleanup on component unmount (route change)
  useEffect(() => {
    return () => {
      // Component is unmounting - if game is active, leave it
      if (roomIdRef.current && !gameEnded) {
        if (socket) {
          socket.emit("ttt:leaveGame", { roomId: roomIdRef.current });
        }
      }
    };
  }, [socket, gameEnded]);

  const handleJoinMatchup = () => {
    if (!socket || !isConnected) {
      setStatus("Socket not connected");
      return;
    }
    
    if (matchupText === "Join Matchup") {
      socket.emit("ttt:joinMatchup");
      setMatchupText("Cancel Matchup");
      setStatus("Searching for opponent...");
    } else {
      socket.emit("ttt:joinMatchup"); // Toggles - if already in queue, removes
    }
  };

  const handleCellClick = (index: number) => {
    if (!socket || !roomId || !gameState) return;
    
    // Check if it's our turn
    if (gameState.currentTurn !== user?.id) return;
    
    // Check if cell is empty
    if (gameState.board[index] !== null) return;
    
    // Check if round is already decided (win or draw)
    if (gameState.winner || gameState.isDraw) return;

    socket.emit("ttt:makeMove", { roomId, index });
  };

  const handleNextRound = () => {
    if (!socket || !roomId) return;
    socket.emit("ttt:nextRound", { roomId });
    setShowNextRound(false);
  };

  const handleReplay = () => {
    window.location.reload();
  };

  const handleLeaveGame = () => {
    if (socket && roomId) {
      socket.emit("ttt:leaveGame", { roomId });
      // Reset state
      setRoomId(null);
      setGameState(null);
      setOpponentInfo(null);
      setSymbol(null);
      setGameEnded(false);
      setEndMessage(null);
      setStatus("");
      setMatchupText("Join Matchup");
    }
  };

  const handleBackToGames = () => {
    if (roomId && !gameEnded) {
      // Leave the game first
      leaveGame();
    }
    router.push('/Home/Games');
  };

  // Determine player names and avatars for the banner
  const player1Name = symbol === "X" ? (user?.username ?? "You") : (opponentInfo?.username ?? "Opponent");
  const player2Name = symbol === "O" ? (user?.username ?? "You") : (opponentInfo?.username ?? "Opponent");
  const player1Avatar = symbol === "X" ? (user?.avatar ?? "/images/defaultAvatare.jpg") : (opponentInfo?.avatar ?? "/images/defaultAvatare.jpg");
  const player2Avatar = symbol === "O" ? (user?.avatar ?? "/images/defaultAvatare.jpg") : (opponentInfo?.avatar ?? "/images/defaultAvatare.jpg");
  
  // Get player IDs to map scores correctly
  const player1Id = symbol === "X" ? user?.id : opponentInfo?.id;
  const player2Id = symbol === "O" ? user?.id : opponentInfo?.id;
  
  const player1Score = player1Id && gameState ? (gameState.scores[player1Id] ?? 0) : 0;
  const player2Score = player2Id && gameState ? (gameState.scores[player2Id] ?? 0) : 0;

  // Determine if it's our turn
  const isMyTurn = gameState?.currentTurn === user?.id;

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-[#F5F5F5]/10 rounded-xl border-none 
    shadow-[2px_2px_5px_3px_rgba(0,0,0,0.3)] m-2 md:m-10 mb-[10px] relative">
      
      {/* Back button - always visible */}
      <button
        onClick={handleBackToGames}
        className="absolute top-4 left-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-semibold transition flex items-center gap-2"
      >
        ← Back
      </button>
      
      {!roomId ? (
        // Matchmaking screen
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-3xl font-bold text-white mb-4">Online TicTacToe</h1>
          <button
            className="px-6 py-3 bg-purple-600 rounded hover:bg-purple-800 cursor-pointer transition text-white font-semibold"
            onClick={handleJoinMatchup}
          >
            {matchupText}
          </button>
          <p className="text-lg text-white/80">{status}</p>
        </div>
      ) : gameEnded ? (
        // Game ended screen (opponent left/disconnected)
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-3xl font-bold text-white mb-4">Game Over</h1>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-6 text-center">
            <p className="text-2xl text-white mb-4">{endMessage}</p>
            <p className="text-lg text-white/80">{status}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleReplay}
              className="px-6 py-3 bg-purple-600 rounded-xl hover:bg-purple-800 cursor-pointer transition text-white font-semibold flex items-center gap-2"
            >
              <RotateCcw size={20} /> Play Again
            </button>
            <button
              onClick={handleBackToGames}
              className="px-6 py-3 bg-gray-600 rounded-xl hover:bg-gray-700 cursor-pointer transition text-white font-semibold"
            >
              Back to Games
            </button>
          </div>
        </div>
      ) : (
        // Game screen
        <>
          {/* Leave game button */}
          <button
            onClick={handleLeaveGame}
            className="absolute top-4 right-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition flex items-center gap-2"
          >
            <LogOut size={18} /> Leave Game
          </button>
          
          <OnlineVSBanner
            player1Name={player1Name}
            player2Name={player2Name}
            player1Avatar={player1Avatar}
            player2Avatar={player2Avatar}
            winner={gameState?.winner ? { player: gameState.winner.oderId === player1Id ? 'X' : 'O', line: gameState.winner.line } : null}
            player1Score={player1Score}
            player2Score={player2Score}
            isMyTurn={isMyTurn}
            mySymbol={symbol}
          />

          {/* Turn indicator */}
          {gameState && !gameState.winner && !gameState.isDraw && (
            <div className="mb-4 text-xl text-white">
              {isMyTurn ? (
                <span className="text-green-400 font-bold">Your turn! ({symbol})</span>
              ) : (
                <span className="text-yellow-400">Waiting for opponent...</span>
              )}
            </div>
          )}

          {/* Draw message */}
          {gameState?.isDraw && (
            <div className="mb-4 bg-gray-500 text-white rounded-2xl px-6 py-3 text-center">
              <p className="text-2xl font-bold">It&apos;s a Draw!</p>
            </div>
          )}

          {/* Match winner announcement */}
          {gameState?.matchOver && gameState?.matchWinner && (
            <div className="mb-4 bg-yellow-400 text-purple-900 rounded-2xl px-6 py-3 text-center animate-bounce">
              <p className="text-2xl font-bold">
                🏆 {gameState.matchWinner.username} WINS THE MATCH! 🏆
              </p>
            </div>
          )}

          <OnlineGameBoard
            board={gameState?.board ?? Array(9).fill(null)}
            winner={gameState?.winner ? { player: gameState.winner.oderId === player1Id ? 'X' : 'O', line: gameState.winner.line } : null}
            onCellClick={handleCellClick}
            disabled={!isMyTurn || !!gameState?.winner || !!gameState?.isDraw}
          />

          <div className="flex gap-4 mt-4">
            {/* Next Round button - show for wins or draws when match isn't over */}
            {showNextRound && !gameState?.matchOver && (gameState?.winner || gameState?.isDraw) && (
              <button
                onClick={handleNextRound}
                className="mt-7 p-3 rounded-xl hover:scale-110 bg-[#F5F5F5]/25 text-2xl text-white flex items-center gap-2 
                transition-all duration-300 ease-in-out hover:bg-[#F5F5F5]/10 cursor-pointer 
                  shadow-[2px_3px_7px_0px_rgba(0,0,0,0.3)]"
              >
                Next Round
              </button>
            )}
            
            {/* Replay button when match is over */}
            {gameState?.matchOver && (
              <button
                onClick={handleReplay}
                className="mt-7 p-3 rounded-xl hover:scale-110 bg-purple-600 text-2xl text-white flex items-center gap-2 
                transition-all duration-300 ease-in-out hover:bg-purple-800 cursor-pointer 
                  shadow-[2px_3px_7px_0px_rgba(0,0,0,0.3)]"
              >
                <RotateCcw size={24} /> Play Again
              </button>
            )}
          </div>

          {/* Status message */}
          {status && gameState?.matchOver && (
            <p className="mt-4 text-lg text-white/80">{status}</p>
          )}
        </>
      )}
    </main>
  );
}
