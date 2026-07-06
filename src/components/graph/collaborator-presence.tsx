"use client";

import { useEffect, useState } from "react";
import { getPusherClient } from "@/lib/pusher-client";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  name: string;
  imageUrl?: string;
}

export function CollaboratorPresence({ graphId }: { graphId: string }) {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const channel = getPusherClient().subscribe(`presence-graph-${graphId}`);

    channel.bind("pusher:subscription_succeeded", (data: { members: Record<string, Member> }) => {
      setMembers(Object.values(data.members));
    });

    channel.bind("pusher:member_added", (member: { info: Member }) => {
      setMembers((prev) => [...prev.filter((m) => m.id !== member.info.id), member.info]);
    });

    channel.bind("pusher:member_removed", (member: { info: Member }) => {
      setMembers((prev) => prev.filter((m) => m.id !== member.info.id));
    });

    return () => {
      getPusherClient().unsubscribe(`presence-graph-${graphId}`);
    };
  }, [graphId]);

  if (members.length === 0) return null;

  return (
    <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm700900">
      <div className="flex -space-x-2">
        {members.slice(0, 5).map((member) => (
          <div
            key={member.id}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-xs font-medium900",
              "bg-brand-100 text-brand-700"
            )}
            title={member.name}
          >
            {member.name[0]?.toUpperCase() || "?"}
          </div>
        ))}
      </div>
      {members.length > 5 && (
        <span className="ml-1 text-xs text-gray-500">+{members.length - 5}</span>
      )}
      <div className="ml-1 h-2 w-2 rounded-full bg-green-500" title="Live" />
    </div>
  );
}
