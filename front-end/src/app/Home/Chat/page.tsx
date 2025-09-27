'use client'
import Image from "next/image";
import { MagnifyingGlass, Plus } from "@phosphor-icons/react/ssr";
import { CustomButton } from "@/components/CostumButton"
import { useEffect, useState } from "react";

export default function Home() {
  const [time, setTime] = useState( 
    new Date().toLocaleTimeString([], {hour:"2-digit", minute: "2-digit"})
  )

  useEffect(()=>{
    const interval = setInterval(()=>{
      setTime(new Date().toLocaleTimeString([], { hour:"2-digit", minute: "2-digit"}));
    }, 60000);
    return ()=>clearInterval(interval);
  },[]);


  const chats = [
    {id:1 ,name: "saloua", last: "s simple dummy ..", time , online:true},
    {id:2 ,name: "Applex", last: "hello", time ,  online:false}, 
  ];

  const message ={
    1: [
      { id: 1, user: "other", text: "Hi Saloua" },
      { id: 2, user: "me", text: "Hello 👋" },
    ],
    2: [
      { id: 1, user: "other", text: "Hey Alex! gfd gfd fds gfdshrfcjmdixkms vgfd gfd fds gfdshrfcjmdixkmsgfd gfd fds gfdshrfcjmdixkms" },
      { id: 2, user: "me", text: "Hi hgfd gfd gfd gfd fds gfdshrfcjmdixkms" },
    ],
  };

  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className=" flex border-none h-full justify-center shadow-[2px_2px_5px_3px_rgba(0,0,0,0.3)] 
    items-center  bg-[#F5F5F5]/40  rounded-xl m-10">
      <div className="flex flex-col w-2/3 sm:w-1/3 h-full backdrop-brightness-[120%]
        bg-black/50 border-[#000000] rounded-l-xl">
        <div className="flex gap-2 w-full justify-between py-5 items-center self-start">
          <h2 className="border-none font-bold text-3xl text-black-nave pl-10">Recent chat</h2>
          <div className="flex gap-4 px-5">
            <CustomButton className="flex justify-center items-center bg-white-smoke/10 hover:opacity-40
            h-[48px] w-[48px] rounded-4xl shadow-[inset_2px_0px_4px_rgba(245,245,245,0.3)]">
              <MagnifyingGlass size={25} color="#0d0c22" weight="bold"/>
            </CustomButton>
            <CustomButton className="flex justify-center items-center bg-white-smoke/10 hover:opacity-40
            h-[48px] w-[48px] rounded-4xl shadow-[inset_2px_0px_4px_rgba(245,245,245,0.3)] ">
              <Plus size={25} weight="bold" />
            </CustomButton>
          </div>
        </div>
        <div className="flex h-[2px] w-130 bg-white/30 mx-auto mb-5"></div>
        <div className="flex-1 space-y-4 overflow-y-auto">
          {chats.map((chat) =>(
          <div
            key={chat.id}
            onClick={() => setSelectedChat(chat.id)}
            className={`flex items-center gap-3 m-0 p-2 ${selectedChat === chat.id ? "bg-white/20" : "hover:bg-white/20 cursor-pointer"}`}
          > 
          <div className="relative">
            <Image src="/images/defaultAvatare.jpg"  alt="Profile" width={40} height={40} className="rounded-full gap-2 ml-7" />
            <div className={`absolute bottom-0 right-0 w-3 h-3 ${chat.online ? "bg-green-500" : "bg-none"} border-2 border-none rounded-full `}></div>
          </div>
          <div className="flex-1">
            <p className="text-white font-medium">{chat.name}</p>
            <p className="text-gray-300 text-sm truncate"> {chat.last} </p>
          </div>
          <span className="text-xs text-gray-200 mr-7"> {chat.time} </span>
          </div>
          ))}
        </div>
      </div>
      <div className="w-2/3 h-full rounded-r-xl flex flex-col flex-1">
        {selectedChat ? (
          <>
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              {message[selectedChat].map((msg) => (
                <div key={`${selectedChat}-${msg.id}`} className={`flex ${msg.user === "me" ? "justify-end-safe" : "justify-start"}`}>
                  <div className={`flex gap-2 ${msg.user === "me" ? "justify-end-safe" : ""}`}>
                    {msg.user !== "me" && (
                      <Image src="/images/defaultAvatare.jpg" alt="Profile" width={40} height={40} className="rounded-full mt-2 self-end" />
                    )}
                    <div className={`px-4 py-2 rounded-2xl max-w-[70%] text-sm ${
                      msg.user === "me"
                      ? "bg-[#D1DAE9]/40 text-black-nave font-medium rounded-br-none"
                      : "bg-[#D1DAE9]/40 text-black-nave font-medium rounded-bl-none "
                    }`}>
                      {msg.text}
                    </div>
                    {msg.user === "me" && (
                      <Image src="/images/defaultAvatare.jpg" alt="Profile" width={40} height={40} className="self-end rounded-full mt-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4  bg-[#D1DAE9]/20 border-t border-none rounded-br-xl">
              <div className="w-full max-w-7xl ">
                <div className="flex items-center gap-4 ">
                  <div className="flex-1 relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                      <button className="flex items-center justify-center transition-colors">
                        <Plus size={30} weight="bold" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Write Something"
                      className="w-full pl-16 pr-6 py-4 bg-[#D1DAE9]/30 rounded-xl 
                      text-black-nave font-bold boder-none 
                      shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3)] 
                      focus:outline-none focus:ring-1 focus:ring-white
                      placeholder:text-black-nave/80"
                    />
                  </div>
                  <button
                    className="px-8 py-4 bg-[#D1DAE9]/30 hover:bg-black/30 text-black-nave rounded-xl font-bold
                    shadow-[2px_2px_5px_rgba(0,0,0,0.3)] focus:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3)]">
                    Send
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-full">
            👈 Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}