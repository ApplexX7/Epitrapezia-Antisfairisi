"use client"
import {toast} from "sonner"
import { useSocketStore, Notification } from "./SocketIOproviders"
import { useEffect, useRef } from "react";

export interface NotificationState {
  notifications: Notification[];
  markAllAsRead: () => void;
}

export function useNotification () {
    const notifications = useSocketStore((state: NotificationState) => state.notifications);
    const markAllAsRead = useSocketStore((state: NotificationState) => state.markAllAsRead);
    const prevCount = useRef(0);

    useEffect(() => {
        if (notifications.length > prevCount.current){
            const newNotif = notifications.slice(prevCount.current);

            newNotif.forEach((notif: Notification) => {
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