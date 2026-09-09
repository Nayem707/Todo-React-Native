export const SOCKET_EVENTS = {
  join: "join",
  leave: "leave",
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
