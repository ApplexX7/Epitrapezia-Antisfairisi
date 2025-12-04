'use client';

export default function Square({ value, onClick, isWinning }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        w-85 h-85 md:w-85 md:h-85 rounded-full bg-[#F5F5F5]/10 flex items-center justify-center
        text-10xl md:text-2xl font-medium transition-all duration-300
        hover:scale-110 hover:bg-[#F5F5F5]/25
        ${isWinning ? "opacity-100 scale-100" : ""}
      `}
    >
      {value}
    </button>
  );
}
