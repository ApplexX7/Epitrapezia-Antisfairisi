import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import React, { ReactNode, MouseEventHandler } from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAvatarUrl(avatar?: string): string {
  if (!avatar) return "/images/defaultAvatare.jpg";
  // Keep image paths as-is
  if (avatar.startsWith("/images/")) return avatar;

  // Strip localhost/server host and extract path for /uploads
  let path = avatar;
  if (avatar.startsWith("http://localhost") || avatar.startsWith("http://server")) {
    const url = new URL(avatar, "http://localhost");
    path = url.pathname + (url.search || "");
  }

  // For /uploads paths, use absolute URL with current host so it goes through reverse proxy
  if (path.startsWith("/uploads")) {
    if (typeof window !== "undefined") {
      const { protocol, hostname, port } = window.location;
      return `${protocol}//${hostname}${port ? ':' + port : ''}${path}`;
    }
    return path; // Server-side fallback
  }

  // Keep full http/https URLs as-is
  if (avatar.startsWith("http")) return avatar;

  // Use env base if configured, otherwise return relative path
  const envBase = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "");
  if (envBase) return `${envBase}${avatar}`;

  return avatar;
}

export type BoxLayoutProps = {
  className?: string;
  children?: React.ReactNode;
};

export type TabProps = {
  children: React.ReactNode;
  setPosition: React.Dispatch<React.SetStateAction<{ left: number; width: number; opacity: number }>>;
  link: string;
};

export type CursorProps = {
  position: { left: number; width: number; opacity: number };
};


export interface CustomButtonProps {
    className?: string;
    bgImage?: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    children?: ReactNode;
}