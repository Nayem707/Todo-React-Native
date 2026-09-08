import { Pressable, type PressableProps } from "react-native";

import { cn } from "../../utils/cn";
import { Text } from "./Text";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = Omit<PressableProps, "children"> & {
  label: string;
  variant?: ButtonVariant;
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

export function Button({
  label,
  variant = "primary",
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={cn(
        "items-center justify-center rounded-2xl px-4 py-3",
        containerClass[variant],
        disabled && "opacity-50",
        className,
      )}
      {...props}
    >
      <Text className={cn("text-base font-semibold", labelClass[variant])}>
        {label}
      </Text>
    </Pressable>
  );
}
