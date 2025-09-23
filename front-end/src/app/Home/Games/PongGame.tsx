'use client'
import Link from 'next/link'



export default function PongGame() {
  return (
    <>
        <div
          id="OnlineTourPong"
          className="
            absolute
            w-[20vw] h-[60vh]     
            top-[20vh]             
            left-[40vw]             
            rounded-[2vw]
            rotate-0
            filter brightness-75
            opacity-[0.8]
            bg-cover bg-center
            shadow-[0_0_2vw_rgba(0,0,0,0.5)]
            transition-all duration-700
            hover:scale-110
            cursor-pointer
          "
          style={{
            backgroundImage: "url('/images/pongDiv.png')",
          }}
        >
        <Link href='/Home/Games/OnlinePong'>
          <div
            className="absolute inset-0  backdrop-blur-sm backdrop-brightness-120 filter hover:brightness-175"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 65%, 0 35%)',
            }}
          ></div>
        </Link>
        <span
  className="
    font-poppins font-semibold
    leading-[100%] tracking-[0%]
    text-white
    absolute
    whitespace-nowrap
  "
  style={{
    left: '50%',
    top: '30%', 
    transform: 'translate(-50%, -50%) rotate(30deg)',
    transformOrigin: 'center center',
    fontSize: 'clamp(16px, 3vw, 36px)',
  }}
>
  Online Matchup
</span>
            <Link href='/Home/Games/LocalPong'>
          <div
            className="absolute inset-0 backdrop-blur-sm backdrop-brightness-80 filter hover:brightness-200"
            style={{
              clipPath: 'polygon(0 35%, 100% 65%, 100% 100%, 0 100%)',
            }}
          ></div>
            </Link>
            <span
  className="
    font-poppins font-semibold
    leading-[100%] tracking-[0%]
    text-white
    absolute
    whitespace-nowrap
  "
  style={{
    left: '50%',
    top: '70%', 
    transform: 'translate(-50%, -50%) rotate(30deg)',
    transformOrigin: 'center center',
    fontSize: 'clamp(16px, 3vw, 36px)'
  }}
>
  Local Face-Off
</span>

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
        </div>
    </>
  );
}
