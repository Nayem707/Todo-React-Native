import { io, type Socket } from "socket.io-client";

import { getSocketUrl } from "../../constants/env";
import { loadSession } from "../auth/sessionStorage";
import { SOCKET_EVENTS, type SocketEventName } from "./events";

type SocketHandler = (event: SocketEventName, payload: unknown) => void;

async function resolveAuthToken(): Promise<string | null> {
  const session = await loadSession();
  return session?.accessToken ?? null;
}

class SocketClient {
  private socket: Socket | null = null;
  private handlers = new Set<SocketHandler>();
  private joinedRooms = new Set<string>();

  subscribe(handler: SocketHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  isConnected(): boolean {
    return this.socket?.connected === true;
  }

  async connect(): Promise<void> {
    const token = await resolveAuthToken();

    if (!token) {
      this.disconnect();
      return;
    }

    if (this.socket) {
      this.socket.auth = { token };
      if (!this.socket.connected) {
        this.socket.connect();
      }
      return;
    }

    this.socket = io(getSocketUrl(), {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
    });

    this.bindSocket(this.socket);
  }

  disconnect(): void {
    this.joinedRooms.clear();

    if (!this.socket) {
      return;
    }

    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
  }

  joinConversation(conversationId: string): void {
    if (!conversationId) {
      return;
    }

    this.joinedRooms.add(conversationId);
    this.socket?.emit(SOCKET_EVENTS.join, { conversationId });
  }

  leaveConversation(conversationId: string): void {
    if (!conversationId) {
      return;
    }

    this.joinedRooms.delete(conversationId);
    this.socket?.emit(SOCKET_EVENTS.leave, { conversationId });
  }

  emitTyping(conversationId: string, isTyping: boolean): void {
    if (!conversationId) {
      return;
    }

    this.socket?.emit(SOCKET_EVENTS.typing, { conversationId, isTyping });
  }

  private bindSocket(socket: Socket) {
    socket.io.on("reconnect_attempt", () => {
      void resolveAuthToken().then((token) => {
        if (token) {
          socket.auth = { token };
        }
      });
    });

    socket.on("connect", () => {
      for (const conversationId of this.joinedRooms) {
        socket.emit(SOCKET_EVENTS.join, { conversationId });
      }
    });

    const inbound: SocketEventName[] = [
      SOCKET_EVENTS.newMessage,
      SOCKET_EVENTS.messageEdited,
      SOCKET_EVENTS.messageDeleted,
      SOCKET_EVENTS.typing,
      SOCKET_EVENTS.userOnline,
      SOCKET_EVENTS.userOffline,
      SOCKET_EVENTS.online,
      SOCKET_EVENTS.offline,
    ];

    for (const event of inbound) {
      socket.on(event, (payload: unknown) => {
        this.dispatch(event, payload);
      });
    }
  }

  private dispatch(event: SocketEventName, payload: unknown) {
    for (const handler of this.handlers) {
      handler(event, payload);
    }
  }
}

export const socketClient = new SocketClient();
