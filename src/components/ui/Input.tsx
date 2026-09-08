import {
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { cn } from "../../utils/cn";
import { Text } from "./Text";

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function Input({
  label,
  error,
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
      <TextInput
        className={cn(
          "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900",
          error && "border-danger",
          className,
        )}
        placeholderTextColor="#94a3b8"
        {...props}
      />
      {error ? (
        <Text variant="caption" className="mt-1 text-danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
