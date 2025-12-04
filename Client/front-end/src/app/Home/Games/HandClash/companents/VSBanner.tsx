interface VSBannerProps {
    player1Name: string;
    player2Name: string;
    player1Avatar: string;
    player2Avatar: string;
  }
  
export default function VSBanner({ player1Name, player2Name, player1Avatar, player2Avatar }: VSBannerProps) {
  return (
    <div className="relative w-[38vw] h-[7vh] ml-[34vw] mr-[34vw] mb-[8vh] max-w-[650px] max-h-[109px]">
      <div className="absolute bg-white/10 backdrop-blur-sm rounded-full w-full h-full"></div>

      <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <img
          src={player1Avatar}
          alt="player 1"
          className="h-[6vh] w-[6vh] rounded-full object-cover"
        />
        <span className="font-bold text-lg">{player1Name}</span>
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="relative">
          <div className="absolute inset-0 blur-xl bg-gradient-to-r from-purple-400 via-purple-300 to-purple-400 opacity-60 scale-150"></div>
          
          <div className="relative text-5xl font-black tracking-wider flex items-center">
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

      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-3">
        <span className="font-bold text-lg">{player2Name}</span>
        <img
          src={player2Avatar}
          alt="player 2"
          className="h-[6vh] w-[6vh] rounded-full object-cover"
        />
      </div>
    </div>
  );
}
