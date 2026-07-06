"use client";

import { useEffect } from "react";
import { pusherClient } from "@/lib/pusher-client";

interface PusherCallbacks {
  onNodeCreated?: (data: unknown) => void;
  onNodeUpdated?: (data: unknown) => void;
  onNodeMoved?: (data: unknown) => void;
  onNodeDeleted?: (data: unknown) => void;
  onEdgeCreated?: (data: unknown) => void;
  onEdgeDeleted?: (data: unknown) => void;
}

export function usePusher(graphId: string, callbacks: PusherCallbacks) {
  useEffect(() => {
    const channel = pusherClient.subscribe(`private-graph-${graphId}`);

    if (callbacks.onNodeCreated) channel.bind("node-created", callbacks.onNodeCreated);
    if (callbacks.onNodeUpdated) channel.bind("node-updated", callbacks.onNodeUpdated);
    if (callbacks.onNodeMoved) channel.bind("node-moved", callbacks.onNodeMoved);
    if (callbacks.onNodeDeleted) channel.bind("node-deleted", callbacks.onNodeDeleted);
    if (callbacks.onEdgeCreated) channel.bind("edge-created", callbacks.onEdgeCreated);
    if (callbacks.onEdgeDeleted) channel.bind("edge-deleted", callbacks.onEdgeDeleted);

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`private-graph-${graphId}`);
    };
  }, [graphId]); // eslint-disable-line react-hooks/exhaustive-deps
}
