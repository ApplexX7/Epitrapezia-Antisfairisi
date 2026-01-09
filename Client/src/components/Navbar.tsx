"use client"
import "../app/globals.css";
import Link from "next/link";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation"; 
import { TabProps, CursorProps } from "@/lib/utils";

export const NavBar = () => {
  return (
    <div className="rounded-full w-full h-full">
      <SlideTabs />
    </div>
  );
};

const SlideTabs = () => {
  const pathname = usePathname();
  const [position, setPosition] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const moveToActive = useCallback(() => {
    const activeEl = document.querySelector(`[data-link="${pathname}"]`);
    if (activeEl) {
      const { width, left } = (activeEl as HTMLElement).getBoundingClientRect();
      const parentLeft = (activeEl as HTMLElement).offsetParent?.getBoundingClientRect().left ?? 0;

      setPosition({
        left: left - parentLeft,
        width,
        opacity: 1,
      });
    }
  }, [pathname]);

  useEffect(() => {
    moveToActive();
  }, [pathname, moveToActive]);

  // useEffect(() => {
  //   const handleResize = () => {
  //     moveToActive();
  //   };

  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, [pathname]);

  return (
    <ul
      onMouseLeave={moveToActive} 
      className="relative w-full h-full rounded-full
       border-white backdrop-blur-lg flex justify-around 
       items-center ring-1 ring-white-smoke/40 backdrop-brightness-[150%] 
       bg-white-smoke/30 shadow-[3px_2px_3px_1px_rgba(0,0,0,0.2)]"
    >
      <Tab setPosition={setPosition} link="/Home">Home</Tab>
      <Tab setPosition={setPosition} link="/Home/Chat">Chat</Tab>
      <Tab setPosition={setPosition} link="/Home/Games">Games</Tab>
      <Tab setPosition={setPosition} link="/Home/Settings">Settings</Tab>
      <Tab setPosition={setPosition} link="/Home/LeaderBoard">Ascend</Tab>

      <Cursor position={position} />
    </ul>
  );
};

const Tab = ({ children, setPosition, link }: TabProps) => {
  const ref = useRef<HTMLLIElement | null>(null);

  return (
    <li
      ref={ref}
      data-link={link}
      onMouseEnter={() => {
        if (!ref?.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setPosition({
          left: ref.current.offsetLeft,
          width,
          opacity: 1,
        });
      }}
      className="relative z-10 cursor-pointer px-3 py-1.5 sm:text-[22px] rounded-full text-black-nave md:px-5 md:py-3"
    >
      <Link className="block w-full h-full" href={link}>
        {children}
      </Link>
    </li>
  );
};

const Cursor = ({ position }: CursorProps) => {
  return (
    <motion.li
      animate={{
        left: position.left,
        width: position.width,
        opacity: position.opacity,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute z-0 h-7 rounded-full bg-ligth-white/60 shadow-[2px_2px_2px_2px_rgb(0,0,0,0.2)] md:h-12"
    />
  );
};
