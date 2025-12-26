'use client'
import Link from "next/link"

export default function tic_tac_toe() {
  return (
    <>
      <div
        id="tic_tac_toe"
        className="
          absolute
          w-[20vw] h-[60vh]
          top-[20vh] left-[70vw]
          rounded-[2vw]
          bg-cover bg-center bg-no-repeat
          shadow-[0_0_2vw_rgba(0,0,0,0.5)]
          transition-all duration-700
          hover:scale-110
          cursor-pointer
          brightness-90
          hover:brightness-125
        "
        style={{
          backgroundImage: "url('/images/rps.png')",
        }}
      >

        <Link href="/Home/Games/TicTacToe/online">
          <div
            className="
              absolute inset-0
              rounded-[2vw]
              backdrop-blur-sm
              backdrop-brightness-120
              hover:backdrop-blur-none
              transition-all
            "
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 65%, 0 35%)',
            }}
          >
            <span
              className="
                absolute
                font-poppins font-semibold
                text-white whitespace-nowrap
              "
              style={{
                left: '50%',
                top: '30%',
                transform: 'translate(-50%, -50%) rotate(30deg)',
                fontSize: 'clamp(16px, 3vw, 36px)',
              }}
            >
              Online Tic
            </span>
          </div>
        </Link>

        <Link href="/Home/Games/TicTacToe/local">
          <div
            className="
              absolute inset-0
              rounded-[2vw]
              backdrop-blur-sm
              backdrop-brightness-80
              hover:backdrop-blur-none
              transition-all
            "
            style={{
              clipPath: 'polygon(0 35%, 100% 65%, 100% 100%, 0 100%)',
            }}
          >
            <span
              className="
                absolute
                font-poppins font-semibold
                text-white whitespace-nowrap
              "
              style={{
                left: '50%',
                top: '70%',
                transform: 'translate(-50%, -50%) rotate(30deg)',
                fontSize: 'clamp(16px, 3vw, 36px)',
              }}
            >
              Local Tic
            </span>
          </div>
        </Link>

        <span
          className="
            absolute
            left-1/2 bottom-0
            -translate-x-1/2 translate-y-1/3
            font-poppins font-semibold
            text-[32px]
            text-white
            whitespace-nowrap
          "
        >
          Tic Tac Teo
        </span>

      </div>
    </>
  )
}
