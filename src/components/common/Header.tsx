import type { ReactNode } from "react";
import { View } from "react-native";

import { Text } from "../ui/Text";
import { cn } from "../../utils/cn";

type HeaderProps = {
  title: string;
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
};

export function Header({ title, left, right, className }: HeaderProps) {
  return (
    <View className={cn("flex-row items-center justify-between py-2", className)}>
      <View className="h-10 w-10 items-center justify-center">{left}</View>
      <Text variant="subtitle" className="flex-1 text-center">
        {title}
      </Text>
      <View className="h-10 w-10 items-center justify-center">{right}</View>
    </View>
  );
}
