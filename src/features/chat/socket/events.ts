/** Outbound (client → server) and inbound (server → client) Socket.IO events. */
export const SOCKET_EVENTS = {
  joinConversation: "join_conversation",
  leaveConversation: "leave_conversation",
  typingStart: "typing_start",
  typingStop: "typing_stop",
  typing: "typing",
  newMessage: "new_message",
  messageEdited: "message_edited",
  messageDeleted: "message_deleted",
  userOnline: "user_online",
  userOffline: "user_offline",
  online: "online",
  offline: "offline",
} as const;

export type SocketEventName =
  (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

export const SOCKET_INBOUND_EVENTS = [
  SOCKET_EVENTS.typing,
  SOCKET_EVENTS.newMessage,
  SOCKET_EVENTS.messageEdited,
  SOCKET_EVENTS.messageDeleted,
  SOCKET_EVENTS.userOnline,
  SOCKET_EVENTS.userOffline,
  SOCKET_EVENTS.online,
  SOCKET_EVENTS.offline,
] as const;
