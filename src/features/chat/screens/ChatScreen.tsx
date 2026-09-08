import { useEffect } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { MessageCircle, Paperclip, Send } from "lucide-react-native";

import { Screen } from "../../../components/common";
import { EmptyState, IconButton, Input } from "../../../components/ui";
import { colors } from "../../../constants/theme";
import { useAppSelector } from "../../../store/hooks";
import { selectPersonById } from "../../users/usersSelectors";

export function ChatScreen() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const person = useAppSelector((state) => selectPersonById(state, id));

  useEffect(() => {
    navigation.setOptions({
      title: person?.name ?? "Chat",
    });
  }, [navigation, person?.name]);

  return (
    <Screen className="px-6 py-8">
      <EmptyState
        icon={MessageCircle}
        className="flex-1 justify-center"
        title="No messages yet"
        subtitle={
          person
            ? `Start a conversation with ${person.name}. Messages will appear here.`
            : "This conversation is empty."
        }
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
