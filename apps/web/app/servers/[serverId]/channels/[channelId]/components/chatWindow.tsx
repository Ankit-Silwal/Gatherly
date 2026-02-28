"use client";
import api from "@/lib/api";
import { useChatStore } from "@/store/useChatStore";
import { useState } from "react";
type Message =
  {
    id: string;
    username: string;
    content: string;
    sender_id: string;
    created_at: string;
  };

type Props =
  {
    messages: Message[];
    channelId: string;
    serverId: string;
    loading: boolean;
  };

export default function ChatWindow({
  messages,
  channelId,
  serverId,
  loading
}: Props) {
  const addMessage = useChatStore((state) => state.addMessage);
  const [input, setInput] = useState<string>("");
  async function handleSend() {
    if (!input.trim()) return;
    try {
      const res = await api.post(`/server/${serverId}/channels/${channelId}/messages`, {
        content: input
      });
      addMessage(res.data)
      setInput("");
    } catch (err) {
      console.error("send failed", err);
    }
  }
  return (
    <div className="flex flex-col h-full w-full">

      {/* Header */}
      <div className="h-14 shrink-0 border-b border-zinc-700 flex items-center px-6 font-semibold">
        Channel: {channelId}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

        {loading && <div>Loading messages...</div>}

        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
              U
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{msg.username}</span>
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

      {/* Input Area */}
      <div className="shrink-0 border-t border-zinc-700 p-4 bg-zinc-900 flex gap-3">

        <input
          type="text"
          value={input ?? ""}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-md bg-zinc-800 text-white outline-none"
          onChange={(e) => {
            setInput(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
        />

        <button
          onClick={handleSend}
          className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 transition"
        >
          Send
        </button>

      </div>

    </div>
  );
}