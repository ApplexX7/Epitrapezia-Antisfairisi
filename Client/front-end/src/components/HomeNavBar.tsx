"use client"

import "@/app/globals.css";
import Image from "next/image";
import { NavBar } from '@/components/Navbar'
import { MagnifyingGlass , Bell} from "@phosphor-icons/react/ssr";
import { CustomButton } from "@/components/CostumButton"
import { NavigationMenuDemo } from "@/components/profileBar"
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSocketStore } from "./hooks/SocketIOproviders";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { usePathname, useRouter } from "next/navigation";
import SearchCompo from "./searchComp";

export default function HomeNavBar (){
    const [clicked, isClicked] = useState(false);
    const [search, isSearching] = useState(false);
        const [notif, isnotif] = useState(false);

        const notifications = useSocketStore((state: any) => state.notifications);
        const markAllAsRead = useSocketStore((state: any) => state.markAllAsRead);
        const markAsRead = useSocketStore((state: any) => state.markAsRead);
        const socket = useSocketStore((state: any) => state.socket);
        const unreadCount = notifications.filter((n: any) => !n.read).length;
        const router = useRouter();
        const pathname = usePathname();

        useEffect(() => {
            // If I invited someone and they accepted, auto-launch OnlinePong
            const accepted = notifications.find(
                (n: any) =>
                    !n.read &&
                    n.type === "game-invite-response" &&
                    n.payload?.status === "accepted" &&
                    n.payload?.roomId
            );
            if (!accepted) return;

            // Only auto-redirect for a *fresh* notification to avoid random redirects
            // caused by old unread items.
            const notifTime = accepted.time ? new Date(accepted.time).getTime() : 0;
            if (!notifTime || Date.now() - notifTime > 30_000) {
                markAsRead(accepted.id);
                return;
            }

            if (pathname === "/Home/Games/OnlinePong") {
                markAsRead(accepted.id);
                return;
            }
            markAsRead(accepted.id);
            router.push(`/Home/Games/OnlinePong?roomId=${encodeURIComponent(accepted.payload.roomId)}`);
        }, [notifications, markAsRead, router, pathname]);

        const handleFriendAction = async (notif: any, action: "accept" | "decline") => {
            if (!notif?.from?.id) return;
            try {
                if (action === "accept") {
                    await api.post("/friends/Accept", { friendId: notif.from.id });
                    toast.success("Friend request accepted 🤝");
                } else {
                    await api.post("/friends/Remove", { friendId: notif.from.id });
                    toast("Friend request declined", { icon: "👋" });
                }
                markAsRead(notif.id);
            } catch (err: any) {
                console.error("Failed to update friend request", err?.response?.data || err);
                toast.error(err?.response?.data?.message || "Action failed");
            }
        };

        const handleGameInviteResponse = (notif: any, status: "accepted" | "declined") => {
            if (!notif?.from?.id || !socket) return;
            socket.emit(
                "game:invite:response",
                { to: Number(notif.from.id), status },
                (resp?: any) => {
                    if (status === "accepted") {
                        const rid = resp?.roomId;
                        if (rid) router.push(`/Home/Games/OnlinePong?roomId=${encodeURIComponent(rid)}`);
                        else router.push("/Home/Games/OnlinePong");
                    } else {
                        toast("Invite declined", { icon: "✋" });
                    }
                    markAsRead(notif.id);
                }
            );
        };

        const toggleNotifications = () => {
            isnotif(!notif);
            if (!notif) markAllAsRead();
        };

        const formatTime = (iso: string) => {
            const d = new Date(iso);
            return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
        };
    return (
        <div className="relative mt-10 min-[1400px]:-mt-5 min-[1400px]:mb-0 mb-10 flex justify-center items-center gap-5 w-full xl:px-10 px-5">
            <Image className="hidden ml-10 min-[1400px]:block w-[180px] h-[200px]"  alt="Logo for  a ping pong" src="/images/Logo-S.png" width={500} height={500} priority/>
            <div className={`ml-10  lg:block hidden xl:ml-0 w-full rounded-full h-[70px]  xl:mt-0`}>
                {
                    !search ? (

                        <NavBar />
                        ) : (
                          <div className="ml-10 relative rounded-full h-[70px]">
                            <SearchCompo search/>
                          </div>
                )
                }
            </div>
            <div className={`flex gap-5 h-[70px]  xl:mt-0 md:mr-10 items-center justify-between w-full xl:w-150 xl:justify-center`}>
                <div className="relative">
                <button
                    className={`items-center lg:hidden   left-0 ml-5`}
                        onClick={() => isClicked(!clicked)}>
                    <>
                        {clicked ? (
                            <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-list-chevrons-up-down scale-90 
                            transition-transform duration-75 ease-in-out 
                            active:scale-110"
                            >
                            <path d="M3 5h8" />
                            <path d="M3 12h8" />
                            <path d="M3 19h8" />
                            <path d="m15 8 3-3 3 3" />
                            <path d="m15 16 3 3 3-3" />
                            </svg>
                        ) : (
                            <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-list-chevrons-down-up 
                            scale-90 transition-transform duration-75 ease-in-out
                            active:scale-110"
                            >
                            <path d="M3 5h8" />
                            <path d="M3 12h8" />
                            <path d="M3 19h8" />
                            <path d="m15 5 3 3 3-3" />
                            <path d="m15 19 3-3 3 3" />
                            </svg>
                        )}
                    </>
                </button>
                    <div
                        className={`absolute left-0 z-10
                        transition-all duration-200 ease-in-out
                        cursor-pointer
                        ${clicked ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
                        bg-white-smoke/40 w-[250px] h-[200px] backdrop-blur-2xl
                        rounded-lg flex flex-col items-center justify-around gap-2 
                        backdrop-blur-0 bg-opacity-100 `}
                        onClick={() => isClicked(!clicked)}>
                        <Link href="/Home" className="active:bg-blue-purple font-medium hover:bg-blue-purple flex h-full items-center justify-center rounded-t-lg w-full py-2 hover:text-white">Home</Link>
                        <Link href="/Home/Chat" className="active:bg-blue-purple font-medium hover:bg-blue-purple flex h-full items-center justify-center w-full py-2 hover:text-white">Chat</Link>
                        <Link href="/Home/Settings" className="active:bg-blue-purple font-medium hover:bg-blue-purple flex h-full items-center justify-center w-full py-2 hover:text-white">Settings</Link>
                        <Link href="/Home/Games" className="active:bg-blue-purple hover:bg-blue-purple font-medium flex h-full items-center rounded-b-lg justify-center w-full py-2 hover:text-white">Games</Link>
                    </div>
                </div>
                <div className={`ml-10  relative flex items-center ${!search ? "hidden" : "lg:hidden"} lg:hidden rounded-full h-[70px]`}>
                  <SearchCompo search/>
                </div>
                <div className={`flex items-center  w-fit h-full gap-4`}>
                <CustomButton onClick={() => isSearching(!search)}
                    className={`bg-white-smoke/30  w-[48px] 
                    h-[48px] sm:w-[84px] sm:h-full transition-all duration-300 ease-in-out`}>
                    <MagnifyingGlass size={36} color="#0d0c22" weight="bold"/>
                </CustomButton>
                <div className="relative h-full flex items-center">
                                        <CustomButton onClick={toggleNotifications}
                        className="bg-white-smoke/30 w-[48px] h-[48px] sm:w-[84px] sm:h-full"> 
                      <Bell size={36} color="#0d0c22" weight="bold" />
                                            {unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                                                    {unreadCount}
                                                </span>
                                            )}
                    </CustomButton>

                    {notif && (
                      <div className="absolute top-full mt-3 right-0 z-10
                                                    w-[320px] max-h-[420px] overflow-auto
                                                    bg-white-smoke/30 rounded-xl 
                                                    backdrop-blur-sm p-3 space-y-3">
                                                {notifications.length === 0 && (
                                                    <p className="text-black">No notifications</p>
                                                )}

                                                {notifications.map((n: any) => (
                                                    <div
                                                        key={n.id}
                                                        className="bg-white/50 rounded-lg p-3 text-black-nave shadow-sm space-y-2"
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div>
                                                                <p className="font-semibold capitalize">{n.type.replace(/-/g, " ")}</p>
                                                                <p className="text-sm">{n.message}</p>
                                                            </div>
                                                            <span className="text-[10px] text-gray-600 whitespace-nowrap">{formatTime(n.time)}</span>
                                                        </div>

                                                        {n.type === "friend-request" && (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    className="flex-1 bg-green-500 text-white rounded-md py-1 text-sm hover:bg-green-600"
                                                                    onClick={() => handleFriendAction(n, "accept")}
                                                                >
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    className="flex-1 bg-red-500 text-white rounded-md py-1 text-sm hover:bg-red-600"
                                                                    onClick={() => handleFriendAction(n, "decline")}
                                                                >
                                                                    Decline
                                                                </button>
                                                            </div>
                                                        )}

                                                        {n.type === "game-invite" && (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    className="flex-1 bg-blue-500 text-white rounded-md py-1 text-sm hover:bg-blue-600"
                                                                    onClick={() => handleGameInviteResponse(n, "accepted")}
                                                                >
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    className="flex-1 bg-gray-400 text-white rounded-md py-1 text-sm hover:bg-gray-500"
                                                                    onClick={() => handleGameInviteResponse(n, "declined")}
                                                                >
                                                                    Decline
                                                                </button>
                                                            </div>
                                                        )}

                                                        {n.type === "friend-accepted" && (
                                                            <button
                                                                className="w-full bg-gray-200 rounded-md py-1 text-sm text-black"
                                                                onClick={() => markAsRead(n.id)}
                                                            >
                                                                Dismiss
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                      </div>
                    )}
                  </div>
                <NavigationMenuDemo />
                </div>
                
            </div>
        </div>
    );
}