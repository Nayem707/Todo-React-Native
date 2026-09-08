import { useLocalSearchParams } from "expo-router";

import { Screen } from "../../../components/common";
import { Card, Text } from "../../../components/ui";

export function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen className="px-6 py-8">
      <Card className="flex-1 items-center justify-center p-6">
        <Text variant="title">Conversation</Text>
        <Text variant="caption" className="mt-2 font-mono">
          {id}
        </Text>
        <Text variant="muted" className="mt-4 text-center">
          Messages, typing indicators, attachments, and delivery status will
          live on this screen.
        </Text>
      </Card>
    </Screen>
  );
}
