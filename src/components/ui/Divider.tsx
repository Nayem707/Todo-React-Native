import { View, type ViewProps } from "react-native";

import { cn } from "../../utils/cn";

export function Divider({ className, ...props }: ViewProps) {
  return <View className={cn("h-px bg-slate-200", className)} {...props} />;
}
