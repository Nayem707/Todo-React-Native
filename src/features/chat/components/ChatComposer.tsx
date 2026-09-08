import { Pressable, TextInput, View } from "react-native";
import { Camera, Mic, Paperclip, Send, Smile } from "lucide-react-native";

import { chatTheme } from "../chatTheme";

type ChatComposerProps = {
  value: string;
  sending?: boolean;
  onChangeText: (value: string) => void;
  onSend: () => void;
};

export function ChatComposer({
  value,
  sending = false,
  onChangeText,
  onSend,
}: ChatComposerProps) {
  const canSend = Boolean(value.trim()) && !sending;

  return (
    <View
      className="flex-row items-end px-2 pb-3 pt-1"
      style={{ backgroundColor: chatTheme.wallpaper }}
    >
      <View className="min-h-12 flex-1 flex-row items-center rounded-full bg-white px-2 py-1 shadow-sm">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Emoji"
          className="h-10 w-10 items-center justify-center"
        >
          <Smile color={chatTheme.headerIcon} size={22} strokeWidth={2} />
        </Pressable>
        <TextInput
          className="flex-1 px-1 py-2 text-[16px] text-slate-900"
          placeholder="Message"
          placeholderTextColor="#8A9AA3"
          value={value}
          onChangeText={onChangeText}
          multiline
          onSubmitEditing={onSend}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Attach file"
          className="h-10 w-10 items-center justify-center"
        >
          <Paperclip color={chatTheme.headerIcon} size={20} strokeWidth={2} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Camera"
          className="h-10 w-10 items-center justify-center"
        >
          <Camera color={chatTheme.headerIcon} size={20} strokeWidth={2} />
        </Pressable>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={canSend ? "Send message" : "Voice message"}
        disabled={!canSend}
        onPress={onSend}
        className="mb-0.5 ml-2 h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: chatTheme.action, opacity: canSend ? 1 : 0.95 }}
      >
        {canSend ? (
          <Send color="#FFFFFF" size={20} strokeWidth={2} />
        ) : (
          <Mic color="#FFFFFF" size={22} strokeWidth={2} />
        )}
      </Pressable>
    </View>
  );
}
