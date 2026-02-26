"use client";

import { useParams } from "next/navigation";

export default function ChannelPage()
{
  const params = useParams();
  const channelId = params.channelId as string;

  return (
    <div className="h-screen flex items-center justify-center">
      Channel: {channelId}
    </div>
  );
}