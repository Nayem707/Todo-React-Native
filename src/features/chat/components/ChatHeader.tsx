import { View } from "react-native";
import { MoreVertical, Phone, Video } from "lucide-react-native";

import { Avatar, IconButton, Text } from "../../../components/ui";
import { chatTheme } from "../chatTheme";

type ChatHeaderTitleProps = {
  name: string;
  subtitle: string;
  avatar?: string | null;
  isOnline?: boolean;
};

export function ChatHeaderTitle({
  name,
  subtitle,
  avatar,
  isOnline = false,
}: ChatHeaderTitleProps) {
  return (
    <View className="flex-row items-center gap-2">
      <Avatar name={name} uri={avatar} size={36} showStatus isOnline={isOnline} />
      <View className="min-w-0 flex-1">
        <Text numberOfLines={1} className="text-[16px] font-semibold text-slate-900">
          {name}
        </Text>
        <Text numberOfLines={1} className="text-[12px]" style={{ color: chatTheme.timestamp }}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

export function ChatHeaderActions() {
  return (
    <View className="flex-row items-center">
      <IconButton
        icon={Video}
        color={chatTheme.headerIcon}
        accessibilityLabel="Video call"
      />
      <IconButton
        icon={Phone}
        color={chatTheme.headerIcon}
        accessibilityLabel="Voice call"
      />
      <IconButton
        icon={MoreVertical}
        color={chatTheme.headerIcon}
        accessibilityLabel="More options"
      />
    </View>
  );
}
