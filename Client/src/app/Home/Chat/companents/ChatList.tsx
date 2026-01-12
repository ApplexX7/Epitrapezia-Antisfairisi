import Image from "next/image";
import { MagnifyingGlass } from "@phosphor-icons/react/ssr";
import { Checks } from '@phosphor-icons/react';
import { useRef, useState, useEffect } from "react";
import { User } from "@/components/hooks/authProvider";

interface Message {
  id: number | string;
  text: string;
  time: Date;
  user: "me" | "other";
  seen: boolean;
  avatar: string;
}

interface ChatListProps {
  onlineUsers: User[];
  selectedChat: string | null;
  messages: Record<string, Message[]>;
  loadingHistory: boolean;
  onSelectChat: (username: string) => void;
  currentTime: { clock: string; date: string };
  blockedUsers?: User[];
  showBlockedList?: boolean;
  onToggleBlockedList?: () => void;
  onUnblock?: (username: string) => void;
}

export const ChatList = ({
  onlineUsers,
  selectedChat,
  messages,
  loadingHistory,
  onSelectChat,
  currentTime,
  blockedUsers = [],
  showBlockedList = false,
  onToggleBlockedList = () => {},
  onUnblock = () => {},
}: ChatListProps) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchActive(false);
      }
    };

    if (isSearchActive) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchActive]);

  const getLastMessage = (username: string) => {
    const chatMessages = messages[username] || [];
    if (chatMessages.length === 0) return "No messages yet";
    const lastMsg = chatMessages[chatMessages.length - 1];
    return lastMsg.text.length > 30 ? lastMsg.text.substring(0, 30) + "..." : lastMsg.text;
  };

  const getLastMessageTime = (username: string) => {
    const chatMessages = messages[username] || [];
    if (chatMessages.length === 0) return "";
    const lastMsg = chatMessages[chatMessages.length - 1];
    return lastMsg.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getUnreadCount = (username: string) => {
    const chatMessages = messages[username] || [];
    return chatMessages.filter(msg => msg.user === "other" && !msg.seen).length;
  };

  return (
    <div className="flex flex-col h-full w-full backdrop-brightness-[120%]
      bg-black/50 border-[#000000] rounded-l-xl">
      <div className="flex gap-2 w-full justify-between py-5 items-center self-start">
        {!isSearchActive && (
          <h2 className="border-none font-bold text-2xl md:text-3xl text-black-nave pl-5 md:pl-10">
            {showBlockedList ? "Blocked Users" : "Recent chat"}
          </h2>
        )}
      </div>
      
      <div className="flex flex-col mb-3 md:mb-5 px-5 md:px-10">
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => onToggleBlockedList()}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !showBlockedList 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Friends
          </button>
          <button
            onClick={() => onToggleBlockedList()}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showBlockedList 
                ? 'bg-red-500 text-white' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Blocked ({blockedUsers.length})
          </button>
        </div>
        <div className="flex h-[2px] w-full bg-white/30 mx-auto mb-3 md:mb-5"></div>
      </div>

      <div className="flex-1 space-y-2 md:space-y-4 overflow-y-auto">
        {loadingHistory && (
          <div className="text-center text-white/60 mt-10 px-4">
            <p>Loading conversations...</p>
          </div>
        )}
        
        {!showBlockedList ? (
          !loadingHistory && onlineUsers.length === 0 ? (
            <div className="text-center text-white/60 mt-10 px-4">
              <p>No friends yet</p>
              <p className="text-sm mt-2">Add friends to start chatting</p>
            </div>
          ) : (
            onlineUsers.map((u: User) => {
            const chatMsgs = messages[u.username] || [];
            const lastMsg = chatMsgs[chatMsgs.length - 1];
            const unreadCount = getUnreadCount(u.username);
            
            return (
              <div
                key={`${u.id}-${u.username}`}
                onClick={() => onSelectChat(u.username)}
                className={`flex items-center gap-2 md:gap-3 m-0 p-3 md:p-4 
                  ${selectedChat === u.username ? "bg-white/20" : "hover:bg-white/20 cursor-pointer"}`}
              > 
                <div className="relative">
                  <Image src={u.avatar} alt="Profile" width={40} height={40}
                    className="rounded-full gap-2 ml-3 md:ml-7" />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
                    u.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm md:text-base">{u.username}</p>
                  <p className="text-gray-300 text-xs md:text-sm truncate">{getLastMessage(u.username)}</p>
                </div>
                <div className="flex flex-col items-end gap-1 mr-3 md:mr-7">
                  <span className="text-xs text-gray-200">{getLastMessageTime(u.username) || currentTime.clock}</span>
                  {lastMsg && lastMsg.user === "me" ? (
                    <Checks size={20} weight="bold" className={
                      lastMsg.seen ? "text-blue-500" : "text-gray-400"
                    }/>
                  ) : unreadCount > 0 ? (
                    <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        )
        ) : (
          blockedUsers.length === 0 ? (
            <div className="text-center text-white/60 mt-10 px-4">
              <p>No blocked users</p>
            </div>
          ) : (
            blockedUsers.map((u: User) => (
              <div
                key={`blocked-${u.id}`}
                className="flex items-center gap-2 md:gap-3 m-0 p-3 md:p-4 hover:bg-white/20"
              >
                <div className="relative">
                  <Image src={u.avatar} alt="Profile" width={40} height={40}
                    className="rounded-full gap-2 ml-3 md:ml-7" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full bg-red-500"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm md:text-base">{u.username}</p>
                  <p className="text-gray-400 text-xs md:text-sm">Blocked</p>
                </div>
                <button
                  onClick={() => onUnblock(u.username)}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm mr-3 md:mr-7"
                >
                  Unblock
                </button>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};