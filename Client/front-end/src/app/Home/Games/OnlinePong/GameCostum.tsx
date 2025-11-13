"use client";
import "@/app/globals.css";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type GameCostumProps = {
  currentBall: string;
  currentBoard: string;
  currentDiff: string;
  currentPaddle: string;
  setCurrentBall: React.Dispatch<React.SetStateAction<string>>;
  setCurrentBoard: React.Dispatch<React.SetStateAction<string>>;
  setCurrentDiff: React.Dispatch<React.SetStateAction<string>>;
  setCurrentPaddle: React.Dispatch<React.SetStateAction<string>>;
};

export default function GameCostum({
  currentBall,
  currentBoard,
  currentDiff,
  currentPaddle,
  setCurrentBall,
  setCurrentBoard,
  setCurrentDiff,
  setCurrentPaddle,
}: GameCostumProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleResetDev = () => {
    setCurrentDiff("easy");
    setCurrentBall("default");
    setCurrentBoard("default");
    setCurrentPaddle("default");
  };

  let handleBallClick = (color: string) => {
    setCurrentBall(color);
  };
  let handlePaddleClick = (color: string) => {
    setCurrentPaddle(color);
  };
  let handleBoardClick = (color: string) => {
    setCurrentBoard(color);
  };
  let handleDiffClick = (diff: string) => {
    setCurrentDiff(diff);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="bg-gradient-to-r from-violet-500 to-purple-500 w-[70%] max-w-[80%] flex flex-col p-4 sm:p-6"
        style={{ maxWidth: "80vw", height: "80vh" }}
      >
        <DialogHeader>
          <DialogTitle className="text-center">
            Choose Your Game Customization Options
          </DialogTitle>
        </DialogHeader>

        {/* board preview */}
        <div
          className="relative w-full h-[65%] mb-4"
          style={{
            backgroundColor:
              currentBoard === "default"
                ? "#0A0F2A"
                : currentBoard === "blue"
                ? "blue"
                : currentBoard === "black"
                ? "black"
                : currentBoard === "red"
                ? "firebrick"
                : "#0A0F2A",
          }}
        >
          <div className="relative w-full h-full">
            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center z-40"></div>

            <div
              className="absolute left-0 top-1/2 w-[19px] h-[20%] rounded-sm z-20"
              style={{
                backgroundColor:
                  currentPaddle === "default"
                    ? "#FF007F"
                    : currentPaddle === "white"
                    ? "white"
                    : currentPaddle === "green"
                    ? "green"
                    : currentPaddle === "yellow"
                    ? "yellow"
                    : "#FF007F",
                transform: "translateY(-50%)",
              }}
            ></div>

            <div className="absolute left-1/2 top-0 h-full w-[0.5%] -translate-x-1/2 bg-white-smoke z-20"></div>

            <div
              className="absolute left-1/2 top-1/2 w-[24px] h-[24px] rounded-full z-20"
              style={{
                backgroundColor:
                  currentBall === "default"
                    ? "#FF007F"
                    : currentBall === "white"
                    ? "white"
                    : currentBall === "green"
                    ? "green"
                    : currentBall === "yellow"
                    ? "yellow"
                    : "#FF007F",
                transform: "translate(-50%, -50%)",
              }}
            ></div>

            <div
              className="absolute right-0 top-1/2 w-[19px] h-[20%] rounded-sm z-20"
              style={{
                backgroundColor:
                  currentPaddle === "default"
                    ? "#FF007F"
                    : currentPaddle === "white"
                    ? "white"
                    : currentPaddle === "green"
                    ? "green"
                    : currentPaddle === "yellow"
                    ? "yellow"
                    : "#FF007F",
                transform: "translateY(-50%)",
              }}
            ></div>
          </div>
        </div>

        {/* centered customization section */}
        <div className="flex flex-col items-center w-full gap-8">
          <div className="w-full md:w-2/3 space-y-8 flex flex-col items-center">
            {/* Board Color */}
            <div className="flex flex-col items-center w-full">
              <h1 className="text-2xl font-bold text-white tracking-wide mb-2 text-center">
                Choose Your Board Color
              </h1>
              <div className="flex gap-4 justify-center w-full">
                <Button
                  className={`w-28 sm:w-32 cursor-pointer px-4 py-2 ${
                    currentBoard === "default" ? "bg-green-700" : ""
                  }`}
                  onClick={() => handleBoardClick("default")}
                >
                  Default
                </Button>
                <Button
                  className={`w-28 sm:w-32 cursor-pointer px-4 py-2 ${
                    currentBoard === "black" ? "bg-green-700" : ""
                  }`}
                  onClick={() => handleBoardClick("black")}
                >
                  Black
                </Button>
                <Button
                  className={`w-28 sm:w-32 cursor-pointer px-4 py-2 ${
                    currentBoard === "blue" ? "bg-green-700" : ""
                  }`}
                  onClick={() => handleBoardClick("blue")}
                >
                  Blue
                </Button>
                <Button
                  className={`w-28 sm:w-32 cursor-pointer px-4 py-2 ${
                    currentBoard === "red" ? "bg-green-700" : ""
                  }`}
                  onClick={() => handleBoardClick("red")}
                >
                  Red
                </Button>
              </div>
            </div>

            {/* Ball Color */}
            <div className="flex flex-col items-center w-full">
              <h1 className="text-2xl font-bold text-white tracking-wide mb-2 text-center">
                Choose Your Ball Color
              </h1>
              <div className="flex gap-4 justify-center w-full">
                <Button
                  className={`w-28 sm:w-32 cursor-pointer px-4 py-2 ${
                    currentBall === "default" ? "bg-green-700" : ""
                  }`}
                  onClick={() => handleBallClick("default")}
                >
                  Default
                </Button>
                <Button
                  className={`w-28 sm:w-32 cursor-pointer px-4 py-2 ${
                    currentBall === "white" ? "bg-green-700" : ""
                  }`}
                  onClick={() => handleBallClick("white")}
                >
                  White
                </Button>
                <Button
                  className={`w-28 sm:w-32 cursor-pointer px-4 py-2 ${
                    currentBall === "green" ? "bg-green-700" : ""
                  }`}
                  onClick={() => handleBallClick("green")}
                >
                  Green
                </Button>
                <Button
                  className={`w-28 sm:w-32 cursor-pointer px-4 py-2 ${
                    currentBall === "yellow" ? "bg-green-700" : ""
                  }`}
                  onClick={() => handleBallClick("yellow")}
                >
                  Yellow
                </Button>
              </div>
            </div>

            {/* Paddle Color */}
            <div className="flex flex-col items-center w-full">
              <h1 className="text-2xl font-bold text-white tracking-wide mb-2 text-center">
                Choose Your Paddles Color
              </h1>
              <div className="flex gap-4 justify-center w-full">
                <Button
                  className={`w-28 sm:w-32 cursor-pointer px-4 py-2 ${
                    currentPaddle === "default" ? "bg-green-700" : ""
                  }`}
                  onClick={() => handlePaddleClick("default")}
                >
                  Default
                </Button>
                <Button
                  className={`w-28 sm:w-32 cursor-pointer px-4 py-2 ${
                    currentPaddle === "white" ? "bg-green-700" : ""
                  }`}
                  onClick={() => handlePaddleClick("white")}
                >
                  White
                </Button>
                <Button
                  className={`w-28 sm:w-32 cursor-pointer px-4 py-2 ${
                    currentPaddle === "green" ? "bg-green-700" : ""
                  }`}
                  onClick={() => handlePaddleClick("green")}
                >
                  Green
                </Button>
                <Button
                  className={`w-28 sm:w-32 cursor-pointer px-4 py-2 ${
                    currentPaddle === "yellow" ? "bg-green-700" : ""
                  }`}
                  onClick={() => handlePaddleClick("yellow")}
                >
                  Yellow
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="flex-1 flex flex-col justify-end">
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleResetDev}>
              Reset to default
            </Button>
            <DialogClose asChild>
              <Button onClick={() => setIsOpen(false)}>Save</Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
