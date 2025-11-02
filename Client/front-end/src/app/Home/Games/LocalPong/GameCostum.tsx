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

export default function GameCostum() {
  const [isOpen, setIsOpen] = useState(true);
  let handleDiff = useState[["easy" , "medium"]]
  const handleResetDev = () => {
    // here i have to put back the old values 
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
          style={{ backgroundColor: "#0A0F2A" }}
        >
          <div className="relative w-full h-full">
            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center z-40"></div>

            <div
              className="absolute left-0 top-1/2 w-[19px] h-[20%] rounded-sm z-20"
              style={{ backgroundColor: "#FF007F", transform: "translateY(-50%)" }}
            ></div>

            <div className="absolute left-1/2 top-0 h-full w-[0.5%] -translate-x-1/2 bg-white-smoke z-20"></div>

            <div
              className="absolute left-1/2 top-1/2 w-[24px] h-[24px] rounded-full z-20"
              style={{ backgroundColor: "#FF007F", transform: "translate(-50%, -50%)" }}
            ></div>

            <div
              className="absolute right-0 top-1/2 w-[19px] h-[20%] rounded-sm z-20"
              style={{ backgroundColor: "#FF007F", transform: "translateY(-50%)" }}
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
        <Button className="cursor-pointer px-4 py-2">Black</Button>
        <Button className="cursor-pointer px-4 py-2">Blue</Button>
        <Button className="cursor-pointer px-4 py-2">Red</Button>
      </div>
    </div>

    <div>
      <h1 className="text-2xl font-bold text-white tracking-wide mb-2">
        Choose Your Ball Color
      </h1>
      <div className="flex gap-4">
        <Button className="cursor-pointer px-4 py-2">White</Button>
        <Button className="cursor-pointer px-4 py-2">Green</Button>
        <Button className="cursor-pointer px-4 py-2">Yellew</Button>
      </div>
    </div>

    <div>
      <h1 className="text-2xl font-bold text-white tracking-wide mb-2">
        Choose Your Paddles Color
      </h1>
      <div className="flex gap-4">
        <Button className="cursor-pointer px-4 py-2">White</Button>
        <Button className="cursor-pointer px-4 py-2">Green</Button>
        <Button className="cursor-pointer px-4 py-2">Yellew</Button>
      </div>
    </div>
  </div>

  {/* difficulty customization part */}

<div className="w-full md:w-1/2 flex flex-col items-center justify-start">
  <h1 className="text-2xl font-bold text-white tracking-wide mb-6">
    Difficulty
  </h1>

  <div className="flex flex-col w-[70%] gap-4">
  <Button className="w-full h-14 text-lg cursor-pointer bg-green-700" >Easy</Button>
  <Button className="w-full h-14 text-lg cursor-pointer ">Medium</Button>
  <Button className="w-full h-14 text-lg cursor-pointer">Hard</Button>
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
