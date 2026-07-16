"use client";

import { useEffect, useState, useRef } from "react";
import { getPusherClient } from "@/lib/pusher-client";
import type { PresenceChannel, Members } from "pusher-js";

export interface PresenceMember {
  id: string;
  info: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
}

/**
 * Subscribe to a Pusher presence channel and track which members are online.
 * The current user is automatically included via the auth endpoint.
 *
 * @param channelName - Must start with "presence-" (e.g. "presence-dashboard")
 * @param enabled - Pass false to skip subscription (e.g. when userId isn't known yet)
 */
export function usePresence(channelName: string, enabled = true) {
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
  const channelRef = useRef<PresenceChannel | null>(null);

  useEffect(() => {
    if (!enabled || !channelName.startsWith("presence-")) return;

    const pusher = getPusherClient();
    const channel = pusher.subscribe(channelName) as PresenceChannel;
    channelRef.current = channel;

    channel.bind("pusher:subscription_succeeded", (members: Members) => {
      const ids = new Set<string>();
      members.each((member: PresenceMember) => {
        ids.add(member.id);
      });
      setOnlineIds(ids);
    });

    channel.bind("pusher:member_added", (member: PresenceMember) => {
      setOnlineIds((prev) => {
        const next = new Set(prev);
        next.add(member.id);
        return next;
      });
    });

    channel.bind("pusher:member_removed", (member: PresenceMember) => {
      setOnlineIds((prev) => {
        const next = new Set(prev);
        next.delete(member.id);
        return next;
      });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      channelRef.current = null;
    };
  }, [channelName, enabled]);

  return onlineIds;
}
