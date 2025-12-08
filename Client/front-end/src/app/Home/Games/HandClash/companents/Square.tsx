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
        className={`w-85 h-85 md:w-85 md:h-85 rounded-full bg-[#F5F5F5]/10 flex items-center justify-center 
          text-10xl md:text-2xl font-meduim z-10 transition-all duration-300 ease-in-out hover:bg-brightness-125 hover:scale-110 hover:bg-[#F5F5F5]/25
          shadow-[2px_2px_5px_rgba(0,0,0,0.3),_inset_2px_2px_5px_rgba(0,0,0,0.2)] cursor-pointer
          ${
            hasWinner
            ? buttonAnimation(isWinningCell)
            : buttonAnimation(true)
          }
        `}
      >
        {value}
      </button>
    );
  }