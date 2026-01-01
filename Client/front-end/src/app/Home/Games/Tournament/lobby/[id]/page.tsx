"use client";
import React from "react";
import { useParams } from "next/navigation";
import TournamentLobby from "@/components/Tournament/TournamentLobby";

export default function LobbyPage() {
  const params = useParams();
  const raw = (params as any)?.id;
  const id = Array.isArray(raw) ? raw[0] : raw || "unknown";

  return (
    <div className="min-h-screen px-4 py-8">
      <TournamentLobby tournamentId={String(id)} />
    </div>
  );
}
