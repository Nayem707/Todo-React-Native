import { ActivityIndicator, View } from "react-native";

import { colors } from "../../constants/theme";
import { cn } from "../../utils/cn";

type LoaderProps = {
  className?: string;
  size?: "small" | "large";
};

export function Loader({ className, size = "small" }: LoaderProps) {
  return (
    <View className={cn("items-center justify-center py-6", className)}>
      <ActivityIndicator color={colors.accent} size={size} />
    </View>
  );
}
