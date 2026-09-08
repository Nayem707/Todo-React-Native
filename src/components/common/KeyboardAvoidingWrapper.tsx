import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";

import { cn } from "../../utils/cn";

type KeyboardAvoidingWrapperProps = {
  children: ReactNode;
  className?: string;
};

export function KeyboardAvoidingWrapper({
  children,
  className,
}: KeyboardAvoidingWrapperProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className={cn("flex-1", className)}
    >
      {children}
    </KeyboardAvoidingView>
  );
}
