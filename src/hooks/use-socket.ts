"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export const useSocket = (userId?: string) => {
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
      newSocket.disconnect();
    };
  }, [userId]);

  return { socket, isConnected };
};
