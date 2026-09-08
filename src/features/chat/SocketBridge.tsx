import { useEffect, useRef } from "react";

import { socketClient } from "../../services/socket";
import { SOCKET_EVENTS } from "../../services/socket/events";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectIsAuthenticated } from "../auth/authSelectors";
import {
  mapChatMessage,
  mapDeletedMessage,
  mapPresencePayload,
  mapTypingPayload,
} from "./chatMappers";
import { selectChatState } from "./chatSelectors";
import {
  fetchConversation,
  messageDeleted,
  messageEdited,
  messageReceived,
  presenceUpdated,
  typingUpdated,
} from "./chatSlice";

export function SocketBridge() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const conversationIds = useAppSelector(
    (state) => selectChatState(state).conversationIds,
  );
  const conversationIdsRef = useRef(conversationIds);
  conversationIdsRef.current = conversationIds;

  useEffect(() => {
    if (!isAuthenticated) {
      socketClient.disconnect();
      return;
    }

    void socketClient.connect();

    const unsubscribe = socketClient.subscribe((event, payload) => {
      if (event === SOCKET_EVENTS.newMessage) {
        const message = mapChatMessage(payload);
        if (!message) {
          return;
        }

        dispatch(messageReceived(message));
        if (!conversationIdsRef.current.includes(message.conversationId)) {
          void dispatch(fetchConversation(message.conversationId));
        }
        return;
      }

      if (event === SOCKET_EVENTS.messageEdited) {
        const message = mapChatMessage(payload);
        if (message) {
          dispatch(
            messageEdited({
              id: message.id,
              content: message.content,
              editedAt: message.editedAt ?? undefined,
            }),
          );
        }
        return;
      }

      if (event === SOCKET_EVENTS.messageDeleted) {
        const deleted = mapDeletedMessage(payload);
        if (deleted) {
          dispatch(messageDeleted(deleted));
        }
        return;
      }

      if (event === SOCKET_EVENTS.typing) {
        const typing = mapTypingPayload(payload);
        if (typing) {
          dispatch(typingUpdated(typing));
        }
        return;
      }

      if (
        event === SOCKET_EVENTS.userOnline ||
        event === SOCKET_EVENTS.online
      ) {
        const userId =
          typeof payload === "string"
            ? payload
            : mapPresencePayload(payload)?.userId;
        if (userId) {
          dispatch(presenceUpdated({ userId, isOnline: true }));
        }
        return;
      }

      if (
        event === SOCKET_EVENTS.userOffline ||
        event === SOCKET_EVENTS.offline
      ) {
        const userId =
          typeof payload === "string"
            ? payload
            : mapPresencePayload(payload)?.userId;
        if (userId) {
          dispatch(presenceUpdated({ userId, isOnline: false }));
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch, isAuthenticated]);

  return null;
}
