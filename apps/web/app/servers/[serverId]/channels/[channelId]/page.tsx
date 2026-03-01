"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { io } from "socket.io-client";
import { useChatStore } from "@/store/useChatStore";

import ServerSidebar from "./components/serverSidebar";
import ChannelSidebar from "./components/channelSidebar";
import ChatWindow from "./components/chatWindow";

export default function ChannelPage() {
  const params = useParams();
  const router = useRouter();

  const serverId = params.serverId as string;
  const channelId = params.channelId as string;

  // Zustand
  const servers = useChatStore((state) => state.servers);
  const channels = useChatStore((state) => state.channels);
  const messages = useChatStore((state) => state.messages);

  const setServers = useChatStore((state) => state.setServers);
  const setChannels = useChatStore((state) => state.setChannels);
  const setMessages = useChatStore((state) => state.setMessages);

  const [loadingChannels, setLoadingChannels] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const addMessage = useChatStore((state) => state.addMessage)
  // Fetch Servers
  useEffect(() => {
    async function fetchServers() {
      try {
        const res = await api.get("/server");
        setServers(res.data.servers);
      }
      catch (err) {
        console.error("Failed to fetch servers", err);
      }
    }

    fetchServers();
  }, []);

  useEffect(() => {
    if (!channelId) return;

    const socket = io("http://localhost:8000", {
      withCredentials: true
    });

    socket.emit("join_channel", channelId);

    socket.on("receive_message", (message) => {
      addMessage(message);
    });

    return () => {
      socket.emit("leave_channel", channelId);
      socket.disconnect();
    };

  }, [channelId, addMessage]);

  // Fetch Channels
  useEffect(() => {
    if (!serverId) return;

    async function fetchChannels() {
      setLoadingChannels(true);

      try {
        const res = await api.get(`/server/${serverId}/channels`);
        setChannels(res.data);
      }
      catch (err) {
        console.error("Failed to fetch channels", err);
      }
      finally {
        setLoadingChannels(false);
      }
    }

    fetchChannels();
  }, [serverId]);

  // Fetch Messages
  useEffect(() => {
    if (!serverId || !channelId) return;

    async function fetchMessages() {
      setLoadingMessages(true);

      try {
        const res = await api.get(
          `/server/${serverId}/channels/${channelId}/messages`
        );
        setMessages(res.data);
      }
      catch (err) {
        console.error("Failed to fetch messages", err);
      }
      finally {
        setLoadingMessages(false);
      }
    }

    fetchMessages();
  }, [serverId, channelId]);

  return (
    <div className="h-screen flex bg-[#1E1F22] text-white font-sans overflow-hidden">

      <ServerSidebar
        servers={servers}
        selectedServer={serverId}
        onSelect={(id) =>
          router.push(`/servers/${id}/channels/${channelId}`)
        }
        onCreate={() => { }}
        onJoin={() => { }}
      />

      <ChannelSidebar
        channels={channels}
        channelId={channelId}
        serverId={serverId}
      />

      <ChatWindow
        messages={messages}
        channelId={channelId}
        serverId={serverId}
        loading={loadingMessages}
      />

    </div>
  );
}