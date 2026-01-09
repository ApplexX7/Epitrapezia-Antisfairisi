"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

export default function CreateTournamentForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Client-side validation: require password >= 3 chars
    if (!password || password.length < 3) {
      setErrorMessage("Password must be at least 3 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/tournaments", { name, password });
      const id = res.data?.id || res.data?.tournamentId || null;
      if (!id) throw new Error("Invalid server response");
      setErrorMessage(null);
      router.push(`/Home/Games/Tournament/lobby/${id}`);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const serverMsg = error?.response?.data?.message;
      if (serverMsg) {
        // Avoid surfacing noisy/raw server messages. Keep it generic.
        setErrorMessage("Failed to create tournament");
      } else {
        // network/offline fallback: allow local testing
        const fallbackId = `local-${Date.now()}`;
        setErrorMessage("Failed to create on server — using local lobby");
        router.push(`/Home/Games/Tournament/lobby/${fallbackId}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      <label className="block">
        <span className="text-sm font-medium text-gray-700">Tournament name</span>
        <div className="mt-2 relative">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Tournament name"
            className="w-full rounded-lg border border-gray-200 bg-white/60 px-4 py-3 text-gray-900 placeholder-gray-400 
                       focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            required
          />
        </div>
      </label>

      <label className="block">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Tournament password</span>
          <span className="text-xs text-gray-500">Keep it secret</span>
        </div>

        <div className="mt-2 relative">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="••••••••"
            className="w-full rounded-lg border border-gray-200 bg-white/60 px-4 py-3 text-gray-900 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            required
          />
        </div>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg px-4 py-3 bg-purple-600 text-white font-medium shadow-sm 
                   hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition cursor-pointer disabled:opacity-60"
      >
        {loading ? "Creating…" : "Create"}
      </button>
    </form>
  );
}
