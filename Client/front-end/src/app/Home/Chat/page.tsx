'use client'
import Image from "next/image";
import { MagnifyingGlass, Plus, ArrowLeft } from "@phosphor-icons/react/ssr";
import { CustomButton } from "@/components/CostumButton"
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/components/hooks/authProvider";
import { useSocketStore } from "@/components/hooks/SocketIOproviders";
import { User } from "@/components/hooks/authProvider";
import api from "@/lib/axios";
import { Checks } from '@phosphor-icons/react';

export default function Home() {
  const [messages, setMessages] = useState({});
  const [selectedChat, setSelectedChat] = useState(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showChatList, setShowChatList] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const searchRef = useRef(null);
  const { user, accessToken } = useAuth.getState();
  const { socket, initSocket } = useSocketStore();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [friends, setFriends] = useState<User[]>([]);
  const friendsRef = useRef<User[]>([]);
  
  const [time, setTime] = useState({
    clock: new Date().toLocaleTimeString([], { hour:"2-digit", minute: "2-digit" }),
    date: new Date().toLocaleDateString([], { month:"2-digit", day: "2-digit" })
  });
  

  useEffect(() => {
    async function fetchAllHistory() {
      if (!user || onlineUsers.length === 0) 
        return;

      const historyPromises = onlineUsers.map(async (recipient) => {
        try {
          const { data } = await api.get("/message/history", {
            params: {
              sender_id: user.id,
              receiver_id: recipient.id,
            },
          });

          const formatted = data.map(msg => ({
            id: msg.id,
            text: msg.content,
            time: new Date(msg.created_at),
            user: msg.sender_id === user.id ? "me" : "other",
          }));

          return { username: recipient.username, messages: formatted };
        } catch (err) {
          console.error(`Error fetching history for ${recipient.username}:`, err);
          return { username: recipient.username, messages: [] };
        }
      });

      const results = await Promise.all(historyPromises);
      
      // Merge with existing messages 
      setMessages(prev => {
        const newMessages = { ...prev };
        results.forEach(({ username, messages }) => {
          if (messages.length > 0) {
            newMessages[username] = messages;
          }
        });
        return newMessages;
      });
    }

    if (onlineUsers.length > 0) {
      fetchAllHistory();
    }
  }, [onlineUsers.length, user])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedChat) return;
  
    const recipient = onlineUsers.find(u => u.username === selectedChat);
    if (!recipient || !socket) return;
  
    const newMessage = {
      id: `${user.id}-${new Date().getTime()}`,
      text: inputMessage.trim(),
      time: new Date(),
      user: "me",
    };
  
    // Optimistically update UI
    setMessages(prev => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), newMessage],
    }));
  
    try {
      await api.post("/message/send", {
        sender_id: user.id,
        receiver_id: recipient.id,
        content: inputMessage.trim(),
      });
      
      socket.emit("chat-message", { to: recipient.id, text: inputMessage.trim() });

    } catch (err) {
      console.error("Error sending message:", err);
      // optimistic message on error
      setMessages(prev => ({
        ...prev,
        [selectedChat]: prev[selectedChat].filter(m => m.id !== newMessage.id),
      }));
    }
    
    setInputMessage("");
  };

  useEffect(() => {
    async function init() {
      if (!user) return;
      try {
        const { data } = await api.put("/friends/friendship", { id: user.id });
        setFriends(data.friendList);
        friendsRef.current = data.friendList;
        initSocket(user, accessToken);
      } catch (err) {
        console.error(err);
      }
    }
    init();
  }, [user, accessToken])

  useEffect(() => {
    if (!socket) return;
  
    const handleUsersList = (users: any[]) => {
      const filtered = users.filter(u => u.id !== user.id);
  
      setFriends(prev => {
        const updatedFriends = prev.map(friend => ({
          ...friend,
          isOnline: filtered.some(u => u.id === friend.id),
        }));
  
        friendsRef.current = updatedFriends; 
        setOnlineUsers(updatedFriends.filter(f => f.isOnline));
        return updatedFriends;
      });
    };
  
    
    const handleChatMessage = (data: any) => {
      const sender = friendsRef.current.find(f => f.id === data.from);
      const senderUsername = sender ? sender.username : "Unknown";
  
      setMessages(prev => ({
        ...prev,
        [senderUsername]: [
          ...(prev[senderUsername] || []),
          {
            id: `${data.from}-${new Date(data.time).getTime()}`,
            text: data.text,
            time: new Date(data.time),
            user: data.from === user.id ? "me" : "other",
          },
        ],
      }));
    };
  
    socket.on("users-list", handleUsersList);
    socket.on("chat-message", handleChatMessage);
  
    return () => {
      socket.off("users-list", handleUsersList);
      socket.off("chat-message", handleChatMessage);
    };
  }, [socket, user]);
  
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const groupMessagesByDate = (msgs) => {
    const groups = [];
    let currentDate = null;
    let currentGroup = [];

    msgs.forEach((msg) => {
      const msgDate = msg.time.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      if (msgDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = msgDate;
        currentGroup = [msg];
      } else {
        currentGroup.push(msg);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }

    return groups;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
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

  const handleBackToChats = () => {
    setShowChatList(true);
  };

  const handleSelectChat = (username) => {
    setSelectedChat(username);
    setShowChatList(false);
  };

  const getLastMessage = (username) => {
    const chatMessages = messages[username] || [];
    if (chatMessages.length === 0) 
      return "No messages yet";
    const lastMsg = chatMessages[chatMessages.length - 1];
    return lastMsg.text.length > 30 ? lastMsg.text.substring(0, 30) + "..." : lastMsg.text;
  };

  const getLastMessageTime = (username) => {
    const chatMessages = messages[username] || [];
    if (chatMessages.length === 0) 
      return "";
    const lastMsg = chatMessages[chatMessages.length - 1];
    return lastMsg.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  return (
    <div className="flex border-none h-[calc(100vh-80px)] justify-center shadow-[2px_2px_5px_3px_rgba(0,0,0,0.3)] 
    items-center bg-[#F5F5F5]/40 rounded-xl m-2 md:m-10 overflow-hidden">
      <div className={`${showChatList ? 'flex' : 'hidden md:flex'} flex-col h-full w-full md:w-2/3 lg:w-1/3  backdrop-brightness-[120%]
        bg-black/50 border-[#000000] rounded-l-xl`}>
        <div className="flex gap-2 w-full justify-between py-5 items-center self-start">
          {!isSearchActive && (
            <h2 className="border-none font-bold text-2xl md:text-3xl text-black-nave pl-5 md:pl-10">
              Recent chat
            </h2>
          )}
            <div ref={searchRef} className={`flex gap-2 md:gap-4 px-3 md:px-5 ${isSearchActive ? 'w-full' : ''}`}>
              <button
              onClick={()=> setIsSearchActive(!isSearchActive)}
              className="flex justify-center items-center bg-white-smoke/10 hover:opacity-40
              h-[40px] w-[40px] md:h-[48px] md:w-[48px] rounded-4xl shadow-[inset_2px_0px_4px_rgba(245,245,245,0.3)]
              backdrop-blur-lg brightness-150">
                <MagnifyingGlass size={20} weight="bold" className="md:w-[25px] md:h-[25px]"/>
              </button>
              {isSearchActive && (
                <input
                  type="search"
                  placeholder="Search"
                  className="flex-1 px-3 md:px-4 py-2 rounded-4xl focus:outline-none focus:ring-1 
                  focus:ring-white border-none bg-white-smoke/10 backdrop-blur-lg brightness-150 text-sm md:text-base"
                  autoFocus
                />
              )}
          </div>
        </div>
        <div className="flex flex-col mb-3 md:mb-5 px-5 md:px-10">
          <div className="flex h-[2px] w-full bg-white/30 mx-auto mb-3 md:mb-5" ></div>
        </div>
        <div className="flex-1 space-y-2 md:space-y-4 overflow-y-auto">
          {loadingHistory && (
            <div className="text-center text-white/60 mt-10 px-4">
              <p>Loading conversations...</p>
            </div>
          )}
          {!loadingHistory && onlineUsers.length === 0 ? (
            <div className="text-center text-white/60 mt-10 px-4">
              <p>No users online</p>
              <p className="text-sm mt-2">Waiting for users to connect...</p>
            </div>
          ) : (
            onlineUsers.map((u: any) => (
              <div
                key={`${u.id}-${u.username}`}
                onClick={() => handleSelectChat(u.username)}
                className={`flex items-center gap-2 md:gap-3 m-0 p-3 md:p-4 ${selectedChat === u.username ? "bg-white/20" : "hover:bg-white/20 cursor-pointer"}`}
              > 
                <div className="relative">
                  <Image src={u.avatar} alt="Profile" width={40} height={40}
                  className="rounded-full gap-2 ml-3 md:ml-7" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-none rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm md:text-base">{u.username}</p>
                  <p className="text-gray-300 text-xs md:text-sm truncate">{getLastMessage(u.username)}</p>
                </div>
                <div className="flex flex-col items-end gap-1 mr-3 md:mr-7">
                  <span className="text-xs text-gray-200">{getLastMessageTime(u.username) || time.clock}</span>
                  <Checks size={30} weight="bold" className={u.isOnline ? "text-blue-500" :" text-gray-500"}/>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* 2/3 */}
      <div className={`${showChatList ? 'hidden md:flex' : 'flex'} w-full md:w-2/3 h-full rounded-r-xl flex-col flex-1`}>
        {selectedChat ? (
          <>
          <div className={`flex items-center gap-3 p-4 bg-[#D1DAE9]/20 border-b border-white/10 ${showChatList ? 'bg-[#D1DAE9]/20' : ''}`}>
              <button onClick={handleBackToChats} className="flex items-center justify-center md:hidden">
                <ArrowLeft size={24} weight="bold" />
              </button>
              <div className="flex items-center gap-2">
                <Image src="/images/defaultAvatare.jpg" alt="Profile" width={40} height={40}
                className="rounded-full" />
                <span className="font-bold text-lg">{selectedChat}</span>
              </div>
            </div>

            <div className="flex-1 p-3 md:p-6 mt-0 md:mt-10 space-y-4 md:space-y-6 overflow-y-auto">
              {messages[selectedChat] && messages[selectedChat].length > 0 ? (
                groupMessagesByDate(messages[selectedChat]).map((group, groupIndex) => (
                  <div key={groupIndex}>
                    <div className="flex justify-center my-4 md:my-6">
                        <span className="text-xs md:text-sm text-white/60 font-medium">{group.date}</span>
                    </div>
                    <div className="space-y-3 md:space-y-4">
                      {group.messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.user === "me" ? "justify-end" : "justify-start"}`}>
                          <div className={`flex gap-2 ${msg.user === "me" ? "justify-end" : ""}`}>
                            {msg.user !== "me" && (
                              <Image src="/images/defaultAvatare.jpg" alt="Profile" width={32} 
                              height={32} className="md:w-[40px] md:h-[40px] rounded-full mt-2 self-end" />
                            )}
                            <div className="flex flex-col">
                              <div className={`px-3 md:px-4 py-2 md:py-3  max-w-[300px] rounded-2xl  md:max-w-auto text-sm md:text-base ${
                                msg.user === "me"
                                ? "bg-[#D1DAE9]/40 text-black-nave font-medium rounded-br-none"
                                : "bg-[#D1DAE9]/40 text-black-nave font-medium rounded-bl-none"
                              }`}>
                                <p className="text-wrap break-all" >
                                  {msg.text}
                                </p>
                              <span className={`flex justify-end items-end   text-xs text-white/60 mt-1
                              ${msg.user === "me" ? "text-right" : "text-left"}`}>
                                {msg.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit"})}
                              </span>
                              </div>
                            </div>
                            {msg.user === "me" && (
                              <Image src="/images/defaultAvatare.jpg" alt="Profile" width={32}
                              height={32} className="md:w-[40px] md:h-[40px] self-end rounded-full mt-2"
                              />
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
            </div>
            <div className="p-3 md:p-4 bg-[#D1DAE9]/20 border-t border-none rounded-br-xl">
              <div className="w-full">
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="flex-1 relative">
                    <div className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 z-10">
                      <button className="flex items-center justify-center transition-colors">
                        <Plus size={24} weight="bold" className="md:w-[30px] md:h-[30px]" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Write Something"
                      className="w-full pl-12 md:pl-16 pr-4 md:pr-6 py-3 md:py-4 bg-[#D1DAE9]/30 rounded-xl 
                      text-black-nave font-bold boder-none text-sm md:text-base
                      shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3)] 
                      focus:outline-none focus:ring-1 focus:ring-white
                      placeholder:text-black-nave/80"
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    className="px-4 md:px-8 py-3 md:py-4 bg-[#D1DAE9]/30 hover:bg-black/30 text-black-nave rounded-xl font-bold text-sm md:text-base
                    shadow-[2px_2px_5px_rgba(0,0,0,0.3)] focus:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3)]">
                    Send
                  </button>
                </div>
              </div>
            </div>
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
    </div>
  );
}