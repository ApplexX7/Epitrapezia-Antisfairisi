import "@/app/globals.css";
import Image from "next/image";
import React from "react";
import Link from 'next/link'
export default function LogoPong() {
  return (
    <Link href="/Home/Games">
    <div className="fixed top-[-20px] left-0 ml-4">
      <Image
        className="w-[167px] h-[250px] xl:block hidden md:block"
        alt="Logo for a ping pong"
  src="/images/Logo-S.png"
        width={450}
        height={450}
      />
    </div>
    </Link>
  );
}
