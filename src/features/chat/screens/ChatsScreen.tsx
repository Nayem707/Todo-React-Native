import { useCallback, useMemo } from "react";
import { FlatList, Pressable, RefreshControl, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { ChevronRight, CircleAlert, MessageCircle, UserPlus } from "lucide-react-native";

import { Screen } from "../../../components/common";
import {
  Avatar,
  Button,
  EmptyState,
  Loader,
  Text,
} from "../../../components/ui";
import { colors } from "../../../constants/theme";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { FindPeopleModal } from "../../users/components/FindPeopleModal";
import { fetchFriendGraph, openFindPeople } from "../../users/usersSlice";
import {
  selectConversationListError,
  selectConversationListStatus,
  selectConversations,
  selectConversationsRefreshing,
  selectUserPresence,
} from "../chatSelectors";
import { fetchConversations } from "../chatSlice";
import type { Conversation } from "../chatTypes";
import { useOpenConversation } from "../useOpenConversation";

function previewText(conversation: Conversation) {
  const content = conversation.lastMessage?.content?.trim();
  return content || "No messages yet";
}

function ConversationRow({ conversation }: { conversation: Conversation }) {
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const peer = conversation.membersMeta.find(
    (member) => member.userId !== currentUserId,
  );
  const livePresence = useAppSelector((state) =>
    selectUserPresence(state, peer?.userId),
  );
  const isOnline =
    livePresence !== undefined
      ? livePresence
      : peer?.status === "online" || conversation.status === "online";

  return (
    <View className="mb-3 flex-row items-center gap-3 rounded-[24px] border border-slate-200 bg-white px-4 py-3">
      <Avatar
        name={conversation.name}
        uri={conversation.avatar ?? peer?.avatar}
        size={52}
        showStatus
        isOnline={Boolean(isOnline)}
      />
      <View className="min-w-0 flex-1">
        <View className="flex-row items-center justify-between gap-2">
          <Text variant="subtitle" numberOfLines={1} className="flex-1">
            {conversation.name}
          </Text>
          {conversation.unreadCount > 0 ? (
            <View className="min-w-6 items-center rounded-full bg-accent px-2 py-0.5">
              <Text className="text-xs font-semibold text-white">
                {conversation.unreadCount}
              </Text>
            </View>
          ) : null}
        </View>
        <Text variant="muted" numberOfLines={1}>
          {previewText(conversation)}
        </Text>
      </View>
      <ChevronRight color={colors.muted} size={20} strokeWidth={2} />
    </View>
  );
}

export function ChatsScreen() {
  const dispatch = useAppDispatch();
  const openConversation = useOpenConversation();
  const conversations = useAppSelector(selectConversations);
  const listStatus = useAppSelector(selectConversationListStatus);
  const listError = useAppSelector(selectConversationListError);
  const isRefreshing = useAppSelector(selectConversationsRefreshing);
  const isInitialLoading = listStatus === "loading" && conversations.length === 0;

  useFocusEffect(
    useCallback(() => {
      void dispatch(fetchConversations());
      void dispatch(fetchFriendGraph());
    }, [dispatch]),
  );

  const findPeopleButton = useMemo(
    () => (
      <View className="mt-6">
        <Button
          icon={UserPlus}
          label="Find People"
          onPress={() => dispatch(openFindPeople())}
        />
      </View>
    ),
    [dispatch],
  );

  return (
    <Screen>
      {isInitialLoading ? (
        <Loader className="flex-1" size="large" />
      ) : listError && conversations.length === 0 ? (
        <View className="flex-1 justify-center px-6 py-8">
          <EmptyState
            icon={CircleAlert}
            title="Couldn't load chats"
            subtitle={listError}
          >
            <View className="mt-4 w-full">
              <Button
                label="Try again"
                onPress={() => {
                  void dispatch(fetchConversations());
                }}
              />
            </View>
          </EmptyState>
          {findPeopleButton}
        </View>
      ) : conversations.length === 0 ? (
        <View className="flex-1 justify-center px-6 py-8">
          <EmptyState
            icon={MessageCircle}
            title="No conversations yet"
            subtitle="Add friends and send a message to start a conversation."
          />
          {findPeopleButton}
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 py-4"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                void dispatch(fetchConversations({ silent: true }));
              }}
              tintColor={colors.accent}
            />
          }
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void openConversation(item.id);
              }}
            >
              <ConversationRow conversation={item} />
            </Pressable>
          )}
        />
      )}
      <FindPeopleModal />
    </Screen>
  );
}
