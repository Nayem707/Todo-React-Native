import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, View } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { CircleAlert, MessageCircle } from "lucide-react-native";

import {
  KeyboardAvoidingWrapper,
  Screen,
} from "../../../components/common";
import { Button, EmptyState, Loader, Text } from "../../../components/ui";
import { socketClient } from "../../../services/socket";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { selectAuthUser } from "../../auth/authSelectors";
import { ChatComposer } from "../components/ChatComposer";
import { ChatHeaderActions, ChatHeaderTitle } from "../components/ChatHeader";
import { ChatWallpaper } from "../components/ChatWallpaper";
import { DateSeparator } from "../components/DateSeparator";
import { MessageBubble } from "../components/MessageBubble";
import {
  selectConversationById,
  selectMessagesByConversation,
  selectMessagesError,
  selectMessagesStatus,
  selectSendPending,
  selectTypingUserIds,
  selectUserPresence,
} from "../chatSelectors";
import {
  fetchConversation,
  fetchMessages,
  sendMessage,
  setActiveConversation,
} from "../chatSlice";
import { chatTheme } from "../chatTheme";
import { dateKey, formatDateLabel } from "../chatTime";
import type { ChatMessage } from "../chatTypes";

type ChatRow =
  | { type: "date"; id: string; label: string }
  | { type: "message"; id: string; message: ChatMessage };

function toChatRows(messages: ChatMessage[]): ChatRow[] {
  const rows: ChatRow[] = [];
  let previousKey = "";

  for (const message of messages) {
    const key = dateKey(message.createdAt);
    if (key !== previousKey) {
      rows.push({
        type: "date",
        id: `date-${key}`,
        label: formatDateLabel(message.createdAt) || "Today",
      });
      previousKey = key;
    }

    rows.push({ type: "message", id: message.id, message });
  }

  return rows;
}

export function ChatScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = Array.isArray(id) ? id[0] : id;
  const user = useAppSelector(selectAuthUser);
  const conversation = useAppSelector((state) =>
    selectConversationById(state, conversationId),
  );
  const messages = useAppSelector((state) =>
    selectMessagesByConversation(state, conversationId),
  );
  const messagesStatus = useAppSelector((state) =>
    selectMessagesStatus(state, conversationId),
  );
  const messagesError = useAppSelector((state) =>
    selectMessagesError(state, conversationId),
  );
  const sending = useAppSelector((state) =>
    selectSendPending(state, conversationId),
  );
  const typingIds = useAppSelector((state) =>
    selectTypingUserIds(state, conversationId),
  );
  const [draft, setDraft] = useState("");
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingSent = useRef(false);

  const peer = useMemo(
    () =>
      conversation?.membersMeta.find((member) => member.userId !== user?.id),
    [conversation?.membersMeta, user?.id],
  );
  const livePresence = useAppSelector((state) =>
    selectUserPresence(state, peer?.userId),
  );
  const isOnline =
    livePresence !== undefined
      ? livePresence
      : peer?.status === "online" || conversation?.status === "online";
  const othersTyping = typingIds.filter((userId) => userId !== user?.id);
  const rows = useMemo(() => toChatRows(messages), [messages]);

  const subtitle = othersTyping.length
    ? "typing…"
    : isOnline
      ? "online"
      : "tap here for contact info";

  useEffect(() => {
    navigation.setOptions({
      title: "",
      headerTitleAlign: "left",
      headerStyle: { backgroundColor: "#FFFFFF" },
      headerTitle: () => (
        <ChatHeaderTitle
          name={conversation?.name ?? "Chat"}
          subtitle={subtitle}
          avatar={conversation?.avatar ?? peer?.avatar}
          isOnline={Boolean(isOnline)}
        />
      ),
      headerRight: () => <ChatHeaderActions />,
    });
  }, [
    conversation?.avatar,
    conversation?.name,
    isOnline,
    navigation,
    peer?.avatar,
    subtitle,
  ]);

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    dispatch(setActiveConversation(conversationId));
    socketClient.joinConversation(conversationId);
    void dispatch(fetchConversation(conversationId));
    void dispatch(fetchMessages({ conversationId }));

    return () => {
      socketClient.leaveConversation(conversationId);
      dispatch(setActiveConversation(null));
      socketClient.emitTyping(conversationId, false);
    };
  }, [conversationId, dispatch]);

  const stopTyping = useCallback(() => {
    if (!conversationId || !typingSent.current) {
      return;
    }

    typingSent.current = false;
    socketClient.emitTyping(conversationId, false);
  }, [conversationId]);

  const handleChangeText = (value: string) => {
    setDraft(value);

    if (!conversationId) {
      return;
    }

    if (!typingSent.current && value.trim()) {
      typingSent.current = true;
      socketClient.emitTyping(conversationId, true);
    }

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
      stopTyping();
    }, 1200);
  };

  const handleSend = async () => {
    const content = draft.trim();
    if (!conversationId || !content || sending) {
      return;
    }

    setDraft("");
    stopTyping();
    await dispatch(sendMessage({ conversationId, content }));
  };

  const isInitialLoading =
    messagesStatus === "loading" && messages.length === 0;

  return (
    <Screen className="bg-transparent" style={{ backgroundColor: chatTheme.wallpaper }}>
      <ChatWallpaper />
      <KeyboardAvoidingWrapper>
        {isInitialLoading ? (
          <Loader className="flex-1" size="large" />
        ) : messagesError && messages.length === 0 ? (
          <View className="flex-1 justify-center px-6">
            <EmptyState
              icon={CircleAlert}
              title="Couldn't load messages"
              subtitle={messagesError}
            >
              <View className="mt-4 w-full">
                <Button
                  label="Try again"
                  onPress={() => {
                    if (conversationId) {
                      void dispatch(fetchMessages({ conversationId }));
                    }
                  }}
                />
              </View>
            </EmptyState>
          </View>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(item) => item.id}
            contentContainerClassName="grow justify-end px-3 py-3"
            ListEmptyComponent={
              <View className="flex-1 justify-center py-10">
                <EmptyState
                  icon={MessageCircle}
                  title="No messages yet"
                  subtitle={
                    conversation
                      ? `Start a conversation with ${conversation.name}.`
                      : "This conversation is empty."
                  }
                />
              </View>
            }
            renderItem={({ item }) =>
              item.type === "date" ? (
                <DateSeparator label={item.label} />
              ) : (
                <MessageBubble
                  message={item.message}
                  isMine={item.message.senderId === user?.id}
                  showSender={conversation?.type === "GROUP"}
                />
              )
            }
          />
        )}
        {othersTyping.length > 0 ? (
          <Text variant="caption" className="px-5 pb-1">
            {conversation?.name ?? "Someone"} is typing…
          </Text>
        ) : null}
        <ChatComposer
          value={draft}
          sending={sending}
          onChangeText={handleChangeText}
          onSend={() => {
            void handleSend();
          }}
        />
      </KeyboardAvoidingWrapper>
    </Screen>
  );
}
