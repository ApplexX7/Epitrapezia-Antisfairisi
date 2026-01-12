interface SquareProps {
    value: string | null;
    index: number;
    isWinningCell: boolean;
    hasWinner: boolean;
    onClick: (index: number) => void;
  }
  
  export default function Square({ value, index, isWinningCell, hasWinner, onClick }: SquareProps) {
    const buttonAnimation = (condition: boolean) =>
      condition 
        ? "opacity-100 scale-100 pointer-events-auto"
        : "opacity-0 scale-95 pointer-events-none";
  
    return (
      <button
        onClick={() => onClick(index)}
        className={`w-[18vw] h-[18vw] max-w-20 max-h-20 sm:max-w-24 sm:max-h-24 md:max-w-28 md:max-h-28 lg:max-w-32 lg:max-h-32 rounded-full bg-[#F5F5F5]/10 flex items-center justify-center 
          text-10xl md:text-2xl font-meduim z-10 transition-all duration-300 ease-in-out hover:bg-brightness-125 hover:scale-110 hover:bg-[#F5F5F5]/25
          shadow-[2px_2px_5px_rgba(0,0,0,0.3),_inset_2px_2px_5px_rgba(0,0,0,0.2)] cursor-pointer
          ${
            hasWinner
            ? buttonAnimation(isWinningCell)
            : buttonAnimation(true)
          }
        `}
      >
      {value === 'X' && (
       <svg viewBox="0 0 100 100" className="w-[60%] h-[60%] max-w-16 max-h-16 sm:max-w-20 sm:max-h-20 md:max-w-24 md:max-h-24">
       <defs>
         <linearGradient id="xGradient" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%" stopColor="#a855f7" />      {/* purple-400 */}
           <stop offset="50%" stopColor="#c084fc" />     {/* purple-300 */}
           <stop offset="100%" stopColor="#a855f7" />    {/* purple-400 */}
         </linearGradient>
       </defs>
       <line x1="10" y1="10" x2="90" y2="90" stroke="url(#xGradient)" strokeWidth="20" strokeLinecap="round" />
       <line x1="90" y1="10" x2="10" y2="90" stroke="url(#xGradient)" strokeWidth="20" strokeLinecap="round" />
     </svg> 
      )}

      {value === 'O' && (
        <svg viewBox="0 0 100 100" className="w-[60%] h-[60%] max-w-16 max-h-16 sm:max-w-20 sm:max-h-20 md:max-w-24 md:max-h-24">
          <defs>
            <linearGradient id="oGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />      {/* purple-400 */}
              <stop offset="50%" stopColor="#c084fc" />     {/* purple-300 */}
              <stop offset="100%" stopColor="#a855f7" />    {/* purple-400 */}
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="url(#oGradient)"
            strokeWidth="20"
            fill="none"
          />
        </svg>
        )}
      </button>
    );
  }