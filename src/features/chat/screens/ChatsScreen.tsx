import { View } from "react-native";
import { useRouter } from "expo-router";
import { MessageCircle, Plus } from "lucide-react-native";

import { Screen } from "../../../components/common";
import { Button, EmptyState } from "../../../components/ui";

export function ChatsScreen() {
  const router = useRouter();

  const openSampleChat = () => {
    router.push({
      pathname: "/chat/[id]",
      params: { id: "preview" },
    });
  };

  return (
    <Screen className="justify-center px-6 py-8">
      <EmptyState
        icon={MessageCircle}
        title="No conversations yet"
        subtitle="One-to-one and group chats will appear here once messaging is connected."
      />
      <View className="mt-6">
        <Button
          icon={Plus}
          label="New chat"
          onPress={openSampleChat}
        />
      </View>
    </Screen>
  );
}
