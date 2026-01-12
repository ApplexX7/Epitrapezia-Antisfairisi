import Square from './Square';

interface GameBoardProps {
  board: (string | null)[];
  winner: { player: string; line: number[] } | null;
  onCellClick: (index: number) => void;
}

export default function GameBoard({ board, winner, onCellClick }: GameBoardProps) {
  return (
    <div className="grid grid-cols-3 gap-6 sm:gap-8 md:gap-10">
      {board.map((value, index) => {
        const isWinningCell = winner?.line?.includes(index);
        return (
          <Square
            key={index}
            value={value}
            index={index}
            isWinningCell={!!isWinningCell}
            hasWinner={!!winner}
            onClick={onCellClick}
          />
        );
      })}
    </div>
  );
}
