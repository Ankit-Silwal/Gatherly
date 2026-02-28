"use client";

type Message =
{
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
};

type Props =
{
  messages: Message[];
  channelId: string;
  loading: boolean;
};

export default function ChatWindow({
  messages,
  channelId,
  loading
}: Props)
{
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