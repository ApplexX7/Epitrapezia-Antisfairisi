"use client";

import React from "react";

export default function JoinTournament(): JSX.Element {
  const tournaments: { name: string; password: string }[] = [
    { name: "Ping Pong Masters", password: "1234" },
    { name: "Weekend Smash", password: "abcd" },
    { name: "Purple Cup", password: "pass" },
    { name: "Purple Cup", password: "pass" },
    { name: "Purple Cup", password: "pass" },
    { name: "Purple Cup", password: "pass" },

  ];

  return (
    <div className="flex justify-center mt-10">
      <div className="w-full max-w-3xl px-4">
        <h1 className="text-2xl font-semibold text-purple-700 mb-6 text-center">Join a Tournament</h1>

        <div className="flex flex-col gap-4">
          {tournaments.map((t, i) => (
            <div
              key={i}
              style={{ backgroundImage: "url('/images/rps.png')", backgroundSize: 'cover', backgroundPosition: 'center' }} // rigl chi tswira ta hna hh
              className="bg-white/50 backdrop-blur-md rounded-xl p-4 flex flex-col shadow-md border border-purple-200"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white-smoke">{t.name}</h2>
                <button
                  className="px-4 py-1 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition cursor-pointer"
                  onClick={() => {}}
                >
                  Join
                </button>
              </div>

              <div className="text-sm text-purple-900/80">
                <div className="text-sm text-white font-bold flex items-center gap-2">
                  Password:
                  <input
                    type="password"
                    placeholder="Enter password"
                    className="bg-white/30 text-white font-bold px-3 py-1 rounded-lg outline-none placeholder-white/60"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
