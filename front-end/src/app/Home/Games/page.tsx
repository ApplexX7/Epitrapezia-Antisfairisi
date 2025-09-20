import "../../globals.css";
export default function Home() {
  return (
    <>
     <div
   className="
   absolute
   w-[20vw] h-[60vh]  /* increased from 50vh */
   top-[20vh] left-[10vw]
   rounded-[2vw]
   rotate-0
   opacity-[0.8]
   bg-cover bg-center
   shadow-[0_0_2vw_rgba(0,0,0,0.5)]
 "
      style={{ backgroundImage: "url('/images/localPong.png')" }}
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
    Masters Arena
  </span>
    </div>
   <div
  id="OnlineTourPong"
  className="
    absolute
    w-[22vw] h-[65vh]  /* increased from 55vh */
    top-[18vh] left-[40vw]
    rounded-[2vw]
    rotate-0
    opacity-100
    bg-cover bg-center
    shadow-[0_0_2vw_rgba(0,0,0,0.5)]
  "
  style={{ backgroundImage: "url('/images/onlineAndTour.png')" }}
  
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
    w-[20vw] h-[60vh]  /* increased from 50vh */
    top-[20vh] left-[70vw]
    rounded-[2vw]
    rotate-0
    opacity-[0.65]
    bg-cover bg-center
    shadow-[0_0_2vw_rgba(0,0,0,0.5)]
  " id="HandClash"
  style={{ backgroundImage: "url('/images/rps.png')" }}
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