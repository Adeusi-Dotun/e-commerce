import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { AuthContext } from "./AuthContext";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user } = useContext(AuthContext);

  // Stores notifications received during this session
  const [notifications, setNotifications] = useState([]);

  // Queue of notifications waiting to appear as banners
  const [bannerQueue, setBannerQueue] = useState([]);

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setBannerQueue([]);
      return;
    }

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new;

          console.log("🔔 New notification:", newNotification);

          // Keep a list of notifications received in this session
          setNotifications((current) => [
            newNotification,
            ...current,
          ]);

          // Queue it for the animated banner
          setBannerQueue((current) => [
            ...current,
            newNotification,
          ]);
        }
      )
      .subscribe((status) => {
        console.log("Notification Realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // The first item in the queue is the banner currently displayed
  const currentBanner = bannerQueue[0] ?? null;

  // Remove the displayed notification so the next one can appear
  const dismissNotification = () => {
    setBannerQueue((current) => current.slice(1));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        currentBanner,
        dismissNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}