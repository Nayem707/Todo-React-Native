import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, View } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Check, CheckCheck, CircleAlert, MessageCircle, Paperclip, Send } from "lucide-react-native";

import {
  KeyboardAvoidingWrapper,
  Screen,
} from "../../../components/common";
import {
  Button,
  EmptyState,
  IconButton,
  Input,
  Loader,
  Text,
} from "../../../components/ui";
import { colors } from "../../../constants/theme";
import { socketClient } from "../../../services/socket";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { selectAuthUser } from "../../auth/authSelectors";
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
import type { ChatMessage } from "../chatTypes";

function MessageStatus({ message, isMine }: { message: ChatMessage; isMine: boolean }) {
  if (!isMine) {
    return null;
  }

  const othersRead = message.readBy.some(
    (userId) => userId !== message.senderId,
  );

  if (othersRead || message.status === "READ") {
    return <CheckCheck color={colors.accent} size={14} strokeWidth={2} />;
  }

  if (message.status === "DELIVERED") {
    return <CheckCheck color={colors.muted} size={14} strokeWidth={2} />;
  }

  return <Check color={colors.muted} size={14} strokeWidth={2} />;
}

function MessageBubble({
  message,
  isMine,
}: {
  message: ChatMessage;
  isMine: boolean;
}) {
  return (
    <View className={`mb-2 max-w-[80%] ${isMine ? "self-end" : "self-start"}`}>
      <View
        className={`rounded-3xl px-4 py-3 ${
          isMine ? "bg-accent" : "border border-slate-200 bg-white"
        }`}
      >
        {!isMine && message.senderName ? (
          <Text variant="caption" className="mb-1 text-sky-700">
            {message.senderName}
          </Text>
        ) : null}
        <Text className={isMine ? "text-white" : "text-slate-900"}>
          {message.content || " "}
        </Text>
      </View>
      <View
        className={`mt-1 flex-row items-center gap-1 ${
          isMine ? "justify-end" : "justify-start"
        }`}
      >
        {message.editedAt ? (
          <Text variant="caption">Edited</Text>
        ) : null}
        <MessageStatus message={message} isMine={isMine} />
      </View>
    </View>
  );
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
  const othersTyping = typingIds.filter((userId) => userId !== user?.id);

  useEffect(() => {
    navigation.setOptions({
      title: conversation?.name ?? "Chat",
    });
  }, [conversation?.name, navigation]);

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
    <Screen>
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
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerClassName="grow justify-end px-4 py-4"
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
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                isMine={item.senderId === user?.id}
              />
            )}
          />
        )}
        {othersTyping.length > 0 ? (
          <Text variant="caption" className="px-5 pb-1">
            {livePresence || peer?.status === "online"
              ? `${conversation?.name ?? "Someone"} is typing…`
              : "Typing…"}
          </Text>
        ) : null}
        <View className="flex-row items-center gap-2 px-4 pb-4">
          <IconButton
            icon={Paperclip}
            accessibilityLabel="Attach file"
            disabled
          />
          <View className="flex-1">
            <Input
              value={draft}
              onChangeText={handleChangeText}
              placeholder="Message"
              onSubmitEditing={() => {
                void handleSend();
              }}
              returnKeyType="send"
            />
          </View>
          <IconButton
            icon={Send}
            color={colors.accent}
            accessibilityLabel="Send message"
            disabled={!draft.trim() || sending}
            onPress={() => {
              void handleSend();
            }}
          />
        </View>
      </KeyboardAvoidingWrapper>
    </Screen>
  );
}
