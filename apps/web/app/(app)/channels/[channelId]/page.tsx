"use client";

import { useEffect,useState } from "react";
import api from "@/lib/api";
import { useParams } from "next/navigation";

type Server={
  id:string,
  name:string
}

type Channel={
  id:string,
  name:string
}

export default function ChannelPage()
{
  const params=useParams();
  const channelId=params.channelId as string;
  const [servers,setServers]=useState<Server[]>([]);
  const [loadingServer,setLoadingServer]=useState(true);
  const [selectedServer,setSelectedServer]=useState<string|null>(null);
  const [channels,setChannels]=useState<Channel[]>([]);
  const [loadingChannels,setLoadingChannels]=useState<boolean>(false);
  useEffect(()=>{
    async function fetchServers(){
      try{
        const res=await api.get('/server');
        setServers(res.data);
        if(res.data.length>0){
          setSelectedServer(res.data[0].id);
        }
      }catch(err){
        console.log("Error fetching the servers");
      }finally{
        setLoadingServer(false);
      }
    }
    fetchServers();
  },[])

  useEffect(()=>{
    if(!selectedServer) return;
    async function fetchChannel(){ 
      setLoadingChannels(true);
      try{
        const res=await api.get(`/servers/${selectedServer}/channels`)
        setChannels(res.data);
      }catch{
        console.error("Failed to fetch the channels")
      }finally{
        setLoadingChannels(false);
      }
    }
    fetchChannel();
  },[selectedServer]);

  const messages = [
    {
      id: 1,
      user: "Ankit",
      content: "Hey everyone 👋",
      time: "10:12 AM"
    },
    {
      id: 2,
      user: "Riya",
      content: "Backend is looking solid 🔥",
      time: "10:13 AM"
    },
    {
      id: 3,
      user: "Ankit",
      content: "Frontend next 🚀",
      time: "10:14 AM"
    }
  ];

  const members = [
    { name: "Ankit", status: "online" },
    { name: "Riya", status: "online" },
    { name: "Karan", status: "offline" }
  ];

  return (
    <div className="h-screen flex bg-zinc-900 text-white">

      {/* Servers Sidebar */}
      <div className="w-20 bg-zinc-950 flex flex-col items-center py-4 gap-4">
        {servers.map((server, i) => (
          <div
            key={i}
            className="w-12 h-12 bg-zinc-700 rounded-xl flex items-center justify-center text-sm font-semibold hover:bg-indigo-600 cursor-pointer transition"
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
        className="px-3 py-2 rounded-md hover:bg-zinc-700 cursor-pointer text-zinc-300"
      >
        # {channel.name}
      </div>
      ))}
      </div>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col bg-zinc-850">

        {/* Chat Header */}
        <div className="h-14 border-b border-zinc-700 flex items-center px-6 font-semibold">
          # general
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
                {msg.user[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{msg.user}</span>
                  <span className="text-xs text-zinc-400">{msg.time}</span>
                </div>
                <div className="text-zinc-300">{msg.content}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-zinc-700">
          <input
            type="text"
            placeholder="Message #general"
            className="w-full bg-zinc-800 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>
      </div>

      {/* Members Sidebar */}
      <div className="w-60 bg-zinc-800 p-4">
        <h2 className="text-lg font-semibold mb-4">Members</h2>

        {members.map((member, i) => (
          <div
            key={i}
            className="flex items-center gap-3 mb-3"
          >
            <div className="relative">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
                {member.name[0]}
              </div>
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-800 ${
                  member.status === "online"
                    ? "bg-green-500"
                    : "bg-gray-500"
                }`}
              />
            </div>
            <span className="text-zinc-300">{member.name}</span>
          </div>
        ))}
      </div>

    </div>
  );
}