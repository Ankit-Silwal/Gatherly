import { create } from "zustand";
type Server={
  id:string,
  name:string
}

type Channel={
  id:string,
  name:string
}

type Message={
  id:string,
  content:string,
  sender_id:string,
  created_at:string
}

type ChatStore={
  servers:Server[];
  selectedServer:string| null;
  channels:Channel[];
  messages:Message[];

  setServers:(server:Server[])=>void;
  setSelectedServer:(id:string)=>void,
  setChannels:(channels:Channel[])=>void,
  setMessages:(messages:Message[])=>void,
  addMessage:(message:Message)=>void

}

export const useChatStore = create<ChatStore>((set) => ({
  servers: [],
  selectedServer: null,
  channels: [],
  messages: [],

  setServers: (servers) => set({ servers }),

  setSelectedServer: (id) =>
    set({ selectedServer: id }),

  setChannels: (channels) =>
    set({ channels }),

  setMessages: (messages) =>
    set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message]
    }))
}));