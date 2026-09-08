import type { ReactNode } from "react";
import {
  Modal,
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { cn } from "../../utils/cn";

type SheetModalProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  contentClassName?: string;
  contentStyle?: StyleProp<ViewStyle>;
};

export function SheetModal({
  visible,
  onClose,
  children,
  contentClassName,
  contentStyle,
}: SheetModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          className="absolute inset-0 bg-black/40"
          onPress={onClose}
        />
        <View
          className={cn(
            "max-h-[88%] rounded-t-[28px] bg-paper shadow-glow",
            contentClassName,
          )}
          style={contentStyle}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
}
