import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import React, { ReactNode, MouseEventHandler } from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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