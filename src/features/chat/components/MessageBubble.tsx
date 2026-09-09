import { View } from "react-native";
import { Check, CheckCheck } from "lucide-react-native";

import { Text } from "../../../components/ui";
import { chatTheme } from "../chatTheme";
import { formatMessageTime } from "../chatTime";
import type { ChatMessage } from "../chatTypes";

type MessageBubbleProps = {
  message: ChatMessage;
  isMine: boolean;
  showSender?: boolean;
};

function Ticks({ message }: { message: ChatMessage }) {
  const othersRead = message.readBy.some((userId) => userId !== message.senderId);

  if (othersRead || message.status === "READ") {
    return <CheckCheck color={chatTheme.read} size={14} strokeWidth={2.2} />;
  }

  if (message.status === "DELIVERED") {
    return <CheckCheck color={chatTheme.timestamp} size={14} strokeWidth={2.2} />;
  }
  return <Check color={chatTheme.timestamp} size={14} strokeWidth={2.2} />;
}

export function MessageBubble({
  message,
  isMine,
  showSender = false,
}: MessageBubbleProps) {
  return (
    <View className={`mb-1 max-w-[82%] ${isMine ? "self-end" : "self-start"}`}>
      <View
        className={`px-2.5 pb-1.5 pt-1.5 ${
          isMine ? "rounded-2xl rounded-tr-sm" : "rounded-2xl rounded-tl-sm"
        }`}
        style={{
          backgroundColor: isMine ? chatTheme.outgoing : chatTheme.incoming,
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 2,
          shadowOffset: { width: 0, height: 1 },
          elevation: 1,
        }}
      >
        {showSender && message.senderName ? (
          <Text className="mb-0.5 text-xs font-semibold text-sky-700">
            {message.senderName}
          </Text>
        ) : null}
        
        <Text className="text-[15px] leading-5 text-slate-900">
          {message.content || " "}
        </Text>

        <View className="flex-row items-center justify-end gap-1">
          {message.editedAt ? (
            <Text className="text-[10px]" style={{ color: chatTheme.timestamp }}>
              Edited
            </Text>
          ) : null}

          <Text className="text-xs" style={{ color: chatTheme.timestamp }}>
            {formatMessageTime(message.createdAt)}
          </Text>

          {isMine ? <Ticks message={message} /> : null}
        </View>
      </View>
    </View>
  );
}
