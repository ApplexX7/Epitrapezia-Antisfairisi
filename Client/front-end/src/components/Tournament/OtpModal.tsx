"use client";
import React, { useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onClose: () => void;
  tournamentId: string | number;
  playerId: string | number;
  onVerified: () => void;
};

export default function OtpModal({ open, onClose, tournamentId, playerId, onVerified }: Props) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/tournaments/${tournamentId}/verify-otp`, { playerId, otp });
      if (res.data?.ok) {
        toast.success("OTP verified — match can start");
        onVerified();
        onClose();
      } else {
        throw new Error(res.data?.message || "OTP invalid");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl max-w-sm w-full p-6">
        <h3 className="text-lg font-semibold mb-2">Enter OTP</h3>
        <p className="text-sm text-gray-600 mb-4">Enter the one-time code to verify the player is present.</p>
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-4"
          placeholder="123456"
        />
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-3 py-2 rounded-lg border">Cancel</button>
          <button onClick={handleVerify} disabled={loading} className="px-3 py-2 rounded-lg bg-purple-600 text-white">
            {loading ? "Verifying…" : "Verify"}
          </button>
        </div>
      </div>
    </div>
  );
}
