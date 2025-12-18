import { useState } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";

interface Message {
  id: string | number;
  text: string;
  time: Date;
  user: "me" | "other";
  seen: boolean;
  avatar: string;
}

interface ChatWindowProps {
  selectedChat: string | null;
  messages: Message[];
  friendImageUser: string;
  userAvatar: string;
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: () => void;
  onBackToChats: () => void;
  showChatList: boolean;
  setShowChatList: (show: boolean) => void;
}

export const ChatWindow = ({
  selectedChat,
  messages,
  friendImageUser,
  userAvatar,
  inputMessage,
  setInputMessage,
  onSendMessage,
  onBackToChats,
  showChatList,
  setShowChatList
}: ChatWindowProps) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className={`${showChatList ? 'hidden md:flex' : 'flex'} w-full md:w-2/3 h-full rounded-r-xl flex-col flex-1`}>
      {selectedChat ? (
        <>
          <ChatHeader
            selectedChat={selectedChat}
            friendImageUser={friendImageUser}
            showMenu={showMenu}
            setShowMenu={setShowMenu}
            onBackToChats={onBackToChats}
          />

          <ChatMessages messages={messages} userAvatar={userAvatar} />

          <ChatInput
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            onSendMessage={onSendMessage}
          />
        </>
      ) : (
        <div className="flex flex-col justify-center items-center h-full text-sm md:text-base gap-4">
          <div className="text-center">
            <p className="text-lg md:text-xl font-bold mb-2">Welcome to Chat</p>
            <p>Select a chat to start messaging</p>
          </div>
          <button 
            onClick={() => setShowChatList(true)}
            className="md:hidden px-6 py-3 bg-[#D1DAE9]/30 hover:bg-black/30 text-black-nave rounded-xl font-bold
              shadow-[2px_2px_5px_rgba(0,0,0,0.3)]">
            View Chats
          </button>
        </div>
      )}
    </div>
  );
};