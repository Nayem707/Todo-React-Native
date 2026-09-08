import { View } from "react-native";
import { useRouter } from "expo-router";

import { Screen } from "../../../components/common";
import { Button, EmptyState } from "../../../components/ui";

export function ChatsScreen() {
  const router = useRouter();

  return (
    <Screen className="justify-center px-6 py-8">
      <EmptyState
        title="No conversations yet"
        subtitle="One-to-one and group chats will appear here once messaging is connected."
      />
      <View className="mt-6">
        <Button
          label="Open sample chat"
          onPress={() =>
            router.push({
              pathname: "/chat/[id]",
              params: { id: "preview" },
            })
          }
        />
      </View>
    </Screen>
  );
}
