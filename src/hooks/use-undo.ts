import { useCallback, useRef } from "react";

export type UndoActionType =
  | "node-create"
  | "node-delete"
  | "node-move"
  | "node-update"
  | "edge-create"
  | "edge-delete";

export interface UndoAction {
  type: UndoActionType;
  description: string;
  undo: () => Promise<void> | void;
}

const MAX_UNDO_STACK = 50;

export function useUndo() {
  const stackRef = useRef<UndoAction[]>([]);

  const push = useCallback((action: UndoAction) => {
    stackRef.current = [...stackRef.current.slice(-(MAX_UNDO_STACK - 1)), action];
  }, []);

  const undo = useCallback(async (): Promise<UndoAction | null> => {
    const action = stackRef.current.pop();
    if (!action) return null;
    await action.undo();
    return action;
  }, []);

  const canUndo = useCallback(() => stackRef.current.length > 0, []);

  const peek = useCallback((): UndoAction | null => {
    return stackRef.current[stackRef.current.length - 1] || null;
  }, []);

  const clear = useCallback(() => {
    stackRef.current = [];
  }, []);

  return { push, undo, canUndo, peek, clear };
}
