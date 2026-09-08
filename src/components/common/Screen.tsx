import { View, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cn } from "../../utils/cn";

type ScreenProps = ViewProps & {
  safe?: boolean;
};

export function Screen({ className, style, safe = false, ...props }: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn("flex-1 bg-paper", className)}
      style={[safe ? { paddingTop: insets.top } : null, style]}
      {...props}
    />
  );
}
