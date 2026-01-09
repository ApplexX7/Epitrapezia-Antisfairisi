'use client'
import "../../globals.css";
import Tournament from "./Tournament";
import PongGame from "./PongGame";
import HandClash from "./tic_tac_toe";

export default function Games() {
  return (
    <>
    <Tournament />
    <PongGame />
    <HandClash />
    </>
  );
}