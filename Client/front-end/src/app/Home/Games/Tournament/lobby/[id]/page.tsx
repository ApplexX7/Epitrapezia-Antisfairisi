"use client";
import React from "react";
import { useParams } from "next/navigation";
import TournamentLobby from "@/components/Tournament/TournamentLobby";

export default function LobbyPage() {
  const params = useParams();
  const id = params?.id || "unknown";

  return (
    <div className="min-h-screen px-4 py-8">
      <TournamentLobby tournamentId={String(id)} />
    </div>
  );
}
