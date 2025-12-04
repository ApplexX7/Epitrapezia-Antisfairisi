'use client';

export default function VSBanner() {
  return (
    <div className="relative w-[38vw] h-[7vh] max-w-[650px] mb-[8vh]">
      <div className="absolute bg-white/10 backdrop-blur-sm rounded-full w-full h-full"></div>

      <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <img src="/images/defaultAvatare.jpg" className="h-[6vh] w-[6vh] rounded-full" />
        <span className="font-bold text-lg">Saloua</span>
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-black">
        VS
      </div>

      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <span className="font-bold text-lg">Saloua</span>
        <img src="/images/defaultAvatare.jpg" className="h-[6vh] w-[6vh] rounded-full" />
      </div>
    </div>
  );
}
