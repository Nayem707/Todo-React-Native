import { useCallback } from "react";

import { useAppDispatch } from "../../store/hooks";
import { useOpenConversation } from "../chat/useOpenConversation";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  declineFriendRequest,
  sendFriendRequest,
} from "./usersSlice";

export function usePersonActions() {
  const dispatch = useAppDispatch();
  const openConversation = useOpenConversation();

  const onAdd = useCallback(
    (userId: string) => {
      void dispatch(sendFriendRequest({ userId }));
    },
    [dispatch],
  );

  const onCancel = useCallback(
    (userId: string, requestId: string | null) => {
      void dispatch(cancelFriendRequest({ userId, requestId }));
    },
    [dispatch],
  );

  const onConfirm = useCallback(
    (userId: string, requestId: string | null) => {
      void dispatch(acceptFriendRequest({ userId, requestId }));
    },
    [dispatch],
  );

  const onDecline = useCallback(
    (userId: string, requestId: string | null) => {
      void dispatch(declineFriendRequest({ userId, requestId }));
    },
    [dispatch],
  );

  const onMessage = useCallback(
    (userId: string) => {
      void openConversation(userId);
    },
    [openConversation],
  );

  return { onAdd, onCancel, onConfirm, onDecline, onMessage };
}
