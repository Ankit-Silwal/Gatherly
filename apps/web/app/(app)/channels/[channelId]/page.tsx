"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";

type Server = {
  id: string;
  name: string;
};

type Channel = {
  id: string;
  name: string;
};

type Message = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
};

export default function ChannelPage()
{
  const params = useParams();
  const router = useRouter();
  const channelId = params.channelId as string;

  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const [loadingServers, setLoadingServers] = useState(true);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() =>
  {
    async function fetchServers()
    {
      try
      {
        const res = await api.get("/server");
        setServers(res.data.servers);

        if (res.data.servers.length > 0)
        {
          setSelectedServer(res.data.servers[0].id);
        }
      }
      catch
      {
        console.error("Failed to fetch servers");
      }
      finally
      {
        setLoadingServers(false);
      }
    }

    fetchServers();
  }, []);

  useEffect(() =>
  {
    if (!selectedServer) return;

    async function fetchChannels()
    {
      setLoadingChannels(true);

      try
      {
        const res = await api.get(`/servers/${selectedServer}/channels`);
        setChannels(res.data);
      }
      catch
      {
        console.error("Failed to fetch channels");
      }
      finally
      {
        setLoadingChannels(false);
      }
    }

    fetchChannels();
  }, [selectedServer]);

  useEffect(() =>
  {
    if (!channelId) return;

    async function fetchMessages()
    {
      setLoadingMessages(true);

      try
      {
        const res = await api.get(`/server/${selectedServer}/channels/${channelId}/messages`);
        setMessages(res.data);
      }
      catch
      {
        console.error("Failed to fetch messages");
      }
      finally
      {
        setLoadingMessages(false);
      }
    }

    fetchMessages();
  }, [channelId]);

  return (
    <div className="h-screen flex bg-zinc-900 text-white">

      {/* Servers Sidebar */}
      <div className="w-20 bg-zinc-950 flex flex-col items-center py-4 gap-4">
        {loadingServers && <div className="text-xs">...</div>}

        {servers.map((server) => (
          <div
            key={server.id}
            onClick={() => setSelectedServer(server.id)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-semibold cursor-pointer transition ${
              selectedServer === server.id
                ? "bg-indigo-600"
                : "bg-zinc-700 hover:bg-indigo-600"
            }`}
          >
            {server.name[0]}
          </div>
        ))}
      </div>

      {/* Channels Sidebar */}
      <div className="w-60 bg-zinc-800 p-4">
        <h2 className="text-lg font-semibold mb-4">
          {selectedServer ? "Channels" : "Select Server"}
        </h2>

        {loadingChannels && <div>Loading...</div>}

        {channels.map((channel) => (
          <div
            key={channel.id}
            onClick={() => router.push(`/channels/${channel.id}`)}
            className={`px-3 py-2 rounded-md cursor-pointer ${
              channelId === channel.id
                ? "bg-zinc-700 text-white"
                : "hover:bg-zinc-700 text-zinc-300"
            }`}
          >
            # {channel.name}
          </div>
        ))}
      </div>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <div className="h-14 border-b border-zinc-700 flex items-center px-6 font-semibold">
          Channel: {channelId}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {loadingMessages && <div>Loading messages...</div>}

          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
                U
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {msg.sender_id}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-zinc-300">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-zinc-700">
          <input
            type="text"
            placeholder="Type a message..."
            className="w-full bg-zinc-800 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>
      </div>

    </div>
  );
}