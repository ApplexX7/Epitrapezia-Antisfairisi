"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useProtectedPage() {
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) {
      router.push("/");
    }
  }, [router]);
}
