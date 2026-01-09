interface OnlineSquareProps {
  value: string | null;
  index: number;
  isWinningCell: boolean;
  hasWinner: boolean;
  onClick: (index: number) => void;
  disabled?: boolean;
}

export default function OnlineSquare({ 
  value, 
  index, 
  isWinningCell, 
  hasWinner, 
  onClick, 
  disabled 
}: OnlineSquareProps) {
  const buttonAnimation = (condition: boolean) =>
    condition 
      ? "opacity-100 scale-100 pointer-events-auto"
      : "opacity-0 scale-95 pointer-events-none";

  const handleClick = () => {
    if (disabled) return;
    onClick(index);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled && !value}
      className={`w-35 h-35 sm:w-35 sm:h-35 md:w-85 md:h-85 lg:w-85 lg:h-85 rounded-full bg-[#F5F5F5]/10 flex items-center justify-center 
        text-10xl md:text-2xl font-meduim z-10 transition-all duration-300 ease-in-out 
        ${disabled ? 'cursor-not-allowed opacity-70' : 'hover:bg-brightness-125 hover:scale-110 hover:bg-[#F5F5F5]/25 cursor-pointer'}
        shadow-[2px_2px_5px_rgba(0,0,0,0.3),_inset_2px_2px_5px_rgba(0,0,0,0.2)]
        ${
          hasWinner
          ? buttonAnimation(isWinningCell)
          : buttonAnimation(true)
        }
      `}
    >
      {value === 'X' && (
        <svg viewBox="0 0 100 100" className="w-15 h-15 md:w-28 md:h-28 sm:h-15 sm:w-15 lg:h-24 lg:w-24">
          <defs>
            <linearGradient id="xGradientOnline" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="50%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <line x1="10" y1="10" x2="90" y2="90" stroke="url(#xGradientOnline)" strokeWidth="20" strokeLinecap="round" />
          <line x1="90" y1="10" x2="10" y2="90" stroke="url(#xGradientOnline)" strokeWidth="20" strokeLinecap="round" />
        </svg>
      )}

      {value === 'O' && (
        <svg viewBox="0 0 100 100" className="w-15 h-15 md:w-28 md:h-28 sm:h-15 sm:w-15 lg:h-24 lg:w-24">
          <defs>
            <linearGradient id="oGradientOnline" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="50%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="url(#oGradientOnline)"
            strokeWidth="20"
            fill="none"
          />
        </svg>
      )}
    </button>
  );
}
