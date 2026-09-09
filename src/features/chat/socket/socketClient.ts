import { io, type Socket } from "socket.io-client";

import { getSocketUrl } from "../../../constants/env";
import { loadSession } from "../../auth/sessionStorage";
import {
  SOCKET_EVENTS,
  SOCKET_INBOUND_EVENTS,
  type SocketEventName,
} from "./events";

type SocketHandler = (event: SocketEventName, payload: unknown) => void;

async function resolveAuthToken(): Promise<string | null> {
  const session = await loadSession();
  return session?.accessToken ?? null;
}

class SocketClient {
  private socket: Socket | null = null;
  private handlers = new Set<SocketHandler>();
  private joinedRooms = new Set<string>();
  private connectPromise: Promise<void> | null = null;

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
    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.connectPromise = this.connectInternal().finally(() => {
      this.connectPromise = null;
    });

    return this.connectPromise;
  }

  private async connectInternal(): Promise<void> {
    const token = await resolveAuthToken();

    if (!token) {
      this.disconnect();
      return;
    }

    if (this.socket) {
      this.socket.auth = { token };
      if (!this.socket.connected) {
        await new Promise<void>((resolve) => {
          this.socket?.once("connect", () => resolve());
          this.socket?.once("connect_error", () => resolve());
          this.socket?.connect();
        });
      }
      return;
    }

    this.socket = io(getSocketUrl(), {
      auth: { token },
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
    });

    this.bindSocket(this.socket);

    if (!this.socket.connected) {
      await new Promise<void>((resolve) => {
        this.socket?.once("connect", () => resolve());
        this.socket?.once("connect_error", () => resolve());
      });
    }
  }

  disconnect(): void {
    this.joinedRooms.clear();
    this.connectPromise = null;

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
    this.emitJoin(conversationId);
  }

  leaveConversation(conversationId: string): void {
    if (!conversationId) {
      return;
    }

    this.joinedRooms.delete(conversationId);
    this.socket?.emit(SOCKET_EVENTS.leaveConversation, { conversationId });
  }

  emitTyping(conversationId: string, isTyping: boolean): void {
    if (!conversationId || !this.socket?.connected) {
      return;
    }

    if (!this.joinedRooms.has(conversationId)) {
      this.joinConversation(conversationId);
    }

    this.socket.emit(
      isTyping ? SOCKET_EVENTS.typingStart : SOCKET_EVENTS.typingStop,
      { conversationId },
    );
  }

  private emitJoin(conversationId: string) {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit(SOCKET_EVENTS.joinConversation, { conversationId });
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
        this.emitJoin(conversationId);
      }
    });

    for (const event of SOCKET_INBOUND_EVENTS) {
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
