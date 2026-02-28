"use client";

import { useRouter } from "next/navigation";

type Channel =
{
  id: string;
  name: string;
};

type Props =
{
  channels: Channel[];
  channelId: string;
  serverId: string;
};

export default function ChannelSidebar({ channels, channelId, serverId }: Props)
{
  const router = useRouter();

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