import OnlineSquare from './OnlineSquare';

interface OnlineGameBoardProps {
  board: (string | null)[];
  winner: { player: string; line: number[] } | null;
  onCellClick: (index: number) => void;
  disabled?: boolean;
}

export default function OnlineGameBoard({ board, winner, onCellClick, disabled }: OnlineGameBoardProps) {
  return (
    <div className="grid grid-cols-3 gap-6 sm:gap-8 md:gap-10">
      {board.map((value, index) => {
        const isWinningCell = winner?.line?.includes(index);
        return (
          <OnlineSquare
            key={index}
            value={value}
            index={index}
            isWinningCell={!!isWinningCell}
            hasWinner={!!winner}
            onClick={onCellClick}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
}
