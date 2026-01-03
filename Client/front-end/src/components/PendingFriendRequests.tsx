"use client"
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import Image from "next/image";
import { getAvatarUrl } from "@/lib/utils";
import { Check, X } from "@phosphor-icons/react/ssr";

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
    try {
      await api.post("/friends/Accept", { friendId: senderId });
      toast.success("Friend request accepted!");
      setRequests(requests.filter((r) => r.senderId !== senderId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to accept request");
    }
  };

  const handleDecline = async (senderId: number) => {
    try {
      await api.post("/friends/Remove", { friendId: senderId });
      toast.success("Friend request declined");
      setRequests(requests.filter((r) => r.senderId !== senderId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to decline request");
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
                className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                title="Accept"
              >
                <Check size={20} weight="bold" />
              </button>
              <button
                onClick={() => handleDecline(request.senderId)}
                className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                title="Decline"
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
