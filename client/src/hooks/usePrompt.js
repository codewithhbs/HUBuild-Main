// usePrompt.js
import { useCallback } from "react";
import { useBlocker } from "./useBlocker";

export function usePrompt(message, when) {
  const blocker = useCallback(
    (tx) => {
      const confirm = window.confirm(message);
      if (confirm) {
        tx.retry();
      }
    },
    [message]
  );

  useBlocker(blocker, when);
}
