import Image from "next/image";
import { ArrowLeft, DotsThreeVertical } from "@phosphor-icons/react/ssr";

interface ChatHeaderProps {
  selectedChat: string | null;
  friendImageUser: string;
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
  onBackToChats: () => void;
  showBackButton?: boolean;
}

export const ChatHeader = ({
  selectedChat,
  friendImageUser,
  showMenu,
  setShowMenu,
  onBackToChats,
  showBackButton = true
}: ChatHeaderProps) => {
  return (
    <div className={`relative flex items-center justify-between gap-3 p-4
      bg-[#D1DAE9]/20 border-b border-white/10`}>
      {showBackButton && (
        <button onClick={onBackToChats} className="flex items-center justify-center md:hidden">
          <ArrowLeft size={24} weight="bold" />
        </button>
      )}
      
      <div className="flex items-center gap-2">
        <Image src={friendImageUser} alt="Profile" width={40} height={40}
          className="rounded-full" />
        <span className="font-bold text-lg">{selectedChat}</span>
      </div>

      <div className="relative">
        <button 
          className="z-[50] p-2 hover:bg-white/10 rounded-lg transition-colors" 
          onClick={() => setShowMenu(!showMenu)}
        >
          <DotsThreeVertical size={40} weight="bold" />
        </button>

        {showMenu && (
          <div className={`
            absolute right-5 z-10 transition-all duration-200 ease-in-out
            cursor-pointer w-[200px] h-[225px]
            rounded-lg flex flex-col items-center justify-around
            bg-white-smoke/45 bg-opacity-70 backdrop-blur-3xl
            ${showMenu ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}>
            <button 
              className="rounded-lg w-[150px] px-4 py-3 hover:bg-[#D1DAE9]/20 border-white/10 mt-2 font-medium"
              onClick={() => setShowMenu(false)}
            >
              Block
            </button>
            
            <button 
              className="rounded-lg w-[150px] px-4 py-3 hover:bg-[#D1DAE9]/20 transition-colors border-white/10 mb-2 font-medium"
              onClick={() => setShowMenu(false)}
            >
              Unblock
            </button>

            <button 
              className="rounded-lg w-[150px] px-4 py-3 hover:bg-[#D1DAE9]/20 transition-colors border-white/10 mb-2 font-medium"
              onClick={() => setShowMenu(false)}
            >
              invite friends to game
            </button>
          </div>
        )}
      </div>
    </div>
  );
};