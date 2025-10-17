'use client'
import "../../globals.css";
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