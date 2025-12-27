"use client";
import React from "react";
import CreateTournamentForm from "@/components/Tournament/CreateTournamentForm";

export default function Home() {
  return (
    <div className="flex justify-center mt-20 px-4">
      <div className="relative bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-6 shadow-lg w-[500px] h-[630px] overflow-hidden">

        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-purple-400/20 to-transparent pointer-events-none" />

        <div className="flex justify-center mb-6 relative z-10">
          <img 
            src="/images/logo.png" 
            alt="Logo"
            className="w-20 h-20 opacity-90"
          />
        </div>

        <div className="backdrop-blur-md bg-white/40 border border-white/40 rounded-2xl shadow-xl p-6 relative z-10">
          <header className="mb-4 text-center">
            <h1 className="text-2xl font-semibold text-gray-900">Create Tournament</h1>
            <p className="mt-1 text-sm text-gray-600">Enter the tournament details below</p>
          </header>

          <CreateTournamentForm />
        </div>
      </div>
    </div>
  );
}
