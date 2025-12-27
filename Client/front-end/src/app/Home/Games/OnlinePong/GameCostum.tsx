'use client';
import "@/app/globals.css";
import { useState } from "react";
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

  const handleBallClick = (color: string) => setCurrentBall(color);
  const handlePaddleClick = (color: string) => setCurrentPaddle(color);
  const handleBoardClick = (color: string) => setCurrentBoard(color);
  const handleDiffClick = (diff: string) => setCurrentDiff(diff);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="bg-gradient-to-r from-violet-500 to-purple-500 w-[70%] max-w-[80%] flex flex-col p-4 sm:p-6"
        style={{
          maxWidth: "80vw",
          maxHeight: "80vh",
          minHeight: "600px",
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-center">
            Choose Your Game Customization Options
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* board preview */}
          <div
            className="relative w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] mb-4 flex-shrink-0"
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
            <div className="absolute inset-0 flex items-center justify-center">
              {/* left paddle */}
              <div
                className="absolute left-0 w-[19px] h-24 sm:h-28 md:h-32 lg:h-36 rounded-sm"
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
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              ></div>

              {/* center line */}
              <div className="absolute left-1/2 top-0 h-full w-[0.5%] -translate-x-1/2 bg-white-smoke"></div>

              {/* ball */}
              <div
                className="absolute left-1/2 top-1/2 w-6 h-6 rounded-full"
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

              {/* right paddle */}
              <div
                className="absolute right-0 w-[19px] h-24 sm:h-28 md:h-32 lg:h-36 rounded-sm"
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
                  top: "50%",
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
                <div className="flex gap-4 flex-wrap justify-center w-full">
                  {["default", "black", "blue", "red"].map((color) => (
                    <Button
                      key={color}
                      className={`w-28 sm:w-32 cursor-pointer px-4 py-2 ${
                        currentBoard === color ? "bg-green-700" : ""
                      }`}
                      onClick={() => handleBoardClick(color)}
                    >
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Ball Color */}
              <div className="flex flex-col items-center w-full">
                <h1 className="text-2xl font-bold text-white tracking-wide mb-2 text-center">
                  Choose Your Ball Color
                </h1>
                <div className="flex gap-4 flex-wrap justify-center w-full">
                  {["default", "white", "green", "yellow"].map((color) => (
                    <Button
                      key={color}
                      className={`w-28 sm:w-32 cursor-pointer px-4 py-2 ${
                        currentBall === color ? "bg-green-700" : ""
                      }`}
                      onClick={() => handleBallClick(color)}
                    >
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Paddle Color */}
              <div className="flex flex-col items-center w-full">
                <h1 className="text-2xl font-bold text-white tracking-wide mb-2 text-center">
                  Choose Your Paddles Color
                </h1>
                <div className="flex gap-4 flex-wrap justify-center w-full">
                  {["default", "white", "green", "yellow"].map((color) => (
                    <Button
                      key={color}
                      className={`w-28 sm:w-32 cursor-pointer px-4 py-2 ${
                        currentPaddle === color ? "bg-green-700" : ""
                      }`}
                      onClick={() => handlePaddleClick(color)}
                    >
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="flex-shrink-0">
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
