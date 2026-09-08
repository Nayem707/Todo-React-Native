import type { ReactNode } from "react";
import {
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import type { LucideIcon } from "lucide-react-native";

import { colors, icons } from "../../constants/theme";
import { cn } from "../../utils/cn";
import { Text } from "./Text";

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  leftIcon?: LucideIcon;
  right?: ReactNode;
};

export function Input({
  label,
  error,
  leftIcon: LeftIcon,
  right,
  className,
  ...props
}: InputProps) {
  return (
    <View>
      {label ? (
        <Text variant="caption" className="mb-2 font-semibold text-slate-600">
          {label}
        </Text>
      ) : null}
      <View
        className={cn(
          "flex-row items-center rounded-2xl border border-slate-200 bg-white px-3",
          error && "border-danger",
        )}
      >
        {LeftIcon ? (
          <LeftIcon
            color={colors.muted}
            size={icons.size.sm}
            strokeWidth={icons.stroke}
          />
        ) : null}
        <TextInput
          className={cn(
            "flex-1 px-2 py-3 text-base text-slate-900",
            className,
          )}
          placeholderTextColor="#94a3b8"
          {...props}
        />
        {right}
      </View>
      {error ? (
        <Text variant="caption" className="mt-1 text-danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
