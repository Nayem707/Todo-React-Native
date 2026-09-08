import { Pressable, type PressableProps } from "react-native";

import { cn } from "../../utils/cn";

type IconButtonProps = PressableProps & {
  accessibilityLabel: string;
};

export function IconButton({
  accessibilityLabel,
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={cn(
        "h-10 w-10 items-center justify-center rounded-full",
        className,
      )}
      {...props}
    >
      {children}
    </Pressable>
  );
}
