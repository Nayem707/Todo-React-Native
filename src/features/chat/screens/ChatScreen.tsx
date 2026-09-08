import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { MessageCircle, Paperclip, Send } from "lucide-react-native";

import { Screen } from "../../../components/common";
import { EmptyState, IconButton, Input } from "../../../components/ui";
import { colors } from "../../../constants/theme";

export function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen className="px-6 py-8">
      <EmptyState
        icon={MessageCircle}
        className="flex-1 justify-center"
        title="Conversation"
        subtitle={`Messages, attachments, and delivery status will live here.${id ? ` (${id})` : ""}`}
      />
      <View className="mt-4 flex-row items-center gap-2">
        <IconButton
          icon={Paperclip}
          accessibilityLabel="Attach file"
          disabled
        />
        <View className="flex-1">
          <Input editable={false} placeholder="Message" />
        </View>
        <IconButton
          icon={Send}
          color={colors.accent}
          accessibilityLabel="Send message"
          disabled
        />
      </View>
    </Screen>
  );
}
