import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "./hooks/authProvider";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSocketStore } from "./hooks/SocketIOproviders";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface OTPProps {
  email: string;
  player_id: number;
}

export function InputOTPWithSeparator({ email, player_id }: OTPProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();
  const initSocket = useSocketStore((state) => state.initSocket)

  const handleSubmit = useCallback(async () => {
    if (otp.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    try {
      const res = await api.post("/auth/verify-otp", { player_id, otp });
      if (
        res.data?.message === "Email verified successfully" &&
        res.data?.token?.accessToken &&
        res.data.user
      ) {
        const { accessToken } = res.data.token;
        const user = res.data.user;
        useAuth.getState().setAuth(user, accessToken);
        initSocket(user, accessToken);
        setSuccess(true);
        toast.success(`Welcome, ${user.username || "User"}! 👋`);
        router.push("/Home");
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "OTP verification failed");
    }
  }, [otp, router, initSocket, player_id]);

  useEffect(() => {
    if (otp.length === 6) {
      handleSubmit();
    }
  }, [otp, handleSubmit]);
  const handleResend = async () => {
    try {
      const res = await api.post("/auth/resend-otp", { email, player_id });
      setResendMessage(res.data?.message || "OTP resent successfully!");
      setError("");
      setOtp("");
      setCooldown(30);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to resend OTP");
    }
  };

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  if (success) {
    return <p className="text-green-500">✅ Email verified successfully!</p>;
  }

  return (
    <form
    onSubmit={(e) => {
      e.preventDefault();
      handleSubmit();
    }}
    className="flex flex-col items-center justify-center gap-4 w-full h-full"
    >
      {resendMessage && <p className="text-blue-500">{resendMessage}</p>}
      <InputOTP
        maxLength={6}
        value={otp}
        onChange={(value: string) => {
          setOtp(value);
          setError("");
        }}
     >
        <InputOTPGroup>
          <InputOTPSlot className="" index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>

      {error && <p className="text-red-500">{error}</p>}

      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded ctive:scale-95 active:bg-gray-700"
      >
        Verify OTP
      </button>

      <button
        type="button"
        onClick={handleResend}
        disabled={cooldown > 0}
        className={`mt-2 px-4 py-2 rounded text-white ${
          cooldown > 0 ? "bg-gray-400 cursor-not-allowed" : "bg-gray-600 active:scale-95 active:bg-gray-700"
        }`}
      >
        {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
      </button>
    </form>
  );
}
