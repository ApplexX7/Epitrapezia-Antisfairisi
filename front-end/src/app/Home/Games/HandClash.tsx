'use client'
import Link from "next/link"

export default function HandClash()
{
    return(
        <>
        <Link href="/Home/Games/HandClash">
    <div    className="
    absolute
    w-[20vw] h-[60vh]
    top-[20vh] left-[70vw]
    rounded-[2vw]
    rotate-0
    opacity-[0.65]
    bg-cover bg-center
    shadow-[0_0_2vw_rgba(0,0,0,0.5)]
    transition-all duration-700
    hover:scale-110
    filter hover:brightness-[1.75]
    cursor-pointer

  " id="HandClash"
  // onMouseEnter={handlerpsHover}
  // onMouseLeave={handlerpsUnHover}
  style={{ backgroundImage: "url('/images/rps.png')" ,
  // transition: "filter 0.8s ease",
  // filter: rpsHover ? "brightness(3.5)" : "brightness(1)",
  // transform: rpsHover ? "scale(1.2)" : "scale(1)",
  }}
  >
    <span
    className="
      absolute
      left-1/2 bottom-0
      -translate-x-1/2 translate-y-1/3
      font-poppins font-semibold
      text-[32px] leading-[100%] tracking-[0%]
      text-white
    "
  >
    Hand Clash
  </span>
  </div>
  </Link>
  </>
    )
}