import { View, type ViewProps } from "react-native";

import { cn } from "../../utils/cn";

export function Card({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn(
        "rounded-[24px] border border-slate-200 bg-white p-4",
        className,
      )}
      {...props}
    />
  );
}
