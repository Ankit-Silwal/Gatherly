

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

    export default function ChannelPage() {
      const params = useParams();
      const router = useRouter();
      const serverId = params.serverId as string;
      const channelId = params.channelId as string;

      const [servers, setServers] = useState<Server[]>([]);
      const [channels, setChannels] = useState<Channel[]>([]);
      const [messages, setMessages] = useState<Message[]>([]);

      const [loadingServers, setLoadingServers] = useState(true);
      const [loadingChannels, setLoadingChannels] = useState(false);
      const [loadingMessages, setLoadingMessages] = useState(false);

      const [showCreateModal, setShowCreateModal] = useState(false);
      const [showJoinModal, setShowJoinModal] = useState(false);

      useEffect(() => {
        async function fetchServers() {
          try {
            const res = await api.get("/server");
            const serverList = res.data.servers;
            setServers(serverList);
          } catch (err) {
            console.error(err);
          } finally {
            setLoadingServers(false);
          }
        }
        fetchServers();
      }, []);

      useEffect(() => {
        if (!serverId) return;
        async function fetchChannels() {
          setLoadingChannels(true);
          try {
            const res = await api.get(`/server/${serverId}/channels`);
            setChannels(res.data);
          } catch (err) {
            console.error("Failed to fetch channels", err);
          } finally {
            setLoadingChannels(false);
          }
        }
        fetchChannels();
      }, [serverId]);

      useEffect(() => {
        if (!serverId || !channelId) return;
        async function fetchMessages() {
          setLoadingMessages(true);
          try {
            const res = await api.get(
              `/server/${serverId}/channels/${channelId}/messages`
            );
            setMessages(res.data);
          } catch (err) {
            console.error("Failed to fetch messages", err);
          } finally {
            setLoadingMessages(false);
          }
        }
        fetchMessages();
      }, [serverId, channelId]);

      // Inline ServerSidebar
      function ServerSidebar({ servers, selectedServer, onSelect, onCreate, onJoin }: {
        servers: Server[];
        selectedServer: string | null;
        onSelect: (id: string) => void;
        onCreate: () => void;
        onJoin: () => void;
      }) {
        return (
          <div className="w-20 bg-zinc-950 flex flex-col items-center py-4 gap-4">
            {servers.map((server) => (
              <div
                key={server.id}
                onClick={() => onSelect(server.id)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-semibold cursor-pointer transition ${
                  selectedServer === server.id
                    ? "bg-indigo-600"
                    : "bg-zinc-700 hover:bg-indigo-600"
                }`}
              >
                {server.name[0]}
              </div>
            ))}
            <div className="mt-auto flex flex-col gap-3">
              <div
                onClick={onCreate}
                className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center cursor-pointer hover:bg-green-500"
              >
                +
              </div>
              <div
                onClick={onJoin}
                className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center cursor-pointer hover:bg-blue-500"
              >
                J
              </div>
            </div>
          </div>
        );
      }

      // Inline ChannelSidebar
      function ChannelSidebar({ channels, channelId, serverId }: {
        channels: Channel[];
        channelId: string;
        serverId: string;
      }) {
        return (
          <div className="w-60 bg-zinc-800 p-4">
            <h2 className="text-lg font-semibold mb-4">Channels</h2>
            {channels.map((channel) => (
              <div
                key={channel.id}
                onClick={() => router.push(`/servers/${serverId}/channels/${channel.id}`)}
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
        );
      }

      // Inline ChatWindow
      function ChatWindow({ messages, channelId, loading }: {
        messages: Message[];
        channelId: string;
        loading: boolean;
      }) {
        return (
          <div className="flex-1 flex flex-col">
            <div className="h-14 border-b border-zinc-700 flex items-center px-6 font-semibold">
              Channel: {channelId}
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {loading && <div>Loading messages...</div>}
              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
                    U
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{msg.sender_id}</span>
                      <span className="text-xs text-zinc-400">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-zinc-300">{msg.content}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      return (
        <div className="h-screen flex bg-zinc-900 text-white">
          <ServerSidebar
            servers={servers}
            selectedServer={serverId}
            onSelect={(id) => {
              window.location.href = `/servers/${id}/channels/${channelId}`;
            }}
            onCreate={() => setShowCreateModal(true)}
            onJoin={() => setShowJoinModal(true)}
          />
          <ChannelSidebar
            channels={channels}
            channelId={channelId}
            serverId={serverId}
          />
          <ChatWindow
            messages={messages}
            channelId={channelId}
            loading={loadingMessages}
          />
        </div>
      );
    }
