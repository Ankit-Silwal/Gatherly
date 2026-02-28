"use client";

type Server =
{
  id: string;
  name: string;
};

type Props =
{
  servers: Server[];
  selectedServer: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onJoin: () => void;
};

export default function ServerSidebar({
  servers,
  selectedServer,
  onSelect,
  onCreate,
  onJoin
}: Props)
{
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