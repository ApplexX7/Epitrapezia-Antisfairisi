'use client'
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/components/hooks/authProvider";
import { useSocketStore } from "@/components/hooks/SocketIOproviders";
import { User } from "@/components/hooks/authProvider";
import api from "@/lib/axios";
import { ChatList } from './companents/ChatList';
import { ChatWindow } from './companents/ChatWindow';

let friendImageUser = "/images/defaultimage.png"

export default function Home() {
  const [messages, setMessages] = useState({});
  const [selectedChat, setSelectedChat] = useState(null);
  const [inputMessage, setInputMessage] = useState("");
  const [showChatList, setShowChatList] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
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
            seen: msg.seen === 1,
            avatar: msg.sender_id === user.id ? user.avatar : recipient.avatar
          }));

          return { username: recipient.username, messages: formatted };
        } catch (err) {
          console.error(`Error fetching history for ${recipient.username}:`, err);
          return { username: recipient.username, messages: [] };
        }
      });

      const results = await Promise.all(historyPromises);
      
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
    if (!inputMessage.trim() || !selectedChat) 
      return;
  
    const recipient = onlineUsers.find(u => u.username === selectedChat);
    if (!recipient || !socket) 
      return;
  
    const tempId = `temp-${Date.now()}`;
    const messageText = inputMessage.trim();
    
    const newMessage = {
      id: tempId,
      text: messageText,
      time: new Date(),
      user: "me",
      seen: false,
      avatar: user.avatar
    };
  
    setMessages(prev => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), newMessage],
    }));
    
    setInputMessage("");
  
    try {
      const { data } = await api.post("/message/send", {
        sender_id: user.id,
        receiver_id: recipient.id,
        content: messageText,
      });
      
      setMessages(prev => ({
        ...prev,
        [selectedChat]: prev[selectedChat].map(msg =>
          msg.id === tempId ? { ...msg, id: data.message_id } : msg
        )
      }));
      
      socket.emit("chat-message", { 
        to: recipient.id, 
        text: messageText,
        message_id: data.message_id
      });

    } catch (err) {
      console.error("Error sending message:", err);
      setMessages(prev => ({
        ...prev,
        [selectedChat]: prev[selectedChat].filter(m => m.id !== tempId),
      }));
    }
  };

  useEffect(() => {
    async function init() {
      if (!user) 
        return;
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
    if (!socket) 
      return;
  
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
            id: data.message_id,
            text: data.text,
            time: new Date(data.time),
            user: data.from === user.id ? "me" : "other",
            seen: false,
            avatar: sender?.avatar,
          },
        ],
      }));
    };
  
    const handleMessagesSeen = ({ message_ids }: { message_ids: number[] }) => {
      console.log("Messages marked as seen:", message_ids);
      
      setMessages(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(username => {
          updated[username] = updated[username].map(msg => 
            message_ids.includes(Number(msg.id)) ? { ...msg, seen: true } : msg
          );
        });
        return updated;
      });
    };
  
    socket.on("users-list", handleUsersList);
    socket.on("chat-message", handleChatMessage);
    socket.on("messages-seen", handleMessagesSeen);
  
    return () => {
      socket.off("users-list", handleUsersList);
      socket.off("chat-message", handleChatMessage);
      socket.off("messages-seen", handleMessagesSeen);
    };
  }, [socket, user]);

  useEffect(() => {
    const handleESC = (e) => {
      if (e.key === "Escape"){
        setSelectedChat(null);
      }
    };
    window.addEventListener("keydown", handleESC);
    return () => window.removeEventListener("keydown", handleESC);
  }, []);

  const handleBackToChats = () => {
    setShowChatList(true);
  };

  const handleSelectChat = async (username) => {
    setSelectedChat(username);
    setShowChatList(false);
  
    const recipient = onlineUsers.find(u => u.username === username);
    if (!recipient) 
      return;
    friendImageUser = recipient.avatar;
    
    const unreadMessageIds = (messages[username] || [])
      .filter(msg => msg.user === "other" && !msg.seen)
      .map(msg => Number(msg.id))
      .filter(id => !isNaN(id) && !String(id).startsWith('temp'));
  
    if (unreadMessageIds.length === 0) return;
  
    setMessages(prev => ({
      ...prev,
      [username]: prev[username]?.map(msg =>
        msg.user === "other" ? { ...msg, seen: true } : msg
      ) || []
    }));
  
    try {
      await api.post("/message/mark-seen", {
        message_ids: unreadMessageIds,
        user_id: user.id
      });
  
      if (socket && socket.connected) {
        socket.emit("messages-seen", {
          to: recipient.id,
          message_ids: unreadMessageIds
        });
      }
    } catch (err) {
      console.error("Error marking messages as seen:", err);
    }
  };

  return (
    <div className="flex border-none h-[calc(100vh-80px)] justify-center shadow-[2px_2px_5px_3px_rgba(0,0,0,0.3)] 
    items-center bg-[#F5F5F5]/40 rounded-xl m-2 md:m-10 overflow-hidden">
      <div className={`${showChatList ? 'flex' : 'hidden md:flex'} flex-col h-full w-full md:w-2/3 lg:w-1/3`}>
        <ChatList
          onlineUsers={onlineUsers}
          selectedChat={selectedChat}
          messages={messages}
          loadingHistory={loadingHistory}
          onSelectChat={handleSelectChat}
          currentTime={time}
        />
      </div>
      
      <ChatWindow
        selectedChat={selectedChat}
        messages={messages[selectedChat] || []}
        friendImageUser={friendImageUser}
        userAvatar={user?.avatar || "/images/defaultimage.png"}
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        onSendMessage={handleSendMessage}
        onBackToChats={handleBackToChats}
        showChatList={showChatList}
        setShowChatList={setShowChatList}
      />
    </div>
  );
}