"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "https://node-sensor-gird.onrender.com";

export const useSocket = (userId?: string, channelId?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const newSocket: Socket = io(socketUrl, {
      query: { userId },
      transports: ["websocket"],
    });

    setSocket(newSocket);

    const onConnect = () => {
      console.log("Socket connected:", newSocket.id);
      setIsConnected(true);
      // If a channelId is provided, subscribe to its room
      if (channelId) {
        console.log(`Subscribing to channel: ${channelId}`);
        newSocket.emit('subscribe', channelId);
      }
    };

    const onDisconnect = () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    };

    const onError = (error: Error) => {
        console.error("Socket Error:", error);
    };

    newSocket.on("connect", onConnect);
    newSocket.on("disconnect", onDisconnect);
    newSocket.on("connect_error", onError);


    return () => {
      newSocket.off("connect", onConnect);
      newSocket.off("disconnect", onDisconnect);
      newSocket.off("connect_error", onError);
      // Unsubscribe from channel room on cleanup
      if (channelId) {
          console.log(`Unsubscribing from channel: ${channelId}`);
          newSocket.emit('unsubscribe', channelId);
      }
      newSocket.disconnect();
    };
  }, [userId, channelId]);

  return { socket, isConnected };
};
