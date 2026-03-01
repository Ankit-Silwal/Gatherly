"use client";
import { useChatStore } from "@/store/useChatStore";
import { useState, useEffect, useRef } from "react";
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
    channelName: string;
    serverId: string;
    loading: boolean;
  };

export default function ChatWindow({
  messages,
  channelId,
  channelName,
  serverId,
  loading
}: Props) {
  const addMessage = useChatStore((state) => state.addMessage);
  const [input, setInput] = useState<string>("");
  const socket = useChatStore((s) => s.socket);
  async function handleSend() {
    if (!input.trim() || !socket) return;
    console.log("emtting message", channelId)
    socket.emit("send_message", {
      channelId,
      content: input
    });
    console.log("sending ")
    setInput("");
  }

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    const isYesterday = date.getDate() === today.getDate() - 1 && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();

    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) return `Today at ${time}`;
    if (isYesterday) return `Yesterday at ${time}`;
    return `${date.toLocaleDateString()} ${time}`;
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#2b2d31]">

      {/* Header */}
      <div className="h-12 shrink-0 border-b border-[#26272D] flex items-center px-4 shadow-sm bg-[#2b2d31] z-10">
        <div className="flex items-center text-white mr-4">
          <svg className="w-6 h-6 text-[#80848E] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
          <span className="font-bold text-base mr-2">{channelName}</span>
          <span className="text-zinc-400 text-xs hidden sm:block truncate max-w-[400px]">| This is the beginning of the #{channelName} channel.</span>
        </div>

        <div className="ml-auto flex items-center gap-4 text-[#B5BAC1]">
          {/* Toolbar Icons */}
          <svg className="w-6 h-6 hover:text-[#DBDEE1] cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          <svg className="w-6 h-6 hover:text-[#DBDEE1] cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
          <svg className="w-6 h-6 hover:text-[#DBDEE1] cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>

          {/* Search Bar Visual */}
          <div className="bg-[#1a1b1e] rounded flex items-center px-1.5 py-0.5 transition-all w-[140px] focus-within:w-[200px]">
            <input type="text" placeholder="Search" className="bg-transparent border-none text-sm text-zinc-300 focus:outline-none w-full placeholder:text-[#949BA4]" />
            <svg className="w-4 h-4 text-[#949BA4] cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>

          <svg className="w-6 h-6 hover:text-[#DBDEE1] cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar flex flex-col">

        {loading && <div className="text-zinc-400 text-center py-4">Loading messages...</div>}

        {messages.map((msg, index) => {
          // Basic logic to group messages from same user (visual only)
          const prevMsg = messages[index - 1];
          const isSequence = prevMsg && prevMsg.sender_id === msg.sender_id && (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() < 5 * 60 * 1000);

          return (
            <div key={msg.id} className={`group flex px-4 py-1 hover:bg-[#2E3035] -mx-4 ${isSequence ? 'pt-0.5' : 'mt-[17px]'}`}>
              {!isSequence ? (
                <div className="w-[40px] h-[40px] bg-indigo-500 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 mt-0.5 cursor-pointer hover:drop-shadow-md transition-shadow overflow-hidden">
                  {/* Avatar Placeholder - Using first letter or UI avatar */}
                  <img
                    src={`https://ui-avatars.com/api/?name=${msg.username}&background=random&color=fff`}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-[40px] shrink-0 text-[10px] text-zinc-500 opacity-0 group-hover:opacity-100 text-right pr-3 select-none flex items-center justify-end h-6">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </div>
              )}


              <div className="ml-4 flex-1">
                {!isSequence && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white hover:underline cursor-pointer">{msg.username}</span>
                    <span className="text-[12px] text-zinc-400">
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                )}

                <div className={`text-[#DBDEE1] leading-[1.375rem] whitespace-pre-wrap break-words font-light`}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 px-4 pb-6 pt-2 bg-[#2b2d31]">
        <div className="bg-[#383A40] rounded-lg px-4 py-2.5 flex items-center shadow-sm">
          {/* Upload Plus */}
          <div className="bg-[#B5BAC1] rounded-full p-0.5 mr-4 flex items-center justify-center cursor-pointer hover:text-white">
            <svg className="w-5 h-5 text-[#383A40]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
          </div>

          <input
            type="text"
            value={input ?? ""}
            placeholder={`Message #${channelName}`}
            className="flex-1 bg-transparent text-[#DBDEE1] outline-none placeholder-[#949BA4]"
            onChange={(e) => {
              setInput(e.target.value)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSend();
              }
            }}
          />

          {/* Right Icons: Gift, GIF, Sticker, Emoji */}
          <div className="flex items-center gap-3 ml-2 text-[#B5BAC1]">
            <svg className="w-6 h-6 hover:text-[#DBDEE1] cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path></svg>
            <svg className="w-6 h-6 hover:text-[#DBDEE1] cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>

        {/* Typing indicator placeholder - could be added here */}
      </div>
    </div>
  );
}        