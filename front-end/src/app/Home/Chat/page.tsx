import Image from "next/image";
import { MagnifyingGlass, Plus } from "@phosphor-icons/react/ssr";
import { CustomButton } from "@/components/CostumButton"

export default function Home() {
  return (
    <div className=" flex   border-none h-full justify-center shadow-[2px_2px_5px_3px_rgba(0,0,0,0.3)] 
    items-center  bg-[#F5F5F5]/40  rounded-xl m-10">
      <div className="flex flex-col w-2/3 sm:w-1/3 h-full backdrop-brightness-[120%]
        bg-black/50 border-[#000000] rounded-l-xl">
        <div className="flex gap-2 w-full justify-between py-5 items-center self-start">
          <h2 className="border-none font-bold text-3xl text-black-nave pl-10">Recent chat</h2>
          <div className="flex gap-4 px-5">
            <CustomButton className="flex justify-center items-center bg-white-smoke/10 hover:opacity-40 h-[48px] w-[48px] rounded-4xl shadow-[inset_2px_0px_4px_rgba(245,245,245,0.3)]">
              <MagnifyingGlass size={25} color="#0d0c22" weight="bold"/>
            </CustomButton>
            <CustomButton className="flex justify-center items-center bg-white-smoke/10 hover:opacity-40 h-[48px] w-[48px] rounded-4xl shadow-[inset_2px_0px_4px_rgba(245,245,245,0.3)] ">
              <Plus size={25} weight="bold" />
            </CustomButton>
          </div>
        </div>
        <div className="h-[2px] w-16 sm:w-24 lg:w-80 bg-white mx-auto"></div>
      </div>
      
      <div className="w-2/3  h-full rounded-r-xl">
        Centered Content
      </div>
    </div>
  );
}
