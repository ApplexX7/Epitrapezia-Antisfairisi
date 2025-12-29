import { RotateCcw } from 'lucide-react';

interface ResetButtonProps {
  onReset: () => void;
}

export default function ResetButton({ onReset }: ResetButtonProps) {
  return (
    <button
      onClick={onReset}
      className="mt-10 p-3 rounded-xl hover:scale-110 bg-[#F5F5F5]/25 text-2xl text-white flex items-center gap-2 
        transition-all duration-300 ease-in-out hover:bg-[#F5F5F5]/10 hover:scale-110 cursor-pointer shadow-[2px_3px_7px_0px_rgba(0,0,0,0.3)]"
    >
      <RotateCcw size={30} /> Reset
    </button>
  );
} 