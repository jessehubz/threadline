"use client";

import { useEffect, useRef } from "react";
import { getPusherClient } from "@/lib/pusher-client";

// pusher-js dedupes `subscribe()` calls by channel name (a second subscribe
// to an already-subscribed channel just returns the existing Channel
// instance without re-sending a subscribe frame). It does NOT reference-count
// `unsubscribe()` though: if two independent components both subscribe to
// `private-user-{userId}`, the first one to unmount and call `unsubscribe()`
// tears the channel down for the other too. This map reference-counts
// subscribers per channel name so the channel is only torn down once every
// caller relying on it has unmounted.
const refCounts = new Map<string, number>();

type EventHandlers = Record<string, (data: unknown) => void>;

/**
 * Subscribe to a user's private channel (`private-user-{userId}`) and bind a
 * set of event handlers, safely sharing the underlying Pusher subscription
 * with any other component using this hook for the same userId.
 *
 * `handlers` may be a fresh object on every render — only `userId` changes
 * trigger a re-subscribe; the latest handlers are always used via a ref.
 */
export function useUserChannel(userId: string | null | undefined, handlers: EventHandlers) {
  const handlersRef = useRef(handlers);

  // Keep the ref pointed at the latest handlers after every render. This
  // happens in an effect (not render) so it never mutates a ref while
  // rendering.
  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!userId) return;

    const channelName = `private-user-${userId}`;
    const channel = getPusherClient().subscribe(channelName);
    refCounts.set(channelName, (refCounts.get(channelName) ?? 0) + 1);

    const events = Object.keys(handlersRef.current);
    const boundFns = events.map((event) => {
      const fn = (data: unknown) => handlersRef.current[event]?.(data);
      channel.bind(event, fn);
      return fn;
    });

    return () => {
      events.forEach((event, i) => channel.unbind(event, boundFns[i]));

      const remaining = (refCounts.get(channelName) ?? 1) - 1;
      if (remaining <= 0) {
        refCounts.delete(channelName);
        getPusherClient().unsubscribe(channelName);
      } else {
        refCounts.set(channelName, remaining);
      }
    };
  }, [userId]);
}
