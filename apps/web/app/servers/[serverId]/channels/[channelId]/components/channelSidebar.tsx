"use client";

import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Channel = {
  id: string;
  name: string;
};

type Props = {
  channels: Channel[];
  channelId: string;
  serverId: string;
  serverName?: string;
};

export default function ChannelSidebar({ channels, channelId, serverId, serverName = "Server Name" }: Props) {
  const router = useRouter();
  const activeChannelRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Modal States
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [isRenameServerOpen, setIsRenameServerOpen] = useState(false);
  const [isLeaveServerOpen, setIsLeaveServerOpen] = useState(false);
  const [channelName, setChannelName] = useState<string>("")
  const [newServerName, setNewServerName] = useState<string>("")

  // async function handleCreateChannel(){
  //   if(!channelName.trim()) return;

  //   try{
  //     const res=await api.post(`server/`)
  //   }
  // }
  useEffect(() => {
    // Close menu when clicking outside (simple check)
    const handleClick = () => setIsMenuOpen(false);
    if (isMenuOpen) {
      window.addEventListener("click", handleClick);
    }
    return () => window.removeEventListener("click", handleClick);
  }, [isMenuOpen]);

  useEffect(() => {
    if (activeChannelRef.current) {
      activeChannelRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [channelId]);

  return (
    <div className="w-60 bg-[#232428] flex flex-col h-full rounded-tl-xl overflow-hidden relative">
      {/* Server Header */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsMenuOpen(!isMenuOpen);
        }}
        className="h-12 flex items-center px-4 font-bold text-white shadow-sm hover:bg-[#35373C] transition-colors cursor-pointer border-b border-[#1F2023] relative z-20"
      >
        <span className="truncate">{serverName}</span>
        <svg className={`ml-auto w-4 h-4 text-zinc-400 transition-transform ${isMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isMenuOpen && (
        <div className="absolute top-12 left-2 right-2 bg-[#111214] rounded p-1.5 shadow-xl z-30 animate-in fade-in slide-in-from-top-2 border border-[#1e1f22]">
          <div
            className="flex items-center justify-between px-2 py-2 rounded hover:bg-[#5865F2] hover:text-white text-[#B5BAC1] cursor-pointer text-sm mb-0.5 font-medium transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsCreateChannelOpen(true);
              setIsMenuOpen(false);
            }}
          >
            Create Channel
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          </div>

          <div className="h-[1px] bg-[#1e1f22] my-1 mx-1" />

          <div
            className="flex items-center justify-between px-2 py-2 rounded hover:bg-[#5865F2] hover:text-white text-[#B5BAC1] cursor-pointer text-sm mb-0.5 font-medium transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsRenameServerOpen(true);
              setIsMenuOpen(false);
            }}
          >
            Rename Server
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </div>

          <div className="h-[1px] bg-[#1e1f22] my-1 mx-1" />

          <div
            className="flex items-center justify-between px-2 py-2 rounded hover:bg-[#DA373C] hover:text-white text-[#DA373C] cursor-pointer text-sm font-medium transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsLeaveServerOpen(true);
              setIsMenuOpen(false);
            }}
          >
            Leave Server
          </div>
        </div>
      )}


      {/* Channel List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {/* Mock Category Header */}
        <div className="flex items-center px-2 py-1 pt-2 cursor-pointer hover:text-zinc-300 text-zinc-400">
          <svg className="w-3 h-3 mr-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
          <span className="text-xs font-bold uppercase tracking-wide">Text Channels</span>
        </div>

        {channels.map((channel) => {
          const isActive = channelId === channel.id;
          return (
            <div
              key={channel.id}
              ref={isActive ? activeChannelRef : null}
              onClick={() => router.push(`/servers/${serverId}/channels/${channel.id}`)}
              className={`group px-2 py-[6px] rounded flex items-center cursor-pointer transition-colors mx-[2px] ${isActive
                ? "bg-[#404249] text-white"
                : "hover:bg-[#35373C] text-[#949BA4] hover:text-[#DBDEE1]"
                }`}
            >
              <svg
                className={`w-5 h-5 mr-1.5 shrink-0 ${isActive ? 'text-[#949BA4]' : 'text-[#80848E]'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5" // Thinner hash stroke
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              <span className={`font-medium truncate ${isActive ? 'text-white' : ''} `}>
                {channel.name}
              </span>

              {/* Invite Icon (Hidden unless hover or active, simplified logic for now) */}
              <div className="ml-auto hidden group-hover:block">
                <svg className="w-4 h-4 text-zinc-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* User Area (Footer) */}
      <div className="bg-[#1e1f22] px-2 py-1.5 flex items-center shrink-0">
        <div className="relative group cursor-pointer p-1 rounded hover:bg-[#3F4147] flex items-center gap-2 mr-auto" title="User Settings">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center relative overflow-hidden">
            <img src="https://ui-avatars.com/api/?name=User&background=random" alt="Avatar" className="w-full h-full object-cover" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-[2px] border-[#232428]"></div>
          </div>

          {/* Name */}
          <div className="flex flex-col text-sm max-w-[80px]">
            <span className="font-semibold text-white truncate text-xs leading-tight">GatherlyUser</span>
            <span className="text-[10px] text-gray-400 truncate leading-tight">#1234</span>
          </div>
        </div>

        {/* Icons */}
        <div className="flex">
          <button className="p-1.5 rounded hover:bg-[#3F4147] text-gray-300 hover:text-gray-100 flex flex-col items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
          </button>
          <button className="p-1.5 rounded hover:bg-[#3F4147] text-gray-300 hover:text-gray-100 flex flex-col items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </button>
          <button className="p-1.5 rounded hover:bg-[#3F4147] text-gray-300 hover:text-gray-100 flex flex-col items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.356a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.356 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.356a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </button>
        </div>
      </div>

      {/* Create Channel Modal */}
      {isCreateChannelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setIsCreateChannelOpen(false)}>
          <div
            className="bg-[#313338] rounded-md shadow-lg w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-4">Create Channel</h2>
            <div className="mb-4">
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Channel Name</label>
              <div className="flex items-center bg-[#1E1F22] rounded p-2">
                <span className="text-zinc-400 mr-2">#</span>
                <input
                  type="text"
                  placeholder="new-channel"
                  className="bg-transparent text-white focus:outline-none w-full"
                  autoFocus
                  onChange={(e) => {
                    setChannelName(e.target.value)
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end bg-[#2B2D31] -m-6 mt-0 p-4 rounded-b-md">
              <button
                onClick={() => setIsCreateChannelOpen(false)}
                className="text-white px-4 py-2 text-sm font-medium hover:underline mr-4"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsCreateChannelOpen(false)}
                className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-6 py-2 rounded text-sm font-medium transition-colors"
              >
                Create Channel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Server Modal */}
      {isRenameServerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setIsRenameServerOpen(false)}>
          <div
            className="bg-[#313338] rounded-md shadow-lg w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-2">Rename Server</h2>
            <p className="text-zinc-400 text-sm mb-6 text-center">
              Enter a new name for your server.
            </p>
            <div className="mb-4">
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Server Name</label>
              <input
                type="text"
                defaultValue={serverName}
                className="w-full bg-[#1E1F22] text-white p-2 rounded focus:outline-none"
                autoFocus
                onChange={(e) => {
                  setNewServerName(e.target.value)
                }}
              />
            </div>
            <div className="flex justify-end bg-[#2B2D31] -m-6 mt-0 p-4 rounded-b-md">
              <button
                onClick={() => setIsRenameServerOpen(false)}
                className="text-white px-4 py-2 text-sm font-medium hover:underline mr-4"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsRenameServerOpen(false)}
                className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-6 py-2 rounded text-sm font-medium transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Server Modal */}
      {isLeaveServerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setIsLeaveServerOpen(false)}>
          <div
            className="bg-[#313338] rounded-md shadow-lg w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-2">Leave &apos;{serverName}&apos;</h2>
            <p className="text-zinc-400 text-sm mb-6">
              Are you sure you want to leave <span className="font-bold text-white">{serverName}</span>? You won&apos;t be able to rejoin unless you are re-invited.
            </p>
            <div className="flex justify-end bg-[#2B2D31] -m-6 mt-0 p-4 rounded-b-md">
              <button
                onClick={() => setIsLeaveServerOpen(false)}
                className="text-white px-4 py-2 text-sm font-medium hover:underline mr-4"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsLeaveServerOpen(false)}
                className="bg-[#DA373C] hover:bg-[#A1282C] text-white px-6 py-2 rounded text-sm font-medium transition-colors"
              >
                Leave Server
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}