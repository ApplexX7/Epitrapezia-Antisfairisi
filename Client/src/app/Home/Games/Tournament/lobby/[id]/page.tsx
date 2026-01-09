import React from "react";
import { notFound } from "next/navigation";
import TournamentLobby from "@/components/Tournament/TournamentLobby";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LobbyPage({ params }: Props) {
  const { id } = await params;
  if (!id) notFound();

  // Server-backed tournaments use numeric IDs. Local/offline fallback uses `local-...`.
  const isLocal = id.startsWith("local-");
  const isNumeric = /^\d+$/.test(id);
  if (!isLocal && !isNumeric) notFound();

  return (
    <div className="min-h-screen px-4 py-8">
      <TournamentLobby tournamentId={id} />
    </div>
  );
}
