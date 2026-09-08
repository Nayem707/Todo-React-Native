import { Pressable, type PressableProps } from "react-native";
import type { LucideIcon } from "lucide-react-native";

import { icons } from "../../constants/theme";
import { cn } from "../../utils/cn";
import { Text } from "./Text";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonSize = "sm" | "md";

type ButtonProps = Omit<PressableProps, "children"> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
};

const containerClass: Record<ButtonVariant, string> = {
  primary: "bg-accent",
  secondary: "bg-accentSoft",
  ghost: "bg-transparent",
};

const labelClass: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-sky-700",
  ghost: "text-slate-700",
};

const iconColor: Record<ButtonVariant, string> = {
  primary: "#ffffff",
  secondary: "#0369a1",
  ghost: "#334155",
};

export function Button({
  label,
  variant = "primary",
  size = "md",
  icon: Icon,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isSmall = size === "sm";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={cn(
        "flex-row items-center justify-center gap-2 rounded-2xl",
        isSmall ? "px-3 py-2" : "px-4 py-3",
        containerClass[variant],
        disabled && "opacity-50",
        className,
      )}
      {...props}
    >
      {Icon ? (
        <Icon
          color={iconColor[variant]}
          size={isSmall ? 16 : icons.size.sm}
          strokeWidth={icons.stroke}
        />
      ) : null}
      <Text
        className={cn(
          "font-semibold leading-5",
          isSmall ? "text-xs" : "text-base",
          labelClass[variant],
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
