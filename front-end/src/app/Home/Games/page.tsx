'use client'
import "../../globals.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import Tournament from "./Tournament";
import PongGame from "./PongGame";
import HandClash from "./HandClash";

export default function Games() {
  return (
    <>
    <Tournament />
    <PongGame />
    <HandClash />
    </>
  );
}