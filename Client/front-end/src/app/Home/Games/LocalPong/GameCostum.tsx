'use client';
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

type GameCostumProps =
{
  currentBall: string;
  currentBoard: string;
  currentDiff: string;
  currentPaddle: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentBall: React.Dispatch<React.SetStateAction<string>>;
  setCurrentBoard: React.Dispatch<React.SetStateAction<string>>;
  setCurrentDiff: React.Dispatch<React.SetStateAction<string>>;
  setCurrentPaddle: React.Dispatch<React.SetStateAction<string>>;

}

export default function GameCostum({
  currentBall,
  currentBoard,
  currentDiff,
  currentPaddle,
  setCurrentBall,
  setCurrentBoard,
  setCurrentDiff,
  setCurrentPaddle,
  isOpen,
  setIsOpen
}: GameCostumProps) {
  // const [isOpen, setIsOpen] = useState(true);
  const handleResetDev = () => {
    setCurrentDiff("easy");
    setCurrentBall("default");
    setCurrentBoard("default");
    setCurrentPaddle("default");
    // here i have to put back the old values 
  };
  // let [currentBoard, setCurrentBoard] = useState("default");
  // let [currentBall, setCurrentBall] = useState("default");
  // let [currentPaddle, setCurrentPaddle] = useState("default");
  // let [currentDiff, setCurrentDiff] = useState("easy");

  let handleBallClick = (color: string) =>
  {
    setCurrentBall(color);
  };
  let handlePaddleClick = (color : string) =>
  {
    setCurrentPaddle(color);
  };
  let handleBoardClick = (color: string) =>
  {
    setCurrentBoard(color);
  };
  let handleDiffClick = (diff: string) =>
  {
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

        {/* board part */}
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
              style={{ backgroundColor:
            currentPaddle === "default"
              ? "#FF007F"
              : currentPaddle === "white"
              ? "white"
              : currentPaddle === "green"
              ? "green"
              : currentPaddle === "yellow"
              ? "yellow"
              : "#FF007F"
              , transform: "translateY(-50%)" }}
            ></div>

            <div className="absolute left-1/2 top-0 h-full w-[0.5%] -translate-x-1/2 bg-white-smoke z-20"></div>

            <div
              className="absolute left-1/2 top-1/2 w-[24px] h-[24px] rounded-full z-20"
              style={{ backgroundColor:
                currentBall === "default"
                  ? "#FF007F"
                  : currentBall === "white"
                  ? "white"
                  : currentBall === "green"
                  ? "green"
                  : currentBall === "yellow"
                  ? "yellow"
                  : "#FF007F", transform: "translate(-50%, -50%)" }}
            ></div>

            <div
              className="absolute right-0 top-1/2 w-[19px] h-[20%] rounded-sm z-20"
              style={{ backgroundColor:
                currentPaddle === "default"
                  ? "#FF007F"
                  : currentPaddle === "white"
                  ? "white"
                  : currentPaddle === "green"
                  ? "green"
                  : currentPaddle === "yellow"
                  ? "yellow"
                  : "#FF007F", transform: "translateY(-50%)" }}
            ></div>
          </div>
        </div>

        {/* game colors and difficulty customization */}
        <div className="flex flex-col md:flex-row justify-between w-full gap-8">
  {/* game colors customization part */}
  <div className="w-full md:w-1/2 space-y-8">
    <div>
      <h1 className="text-2xl font-bold text-white tracking-wide mb-2">
        Choose Your Board Color
      </h1>
      <div className="flex gap-4">
      <Button className={`cursor-pointer px-4 py-2 ${currentBoard === "default" ? "bg-green-700" : ""}`} onClick={() => handleBoardClick("default")}>Default</Button>
        <Button className={`cursor-pointer px-4 py-2 ${currentBoard === "black" ? "bg-green-700" : ""}`} onClick={() => handleBoardClick("black")}>Black</Button>
        <Button className={`cursor-pointer px-4 py-2 ${currentBoard === "blue" ? "bg-green-700" : ""}`} onClick={() => handleBoardClick("blue")}>Blue</Button>
        <Button className={`cursor-pointer px-4 py-2 ${currentBoard === "red" ? "bg-green-700" : ""}`} onClick={() => handleBoardClick("red")}>Red</Button>
      </div>
    </div>

    <div>
      <h1 className="text-2xl font-bold text-white tracking-wide mb-2">
        Choose Your Ball Color
      </h1>
      <div className="flex gap-4">
        <Button className={`cursor-pointer px-4 py-2 ${currentBall === "default" ? "bg-green-700" : ""}`} onClick={() => handleBallClick("default")}>Default</Button>
        <Button className={`cursor-pointer px-4 py-2 ${currentBall === "white" ? "bg-green-700" : ""}`} onClick={() => handleBallClick("white")}>White</Button>
        <Button className={`cursor-pointer px-4 py-2 ${currentBall === "green" ? "bg-green-700" : ""}`} onClick={() => handleBallClick("green")}>Green</Button>
        <Button className={`cursor-pointer px-4 py-2 ${currentBall === "yellow" ? "bg-green-700" : ""}`} onClick={() => handleBallClick("yellow")}>Yellow</Button>
      </div>
    </div>

    <div>
      <h1 className="text-2xl font-bold text-white tracking-wide mb-2">
        Choose Your Paddles Color
      </h1>
      <div className="flex gap-4">
        <Button className={`cursor-pointer px-4 py-2 ${currentPaddle === "default" ? "bg-green-700" : ""}`} onClick={() => handlePaddleClick("default")}>Default</Button>
        <Button className={`cursor-pointer px-4 py-2 ${currentPaddle === "white" ? "bg-green-700" : ""}`} onClick={() => handlePaddleClick("white")}>White</Button>
        <Button className={`cursor-pointer px-4 py-2 ${currentPaddle === "green" ? "bg-green-700" : ""}`} onClick={() => handlePaddleClick("green")}>Green</Button>
        <Button className={`cursor-pointer px-4 py-2 ${currentPaddle === "yellow" ? "bg-green-700" : ""}`} onClick={() => handlePaddleClick("yellow")}>Yellow</Button>
      </div>
    </div>
  </div>

  {/* difficulty customization part */}

<div className="w-full md:w-1/2 flex flex-col items-center justify-start">
  <h1 className="text-2xl font-bold text-white tracking-wide mb-6">
    Difficulty
  </h1>

  <div className="flex flex-col w-[70%] gap-4">
  <Button className={`w-full h-14 text-lg cursor-pointer ${currentDiff === "easy" ? "bg-green-700" : ""}`} onClick={
    () =>
    {
      handleDiffClick("easy");
    }
  }>Easy</Button>
  <Button className={`w-full h-14 text-lg cursor-pointer ${currentDiff === "medium" ? "bg-green-700" : ""}`} onClick={
    ()=>
      {
        handleDiffClick("medium");
      }
  }>Medium</Button>
  <Button className={`w-full h-14 text-lg cursor-pointer ${currentDiff === "hard" ? "bg-green-700" : ""}`}
  onClick={() => handleDiffClick("hard")}
  >Hard</Button>
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
