import { FlatList, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ChatBubbleLeftRightIcon } from "react-native-heroicons/outline";
import { useDispatch, useSelector } from "react-redux";

import { EmptyState } from "../../../components/EmptyState";
import { setActiveConversation } from "../chatSlice";
import type { Conversation } from "../types";
import type { RootState } from "../../../store";

export function ChatsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const conversations = useSelector(
    (state: RootState) => state.chat.conversations,
  );

  const openConversation = (conversation: Conversation) => {
    dispatch(setActiveConversation(conversation.id));
    router.push(`/chat/${conversation.id}`);
  };

  return (
    <View className="flex-1 bg-paper">
      {conversations.length === 0 ? (
        <View className="flex-1 justify-center px-6">
          <EmptyState
            title="No conversations yet"
            subtitle="One-to-one and group chats will appear here once you sign in and start messaging."
          />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 py-3"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => openConversation(item)}
              className="mb-3 flex-row items-center gap-3 rounded-[24px] border border-slate-200 bg-white px-4 py-4"
            >
              <View className="h-12 w-12 items-center justify-center rounded-full bg-sky-50">
                <ChatBubbleLeftRightIcon color="#0284c7" size={22} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-slate-900">
                  {item.title}
                </Text>
                <Text className="mt-1 text-sm text-slate-500" numberOfLines={1}>
                  {item.lastMessagePreview ?? "No messages yet"}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
