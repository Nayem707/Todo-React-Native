import type { ReactNode } from "react";
import { View } from "react-native";
import { MessageCircle, type LucideIcon } from "lucide-react-native";

import { colors, icons } from "../../constants/theme";
import { cn } from "../../utils/cn";
import { Text } from "./Text";

type EmptyStateProps = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  className?: string;
  children?: ReactNode;
};

export function EmptyState({
  title,
  subtitle,
  icon: Icon = MessageCircle,
  className,
  children,
}: EmptyStateProps) {
  return (
    <View
      className={cn(
        "items-center rounded-[28px] border border-dashed border-slate-300 bg-white/80 px-6 py-10",
        className,
      )}
    >
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-sky-50">
        <Icon
          color={colors.accent}
          size={icons.size.lg}
          strokeWidth={icons.stroke}
        />
      </View>
      <Text variant="title" className="text-center">
        {title}
      </Text>
      {subtitle ? (
        <Text variant="muted" className="mt-2 text-center">
          {subtitle}
        </Text>
      ) : null}
      {children}
    </View>
  );
}
