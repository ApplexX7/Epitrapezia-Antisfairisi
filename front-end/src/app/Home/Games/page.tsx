'use client'
import "../../globals.css";
import { useEffect, useState } from "react";

export default function Home() {
  let [localPongHover, setLocalPongHover] = useState(false);
  let [rpsHover, setrpsHover] = useState(false);
  let handlerpsHover = () =>
  {
    setrpsHover(true);
  }
  let handlerpsUnHover = () =>
  {
    setrpsHover(false);
  }
  let handleLocalHover = () =>
  {
    setLocalPongHover(true);
  }
  let handleLocalUnHover = () =>
  {
    setLocalPongHover(false);
  }
  return (
    <>
     <div
      id = "localPong"
      // onMouseEnter={handleLocalHover}
      // onMouseLeave={handleLocalUnHover}
      className="
        absolute
        w-[20vw] h-[60vh]
        top-[20vh] left-[10vw]
        rounded-[2vw]
        rotate-0
        opacity-[0.8]
        bg-cover bg-center
        shadow-[0_0_2vw_rgba(0,0,0,0.5)]
        duration-700
        transition-transform
        hover:scale-120"
        style={{ backgroundImage: "url('/images/localPong.png')",
        // transition: "filter 0.8s ease",
        filter: localPongHover ? "brightness(3.5)" : "brightness(1)",
        transform: localPongHover ? "scale(1.2)" : "scale(1)",
        }}>  
    <span
      className="
        absolute
        left-1/2 bottom-0
        -translate-x-1/2 translate-y-1/3
        font-poppins font-semibold
        text-[32px] leading-[100%] tracking-[0%]
        text-white">
          Masters Arena
    </span>
    </div>
    <div
  id="OnlineTourPong"
  className="
    absolute
    w-[20vw] h-[60vh]     
    top-[20vh]             
    left-[40vw]             
    rounded-[2vw]
    rotate-0
    opacity-[0.8]
    bg-cover bg-center
    shadow-[0_0_2vw_rgba(0,0,0,0.5)]
    duration-700
    transition-transform
    hover:scale-120
  "
  style={{
    backgroundImage: "url('/images/pongDiv.png')",
  }}
>
<span
    className="
      absolute
      left-1/2 bottom-0
      -translate-x-1/2 translate-y-1/3
      font-poppins font-semibold
      text-[36px] leading-[100%] tracking-[0%]
      text-white
    "
  >
    Head To Head
  </span>
</div >
    <div    className="
    absolute
    w-[20vw] h-[60vh]
    top-[20vh] left-[70vw]
    rounded-[2vw]
    rotate-0
    opacity-[0.65]
    bg-cover bg-center
    shadow-[0_0_2vw_rgba(0,0,0,0.5)]
    duration-700
    transition-transform
    hover:scale-120
  " id="HandClash"
  // onMouseEnter={handlerpsHover}
  // onMouseLeave={handlerpsUnHover}
  style={{ backgroundImage: "url('/images/rps.png')" ,
  // transition: "filter 0.8s ease",
  filter: rpsHover ? "brightness(3.5)" : "brightness(1)",
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
  
    </>
  );
}