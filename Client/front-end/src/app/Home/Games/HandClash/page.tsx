'use client';
import { useState } from 'react';

export default function Home() {
  const[board] = useState(Array(9).fill)

  return (
    <main className="flex items-center justify-center h-screen bg-[#F5F5F5]/40 rounded-xl border-none
      shadow-[2px_2px_5px_3px_rgba(0,0,0,0.3)] m-2 md:m-10">

      <div className="grid grid-cols-3 gap-2">
        <button>
          {board.map((value, index) => (
            <button
              key={index}
              onClick={()}
            >

            </button>
          ))}
        </button>
      </div>
    </main>
  );
}
