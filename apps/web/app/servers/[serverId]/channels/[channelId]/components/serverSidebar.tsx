"use client";

import { MessageCircle, Plus, Compass } from "lucide-react"; // Assuming lucide-react is available or I will use text/svg
// Since I cannot verify if lucide-react is installed, I will use SVGs to be safe, or check package.json first.
// Checking package.json...
type Server = {
  id: string;
  name: string;
  icon?: string;
};

type Props = {
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
  onJoin,
}: Props) {
  return (
    <div className="w-[72px] bg-[#1a1b1e] flex flex-col items-center py-3 gap-2 shrink-0 overflow-y-auto no-scrollbar">
      {/* Home / DM placeholder */}
      <div className="group relative flex items-center justify-center w-full">
        <div className="absolute left-0 bg-white rounded-r-full w-[4px] h-[8px] transition-all duration-200 opacity-0 group-hover:opacity-100 group-hover:h-[20px]" />
        <div className="w-12 h-12 bg-[#2b2d31] rounded-[24px] group-hover:rounded-[16px] group-hover:bg-[#5865F2] transition-all duration-200 flex items-center justify-center text-white cursor-pointer overflow-hidden shadow-sm">
          <svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.0212 1.67671C21.3107 0.879656 19.5079 0.318797 17.6584 0C17.4038 0.458232 17.1207 0.916463 16.8515 1.55931C14.8687 1.26514 12.8997 1.26514 10.9599 1.55931C10.6906 0.916463 10.4075 0.458232 10.1384 0C8.28888 0.318797 6.48609 0.879656 4.77562 1.67671C1.29177 6.88371 0.344498 11.9686 0.811166 16.9859C2.92131 18.5303 4.97394 19.4705 6.98504 20C7.48003 19.3243 7.93321 18.6056 8.32915 17.8427C7.60749 17.5735 6.91429 17.2505 6.24921 16.8801C6.41907 16.7628 6.58892 16.6334 6.74457 16.5041C11.5684 18.7297 16.2713 18.7297 21.0384 16.5041C21.2082 16.6334 21.3781 16.7628 21.5337 16.8801C20.8687 17.2505 20.1755 17.5735 19.4539 17.8427C19.8498 18.6056 20.303 19.3243 20.7837 20C22.7948 19.4705 24.8475 18.5303 26.9576 16.9859C27.5093 11.3338 26.0504 6.30777 23.0212 1.67671ZM9.68536 13.8447C8.51132 13.8447 7.54959 12.7634 7.54959 11.4355C7.54959 10.1075 8.48299 9.02621 9.68536 9.02621C10.8877 9.02621 11.8507 10.1075 11.8224 11.4355C11.8224 12.7634 10.8877 13.8447 9.68536 13.8447ZM18.1257 13.8447C16.9517 13.8447 15.99 12.7634 15.99 11.4355C15.99 10.1075 16.9234 9.02621 18.1257 9.02621C19.328 9.02621 20.291 10.1075 20.2627 11.4355C20.2627 12.7634 19.328 13.8447 18.1257 13.8447Z" fill="currentColor" />
          </svg>
        </div>
      </div>

      <div className="w-8 h-[2px] bg-[#35363C] rounded-lg mx-auto my-1" />

      {servers.map((server) => {
        const isSelected = selectedServer === server.id;
        return (
          <div key={server.id} className="group relative flex items-center justify-center w-full">
            {/* Selection Pill */}
            <div
              className={`absolute left-0 bg-white rounded-r-full w-[4px] transition-all duration-200 
                ${isSelected ? 'h-[40px]' : 'h-[8px] opacity-0 group-hover:opacity-100 group-hover:h-[20px]'}
                `}
            />

            <div
              onClick={() => onSelect(server.id)}
              className={`w-12 h-12 flex items-center justify-center text-sm font-semibold cursor-pointer transition-all duration-200 overflow-hidden
                ${isSelected
                  ? "bg-[#5865F2] text-white rounded-[16px]"
                  : "bg-[#2b2d31] text-zinc-400 group-hover:bg-[#5865F2] group-hover:text-white rounded-[24px] group-hover:rounded-[16px]"
                }
              `}
            >
              <span className="font-bold text-base">{(server.name[0] || "?").toUpperCase()}</span>
            </div>
          </div>
        );
      })}

      <div className="w-8 h-[2px] bg-[#35363C] rounded-lg mx-auto my-1" />

      {/* Add Server */}
      <div className="group relative flex items-center justify-center w-full">
        <div className="absolute left-0 bg-white rounded-r-full w-[4px] h-[8px] transition-all duration-200 opacity-0 group-hover:opacity-100 group-hover:h-[20px]" />
        <div
          onClick={onCreate}
          className="w-12 h-12 bg-[#2b2d31] rounded-[24px] group-hover:rounded-[16px] group-hover:bg-[#23A559] transition-all duration-200 flex items-center justify-center text-[#23A559] group-hover:text-white cursor-pointer"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </div>
      </div>

      {/* Explore */}
      <div className="group relative flex items-center justify-center w-full">
        <div className="absolute left-0 bg-white rounded-r-full w-[4px] h-[8px] transition-all duration-200 opacity-0 group-hover:opacity-100 group-hover:h-[20px]" />
        <div
          onClick={onJoin}
          className="w-12 h-12 bg-[#2b2d31] rounded-[24px] group-hover:rounded-[16px] group-hover:bg-[#23A559] transition-all duration-200 flex items-center justify-center text-[#23A559] group-hover:text-white cursor-pointer"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
          </svg>
        </div>
      </div>
    </div>
  );
}