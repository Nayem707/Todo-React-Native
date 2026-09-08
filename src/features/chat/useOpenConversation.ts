import { useCallback, useRef } from "react";
import { useRouter } from "expo-router";

import { useAppDispatch } from "../../store/hooks";
import { fetchConversation, openDirectConversation } from "./chatSlice";

export function useOpenConversation() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const opening = useRef(false);

  return useCallback(
    async (id: string) => {
      if (!id || opening.current) {
        return false;
      }

      opening.current = true;

      try {
        let conversation = await dispatch(fetchConversation(id))
          .unwrap()
          .catch(() => null);

        if (!conversation) {
          conversation = await dispatch(openDirectConversation(id)).unwrap();
        }

        router.push({
          pathname: "/chat/[id]",
          params: { id: conversation.id },
        });
        return true;
      } catch {
        return false;
      } finally {
        opening.current = false;
      }
    },
    [dispatch, router],
  );
}
