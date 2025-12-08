import { Button } from "@/components/ui/button";
import Link from "next/link"

export default function Home() {
    return (
     <div className="flex flex-row items-center justify-center min-h-screen gap-4">
        <Link href="/Home/Games/Tournament/joinTournament">
        <div
          id="HandClash"
          className="
            absolute
            w-[32vw] h-[60vh]
            top-[20vh] left-[55vw]
            rounded-[2vw]
            rotate-0
            bg-cover bg-center bg-no-repeat
            shadow-[0_0_2vw_rgba(0,0,0,0.5)]
            transition-all duration-700
            hover:scale-110
            cursor-pointer
            brightness-90
            backdrop-blur-md
            filter hover:brightness-125
          "
          style={{
            backgroundImage: "url('/images/rps.png')", // rigl chi tswira hna prompt engineering wkda
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
            Join Tournament
          </span>
        </div>
      </Link>
      <Link href="/Home/Games/Tournament/createTournament">
     <div
      id = "localPong"
      className="
      absolute
      w-[32vw] h-[60vh]
      top-[20vh] left-[10vw]
      rounded-[2vw]
      rotate-0
      opacity-[0.8]
      bg-cover bg-center
      shadow-[0_0_2vw_rgba(0,0,0,0.5)]
      transition-all duration-700
      hover:scale-110
      filter hover:brightness-[1.75]
      cursor-pointer
    "
        style={{ backgroundImage: "url('/images/rps.png')", // chi tswira hna tahya hh

        }}>  
    <span
      className="
        absolute
        left-1/2 bottom-0
        -translate-x-1/2 translate-y-1/3
        font-poppins font-semibold
        text-[32px] leading-[100%] tracking-[0%]
        text-white
        whitespace-nowrap
    ">
          Create Tournament
    </span>
    </div>
    </Link>
     </div>
    );
  }