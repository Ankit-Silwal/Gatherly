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
  const setSocket = useChatStore((s) => s.setSocket);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [newServerName, setNewServerName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  useEffect(() => {
    if (!channelId) return;

    const socket = io("http://localhost:8000", {
      withCredentials: true
    });
    setSocket(socket)

    socket.emit("join_channel", channelId);

    socket.on("receive_message", (message) => {
      addMessage(message);
    });

    return () => {
      socket.emit("leave_channel", channelId);
      socket.disconnect();
      setSocket(null);
    };

  }, [channelId, addMessage]);

  // Create Server
  async function handleCreateServer() {
    try {
      await api.post("/server/create", { name: newServerName });
      setIsCreateOpen(false);
      setNewServerName("");
      // Refresh servers
      const res = await api.get("/server");
      setServers(res.data.servers);
    } catch (err) {
      console.error("Failed to create server", err);
    }
  }

  // Join Server
  async function handleJoinServer() {
    try {
      await api.post("/server/join", { inviteCode });
      setIsJoinOpen(false);
      setInviteCode("");
      // Refresh servers
      const res = await api.get("/server");
      setServers(res.data.servers);
    } catch (err) {
      console.error("Failed to join server", err);
    }
  }

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

  const currentChannel = channels.find((c) => c.id === channelId);
  const channelName = currentChannel?.name || channelId;

  return (
    <div className="h-screen flex bg-[#1E1F22] text-white font-sans overflow-hidden">

      <ServerSidebar
        servers={servers}
        selectedServer={serverId}
        onSelect={(id) =>
          router.push(`/servers/${id}/channels/${channelId}`)
        }
        onCreate={() => setIsCreateOpen(true)}
        onJoin={() => setIsJoinOpen(true)}
      />

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#313338] p-6 rounded-md w-96 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-white">Create a Server</h2>
            <input
              className="w-full bg-[#1E1F22] text-white p-2 rounded mb-4 outline-none"
              placeholder="Server Name"
              value={newServerName}
              onChange={(e) => setNewServerName(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 hover:underline text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateServer}
                className="px-4 py-2 bg-[#5865F2] text-white rounded hover:bg-[#4752C4]"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {isJoinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#313338] p-6 rounded-md w-96 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-white">Join a Server</h2>
            <input
              className="w-full bg-[#1E1F22] text-white p-2 rounded mb-4 outline-none"
              placeholder="Invite Code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsJoinOpen(false)}
                className="px-4 py-2 hover:underline text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinServer}
                className="px-4 py-2 bg-[#23A559] text-white rounded hover:bg-[#1A7F42]"
              >
                Join Server
              </button>
            </div>
          </div>
        </div>
      )}

      <ChannelSidebar
        channels={channels}
        channelId={channelId}
        serverId={serverId}
      />

      <ChatWindow
        messages={messages}
        channelId={channelId}
        channelName={channelName}
        serverId={serverId}
        loading={loadingMessages}
      />

    </div>
  );
}