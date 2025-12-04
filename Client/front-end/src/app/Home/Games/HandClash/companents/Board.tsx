'use client';

import Square from "./Square";

export default function Board({ board, winner, handleClick }: any) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {board.map((value: string, index: number) => {
        const isWinningCell = winner?.line?.includes(index);

        return (
          <Square
            key={index}
            value={value}
            isWinning={isWinningCell}
            onClick={() => handleClick(index)}
          />
        );
      })}
    </div>
  );
}
