"use client"
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import Image from "next/image";
import { getAvatarUrl } from "@/lib/utils";
import { Check, X } from "@phosphor-icons/react/ssr";
import { useSocketStore } from "./hooks/SocketIOproviders";

interface FriendRequest {
  id: number;
  senderId: number;
  senderUsername: string;
  senderAvatar: string;
  created_at: string;
}

export default function PendingFriendRequests() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyIds, setBusyIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get("/friends/requests/pending");
      if (res.data?.requests) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      console.error("Error fetching pending requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (senderId: number) => {
    if (busyIds.has(senderId)) return;

    setBusyIds((prev) => new Set(prev).add(senderId));
    try {
      await api.post("/friends/Accept", { friendId: senderId });
      toast.success("Friend request accepted!");
      setRequests((prev) => prev.filter((r) => r.senderId !== senderId));
      // Also remove from notification store
      useSocketStore.getState().removeNotification(String(senderId));
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to accept request");
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(senderId);
        return next;
      });
    }
  };

  const handleDecline = async (senderId: number) => {
    if (busyIds.has(senderId)) return;

    setBusyIds((prev) => new Set(prev).add(senderId));
    try {
      await api.post("/friends/Remove", { friendId: senderId });
      toast.success("Friend request declined");
      setRequests((prev) => prev.filter((r) => r.senderId !== senderId));
      // Also remove from notification store
      useSocketStore.getState().removeNotification(String(senderId));
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to decline request");
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(senderId);
        return next;
      });
    }
  };

  if (loading || requests.length === 0) {
    return null;
  }

  return (
    <div className="card w-full p-6 mb-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-black-nave">
          Pending Friend Requests ({requests.length})
        </h2>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-nave transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <Image
                src={getAvatarUrl(request.senderAvatar)}
                alt={request.senderUsername}
                width={48}
                height={48}
                className="rounded-full object-cover w-12 h-12"
                unoptimized
              />
              <div className="flex-1">
                <p className="font-semibold text-black-nave">
                  {request.senderUsername}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleAccept(request.senderId)}
                className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                title="Accept"
                disabled={busyIds.has(request.senderId)}
              >
                <Check size={20} weight="bold" />
              </button>
              <button
                onClick={() => handleDecline(request.senderId)}
                className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                title="Decline"
                disabled={busyIds.has(request.senderId)}
              >
                <X size={20} weight="bold" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
