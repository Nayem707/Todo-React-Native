import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import { cn } from "../../utils/cn";

type TextVariant = "title" | "subtitle" | "body" | "muted" | "caption";

type TextProps = RNTextProps & {
  variant?: TextVariant;
};

const variantClass: Record<TextVariant, string> = {
  title: "text-xl font-bold text-slate-900",
  subtitle: "text-base font-semibold text-slate-900",
  body: "text-sm leading-6 text-slate-700",
  muted: "text-sm leading-6 text-slate-500",
  caption: "text-xs text-slate-400",
};

export function Text({
  variant = "body",
  className,
  ...props
}: TextProps) {
  return <RNText className={cn(variantClass[variant], className)} {...props} />;
}
