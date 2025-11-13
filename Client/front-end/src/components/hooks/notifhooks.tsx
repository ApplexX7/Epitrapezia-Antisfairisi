"use client"
import {toast} from "sonner"
import { useSocketStore } from "./SocketIOproviders"
import { useEffect, useRef } from "react";

export function useNotification () {
    const notifications = useSocketStore((state : any ) => state.notifications);
    const markAllAsRead = useSocketStore((state : any ) => state.markAllAsRead);
    const prevCount = useRef(0);

    useEffect(() => {
        if (notifications.length > prevCount.current){
            const newNotif = notifications.slice(prevCount.current);

            newNotif.forEach((notif : any) => {
                switch (notif.type){
                    case "friend-request":
                        toast.info(`📨 New friend request from ${notif.from?.username}`);
                        break;
                      case "friend-accepted":
                    default:
                        toast(notif.message);
                }
            });
            prevCount.current = notifications.length;
        }
    } ,[notifications]);
    return { markAllAsRead };
}