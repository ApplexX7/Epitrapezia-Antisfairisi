import React, { useState } from "react";
import { useAuth } from "./hooks/authProvider";
import api from "@/lib/axios";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

interface OTPProps {
  email: string;
  player_id: number;
}

export function InputOTPWithSeparator({email , player_id} : OTPProps) {
  const [otpValue, setOtpValue] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (index: number, value: string) => {
    const newOtp = [...otpValue];
    newOtp[index] = value;
    setOtpValue(newOtp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpValue.join("");
    console.log(otp, "   ",player_id);
    try {
      const res = await api.post("/auth/verify-otp", {
        player_id,
        otp,
      });
      if (res.data?.message === "Email verified successfully") {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "OTP verification failed");
    }
  };

  if (success) return <p className="text-green-500">Email verified successfully!</p>;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
      <InputOTP maxLength={6}>
        <InputOTPGroup>
          <InputOTPSlot index={0} value={otpValue[0]} onValueChange={(val) => handleChange(0, val)} />
          <InputOTPSlot index={1} value={otpValue[1]} onValueChange={(val) => handleChange(1, val)} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={2} value={otpValue[2]} onValueChange={(val) => handleChange(2, val)} />
          <InputOTPSlot index={3} value={otpValue[3]} onValueChange={(val) => handleChange(3, val)} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={4} value={otpValue[4]} onValueChange={(val) => handleChange(4, val)} />
          <InputOTPSlot index={5} value={otpValue[5]} onValueChange={(val) => handleChange(5, val)} />
        </InputOTPGroup>
      </InputOTP>
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
        Verify OTP
      </button>
    </form>
  );
}
