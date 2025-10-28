'use client'
import Link from "next/link"

export default function HandClash() {
  return (
    <>
      <Link href="/Home/Games/HandClash">
        <div
          id="HandClash"
          className="
            absolute
            w-[20vw] h-[60vh]
            top-[20vh] left-[70vw]
            rounded-[2vw]
            rotate-0
            bg-cover bg-center bg-no-repeat
            shadow-[0_0_2vw_rgba(0,0,0,0.5)]
            transition-all duration-700
            hover:scale-110
            cursor-pointer
            brightness-90
            backdrop-blur-md
            hover:brightness-125
          "
          style={{
            backgroundImage: "url('/images/rps.png')",
          }}
        >
          <span
            className="
              absolute
              left-1/2 bottom-0
              -translate-x-1/2 translate-y-1/3
              font-poppins font-semibold
              text-[32px] leading-[100%]
              text-white
              whitespace-nowrap
            "
          >
            Hand Clash
          </span>
        </div>
      </Link>
    </>
  )
}
