'use client'
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/components/hooks/authProvider";
import { useSocketStore } from "@/components/hooks/SocketIOproviders";
import { User } from "@/components/hooks/authProvider";
import api from "@/lib/axios";
import { ChatList } from './companents/ChatList';
import { ChatWindow } from './companents/ChatWindow';
import { ChatHeader } from "./companents/ChatHeader";
import toast from "react-hot-toast";

export default function Home() {
  const [messages, setMessages] = useState({});
  const [selectedChat, setSelectedChat] = useState(null);
  const [inputMessage, setInputMessage] = useState("");
  const [showChatList, setShowChatList] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [friendImageUser, setFriendImageUser] = useState("/images/defaultimage.png");
  
  const { user, accessToken } = useAuth.getState();
  const { socket, initSocket } = useSocketStore();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [friends, setFriends] = useState<User[]>([]);
  const friendsRef = useRef<User[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
  const [showBlockedList, setShowBlockedList] = useState(false);
  
  const [time] = useState({
    clock: new Date().toLocaleTimeString([], { hour:"2-digit", minute: "2-digit" }),
    date: new Date().toLocaleDateString([], { month:"2-digit", day: "2-digit" })
  });

  useEffect(() => {
    async function fetchAllHistory() {
      if (!user || friends.length === 0) 
        return;

      const historyPromises = friends.map(async (recipient) => {
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

    if (friends.length > 0) {
      fetchAllHistory();
    }
  }, [friends.length, user])

  const handleSendMessage = async () => {
  if (!inputMessage.trim() || !selectedChat) return;

  const recipient = friends.find(u => u.username === selectedChat);
  if (!recipient || !socket) return;

  const tempId = `temp-${Date.now()}`;
  const messageText = inputMessage.trim();

  // Add temp message immediately for UX
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

    // Replace temp ID with actual ID from server
    setMessages(prev => ({
      ...prev,
      [selectedChat]: prev[selectedChat].map(msg =>
        msg.id === tempId ? { ...msg, id: data.message_id } : msg
      )
    }));

    // Emit via socket
    socket.emit("chat-message", { 
      to: recipient.id, 
      text: messageText,
      message_id: data.message_id
    });

  } catch (err: any) {
    // Remove temp message if error occurs
    setMessages(prev => ({
      ...prev,
      [selectedChat]: prev[selectedChat].filter(m => m.id !== tempId),
    }));

    // Handle 403 explicitly
    if (err.response?.status === 403) {
      toast.error("🚫 You cannot send messages to this user (blocked).");
    } else {
      console.error("Error sending message:", err.response?.data || err);
      toast.error("Failed to send message. Please try again.");
    }
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
      
      // Fetch blocked users
      const blockedData = await api.put("/friends/blocked", { id: user.id });
      setBlockedUsers(blockedData.data.blockedUsers || []);
      
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
        const updatedFriends = prev.map(friend => {
          const isOnline = filtered.some(u => u.id === friend.id);
          const onlineUser = filtered.find(u => u.id === friend.id);
          return {
            ...friend,
            ...onlineUser, // Merge any updated data like avatar
            isOnline,
          };
        });
  
        friendsRef.current = updatedFriends;
        const onlineList = updatedFriends.filter(f => f.isOnline);
        setOnlineUsers(onlineList);
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
  
    const recipient = friends.find(u => u.username === username);
    if (!recipient) 
      return;
    setFriendImageUser(recipient.avatar || "/images/defaultimage.png");
    
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

const handleBlockUser = async (username) => {
  console.log("🔒 Blocking user:", username);
  const recipient = friends.find(u => u.username === username);
  
  if (!recipient) {
    console.error("User not found in friends list:", username);
    toast.error("User not found");
    return;
  }

  try {
    console.log("📤 Sending block request for user ID:", recipient.id);
    // 1. Call backend API
    await api.post("/friends/block", { friendId: recipient.id });
    console.log("✅ Block request successful");

    // 2. Close the chat window
    setSelectedChat(null);
    setShowChatList(true);
    
    // 3. Update local state to remove the user from friends list
    setFriends(prev => prev.filter(f => f.id !== recipient.id));
    
    // 4. Add to blocked users list
    setBlockedUsers(prev => [...prev, recipient]);
    
    // 5. Clear messages for this user
    setMessages(prev => {
      const updated = { ...prev };
      delete updated[username];
      return updated;
    });
    
    toast.success(`${username} has been blocked.`);
  } catch (err: any) {
    console.error("❌ Failed to block user:", err.response?.data || err.message);
    toast.error(`Failed to block user: ${err.response?.data?.message || err.message}`);
  }
};

const handleUnblockUser = async (username: string) => {
  console.log("🔓 Unblocking user:", username);
  const recipient = showBlockedList 
    ? blockedUsers.find(u => u.username === username)
    : friends.find(u => u.username === username);
  
  if (!recipient) {
    console.error("User not found:", username);
    toast.error("User not found");
    return;
  }

  try {
    console.log("📤 Sending unblock request for user ID:", recipient.id);
    await api.post("/friends/unblock", { friendId: recipient.id });
    console.log("✅ Unblock request successful");
    
    // Remove from blocked users list
    setBlockedUsers(prev => prev.filter(u => u.id !== recipient.id));
    
    // Refetch friends to update the list
    const { data } = await api.put("/friends/friendship", { id: user.id });
    setFriends(data.friendList);
    friendsRef.current = data.friendList;
    
    toast.success(`${username} has been unblocked!`);
  } catch (err: any) {
    console.error("❌ Unblock failed:", err.response?.data || err.message);
    toast.error(`Failed to unblock user: ${err.response?.data?.message || err.message}`);
  }
};

  const handleInviteToGame = () => {
    if (!selectedChat) {
      toast.error("Select a user first");
      return;
    }

    const recipient = friends.find(u => u.username === selectedChat);
    if (!recipient) {
      toast.error("User not found");
      return;
    }

    if (!socket) {
      toast.error("Socket not connected");
      return;
    }

    socket.emit("game:invite", { to: recipient.id, mode: "friendly" }, (resp?: any) => {
      if (resp?.ok) toast.success("Game invite sent 🎮");
      else toast.error(resp?.error || "Failed to send invite");
    });
  };

  const isSelectedBlocked = selectedChat
    ? blockedUsers.some(u => u.username === selectedChat)
    : false;
  return (
    <div className="flex border-none h-[calc(100vh-80px)] justify-center shadow-[2px_2px_5px_3px_rgba(0,0,0,0.3)] 
    items-center bg-[#F5F5F5]/40 rounded-xl m-2 md:m-10 overflow-hidden">
      <div className={`${showChatList ? 'flex' : 'hidden md:flex'} flex-col h-full w-full md:w-2/3 lg:w-1/3`}>
        <ChatList
          onlineUsers={friends}
          selectedChat={selectedChat}
          messages={messages}
          loadingHistory={loadingHistory}
          onSelectChat={handleSelectChat}
          currentTime={time}
          blockedUsers={blockedUsers}
          showBlockedList={showBlockedList}
          onToggleBlockedList={() => setShowBlockedList(!showBlockedList)}
          onUnblock={handleUnblockUser}
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
        onBlock={() => selectedChat && handleBlockUser(selectedChat)}
        onUnblock={() => selectedChat && handleUnblockUser(selectedChat)}
        isBlocked={isSelectedBlocked}
        onInvite={handleInviteToGame}
      />
    </div>
  );
}