import { Pressable, type PressableProps } from "react-native";
import type { LucideIcon } from "lucide-react-native";

import { colors, icons } from "../../constants/theme";
import { cn } from "../../utils/cn";

type IconButtonProps = Omit<PressableProps, "children"> & {
  icon: LucideIcon;
  size?: number;
  color?: string;
  accessibilityLabel: string;
};

export function IconButton({
  icon: Icon,
  size = icons.size.md,
  color = colors.ink,
  accessibilityLabel,
  disabled,
  className,
  ...props
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      className={cn(
        "h-10 w-10 items-center justify-center rounded-full",
        disabled && "opacity-50",
        className,
      )}
      {...props}
    >
      <Icon color={color} size={size} strokeWidth={icons.stroke} />
    </Pressable>
  );
}
