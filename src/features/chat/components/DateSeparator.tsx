import { View } from "react-native";

import { Text } from "../../../components/ui";
import { chatTheme } from "../chatTheme";

export function DateSeparator({ label }: { label: string }) {
  return (
    <View className="my-3 items-center">
      <View
        className="rounded-lg px-3 py-1"
        style={{ backgroundColor: chatTheme.dateChip }}
      >
        <Text className="text-xs font-medium" style={{ color: chatTheme.timestamp }}>
          {label}
        </Text>
      </View>
    </View>
  );
}
