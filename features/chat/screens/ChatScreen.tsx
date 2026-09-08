import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ChatBubbleLeftRightIcon } from "react-native-heroicons/outline";

export function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 bg-paper px-6 py-8">
      <View className="flex-1 items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-white px-6">
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-sky-50">
          <ChatBubbleLeftRightIcon color="#0284c7" size={28} />
        </View>
        <Text className="text-center text-xl font-bold text-slate-900">
          Conversation
        </Text>
        <Text className="mt-2 text-center font-mono text-xs text-slate-400">
          {id}
        </Text>
        <Text className="mt-4 text-center text-sm leading-6 text-slate-500">
          Real-time messages, typing indicators, attachments, and delivery
          status will live on this screen.
        </Text>
      </View>
    </View>
  );
}
