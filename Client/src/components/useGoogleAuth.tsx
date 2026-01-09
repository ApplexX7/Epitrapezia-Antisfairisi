"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useAuth } from "./hooks/authProvider";

interface GoogleCredentialResponse {
  credential?: string;
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: { client_id?: string; callback: (response: GoogleCredentialResponse) => void }) => void;
          renderButton: (container: HTMLElement, options: object) => void;
        };
      };
    };
  }
}

export function useGoogleAuth() {
  const router = useRouter();

  const handleCredentialResponse = useCallback(async (response: GoogleCredentialResponse) => {
    if (!response?.credential) {
      console.error("No credential received from Google");
      return;
    }

    try {
      const res = await api.post("/auth/google", {
        credential: response.credential,
      });

      if (res.data?.token?.accessToken && res.data.user) {
        useAuth.getState().setAuth(res.data.user, res.data.token.accessToken);
        router.push("/home");
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      console.error("Google Auth failed:", error.response?.data || error.message);
    }
  }, [router]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (!window.google) return;

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      const buttonContainer = document.getElementById("google-login-button");
      if (buttonContainer) {
        window.google.accounts.id.renderButton(buttonContainer, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
        });
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [handleCredentialResponse]);

  return {};
}
