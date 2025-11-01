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

        <div className="relative w-full h-[65%] mb-4" style={{ backgroundColor: "#0A0F2A" }}>
  <div className="relative w-full h-full">

    <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center z-40">
    </div>

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

      <div>
        <div>
          <h1>
            Choose Your Board Color
          </h1><br></br>
        <Button className="cursor-pointer">Purple </Button>
        <Button className="cursor-pointer"> Black</Button>
        <Button className="cursor-pointer"> White</Button>

        </div>
        <div>
          <h1>
            Choose Your The Ball Color
          </h1><br></br>
          <Button className="cursor-pointer">Purple </Button>
        <Button className="cursor-pointer"> Black</Button>
        <Button className="cursor-pointer"> White</Button>

        </div>
        <div>
          <h1>
            Choose Your Paddles Color
          </h1><br></br>
          <Button className="cursor-pointer">Purple </Button>
        <Button className="cursor-pointer"> Black</Button>
        <Button className="cursor-pointer"> White</Button>

        </div>
      </div>
        <div className="flex-1 flex flex-col justify-end">
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleResetDev}>Reset to default</Button>
            <DialogClose asChild>
              <Button onClick={() => setIsOpen(false)}>Save</Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
