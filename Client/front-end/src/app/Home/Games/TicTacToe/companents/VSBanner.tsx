interface VSBannerProps {
  player1Name: string;
  player2Name: string;
  player1Avatar: string;
  player2Avatar: string;
  winner: { player: string; line: number[] } | null;
  player1Score: number;
  player2Score: number;
}

export default function VSBanner({player1Name, player2Name, player1Avatar, player2Avatar, winner,
  player1Score,
  player2Score
}: VSBannerProps) {
  const isPlayer1Winner = winner?.player === 'X';
  const isPlayer2Winner = winner?.player === 'O';
  const isPlayer1Champion = player1Score >= 3;
  const isPlayer2Champion = player2Score >= 3;

  return (
    <div className="relative w-[70vw] sm:w-[90vw] lg:w-[95vw] mx-auto h-[60px] lg:h-[7vh] mb-15 lg:mb-[8vh] max-w-[650px]">
      <div className="absolute bg-white/10 backdrop-blur-sm rounded-full w-full h-full"></div>

      <div className={`absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 transition-all duration-300 ${
        isPlayer1Winner || isPlayer1Champion ? 'scale-110' : isPlayer2Winner || isPlayer2Champion ? 'opacity-40 scale-90' : ''
      }`}>
        <div className="relative">
          <img
            src={player1Avatar}
            alt="player 1"
            className={`h-10 w-10 sm:h-10 sm:w-10 lg:h-[7vh] lg:w-[7vh] rounded-full object-cover ${
              isPlayer1Winner || isPlayer1Champion
                ? "ring-4 ring-yellow-400 shadow-lg shadow-yellow-400/50"
                : ""
            }`}
          />
          <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white text-xs font-bold rounded-full w-4 h-4 sm:w-6 sm:h-6 lg:w-6 lg:h-6 flex items-center justify-center border-2 border-white">
            {player1Score}
          </div>
        </div>
        <span className="font-bold text-b lg">{player1Name}</span>
        {isPlayer1Champion && <span className="text-2xl animate-bounce">🏆</span>}
        {isPlayer1Winner && !isPlayer1Champion && <span className="text-2xl">👑</span>}
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="relative">
          <div className="absolute inset-0 blur-xl bg-gradient-to-r from-purple-400 via-purple-300 to-purple-400 opacity-60 scale-150"></div>
          
          <div className="relative text-2xl sm:text-3xl lg:text-5xl font-black tracking-wider flex items-center">
            <span className="bg-gradient-to-br from-purple-200 via-purple-300 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.8)] -translate-y-3">
              V
            </span>
            <span className="bg-gradient-to-br from-purple-200 via-purple-300 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.8)] translate-y-3">
              S
            </span>
          </div>

          <div className="absolute inset-0 flex justify-center items-center">
            <div className="w-[3px] h-[100%] bg-gradient-to-r from-transparent via-purple-300 to-transparent rotate-15 blur-[1px]"></div>
          </div>
          
          <div className="absolute -top-4 right-0 w-1 h-1 rounded-full bg-purple-300 animate-pulse"></div>
          <div className="absolute -top-2 right-4 w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse delay-100"></div>
          <div className="absolute top-0 right-8 w-1 h-1 rounded-full bg-purple-200 animate-pulse delay-200"></div>
        </div>
      </div>

      <div className={`absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-3 transition-all duration-300 ${
        isPlayer2Winner || isPlayer2Champion ? 'scale-110' : isPlayer1Winner || isPlayer1Champion ? 'opacity-40 scale-90' : ''
      }`}>
        {isPlayer2Champion && <span className="text-2xl animate-bounce">🏆</span>}
        {isPlayer2Winner && !isPlayer2Champion && <span className="text-2xl">👑</span>}
        <span className="font-bold text-lg">{player2Name}</span>
        <div className="relative">
          <img
            src={player2Avatar}
            alt="player 2"
            className={`h-10 w-10 sm:h-10 sm:w-10 lg:w-[7vh] lg:h-[7vh] rounded-full object-cover ${
              isPlayer2Winner || isPlayer2Champion ? 'ring-4 ring-yellow-400 shadow-lg shadow-yellow-400/50' : ''
            }`}
          />
          <div className="absolute -bottom-1 -left-1 bg-purple-600 text-white text-xs font-bold rounded-full w-4 h-4 sm:w-6 sm:h-6 lg:w-6 lg:h-6 flex items-center justify-center border-2 border-white">
            {player2Score}
          </div>
        </div>
      </div>
    </div>
  );
}