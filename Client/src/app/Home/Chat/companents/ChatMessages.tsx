import { useRef, useEffect } from "react";
import Image from "next/image";

interface Message {
  id: string | number;
  text: string;
  time: Date;
  user: "me" | "other";
  seen: boolean;
  avatar: string;
}

interface ChatMessagesProps {
  messages: Message[];
  userAvatar: string;
}

export const ChatMessages = ({ messages, userAvatar }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate: string | null = null;
    let currentGroup: Message[] = [];

    msgs.forEach((msg) => {
      const msgDate = msg.time.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      if (msgDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate!, messages: currentGroup });
        }
        currentDate = msgDate;
        currentGroup = [msg];
      } else {
        currentGroup.push(msg);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate!, messages: currentGroup });
    }

    return groups;
  };

  return (
    <div className="flex-1 p-3 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">
      {messages && messages.length > 0 ? (
        groupMessagesByDate(messages).map((group, groupIndex) => (
          <div key={groupIndex}>
            <div className="flex justify-center my-4 md:my-6">
              <span className="text-xs md:text-sm text-white/60 font-medium">{group.date}</span>
            </div>
            <div className="space-y-3 md:space-y-4">
              {group.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.user === "me" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-2 ${msg.user === "me" ? "justify-end" : ""}`}>
                    {msg.user !== "me" && (
                      <Image src={msg.avatar} alt="Profile" width={32} 
                        height={32} className="md:w-[40px] md:h-[40px] rounded-full mt-2 self-end" />
                    )}
                    <div className="flex flex-col">
                      <div className={`px-3 md:px-4 py-2 md:py-3 max-w-[300px] rounded-2xl md:max-w-auto text-sm md:text-base ${
                        msg.user === "me"
                          ? "bg-[#D1DAE9]/40 text-black-nave font-medium rounded-br-none"
                          : "bg-[#D1DAE9]/40 text-black-nave font-medium rounded-bl-none"
                      }`}>
                        <p className="text-wrap break-all">
                          {msg.text}
                        </p>
                        <span className={`flex justify-end items-end text-xs text-white/60 mt-1
                          ${msg.user === "me" ? "text-right" : "text-left"}`}>
                          {msg.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit"})}
                        </span>
                      </div>
                    </div>
                    {msg.user === "me" && (
                      <Image src={userAvatar} alt="Profile" width={32}
                        height={32} className="md:w-[40px] md:h-[40px] self-end rounded-full mt-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="flex justify-center items-center h-full">
          <p className="text-white/60">No messages yet. Start the conversation!</p>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};