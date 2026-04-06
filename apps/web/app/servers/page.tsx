"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

type Server = {
  id: string;
  name: string;
};

type Channel = {
  id: string;
  name: string;
};

export default function ServersPage() {
  const router = useRouter();
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function bootstrap() {
      try {
        await api.get("/auth/me");
        const res = await api.get("/server");
        setServers(res.data.servers ?? []);
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, [router]);

  async function openServer(serverId: string) {
    setError("");
    try {
      const channelRes = await api.get<Channel[]>(`/server/${serverId}/channels`);
      const channels = channelRes.data ?? [];

      if (channels.length === 0) {
        setError("This server has no channels yet.");
        return;
      }

      router.push(`/servers/${serverId}/channels/${channels[0].id}`);
    } catch {
      setError("Failed to open this server.");
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-lg">
        Loading servers...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Your servers</h1>
          <button
            className="rounded-md bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700"
            onClick={() => router.push("/login")}
          >
            Switch account
          </button>
        </div>

        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        {servers.length === 0 ? (
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-slate-300">
            You are not a member of any server yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {servers.map((server) => (
              <button
                key={server.id}
                className="rounded-lg border border-slate-800 bg-slate-900 p-5 text-left transition hover:border-slate-600 hover:bg-slate-800"
                onClick={() => openServer(server.id)}
              >
                <p className="text-lg font-medium">{server.name}</p>
                <p className="mt-1 text-sm text-slate-400">Open server</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
