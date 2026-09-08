import { Image, View } from "react-native";

import { cn } from "../../utils/cn";
import { Text } from "./Text";

type AvatarProps = {
  name?: string;
  uri?: string | null;
  size?: number;
  className?: string;
  isOnline?: boolean;
  showStatus?: boolean;
};

function initialsFromName(name?: string) {
  if (!name) {
    return "?";
  }

  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}

export function Avatar({
  name,
  uri,
  size = 48,
  className,
  isOnline = false,
  showStatus = false,
}: AvatarProps) {
  const dotSize = Math.max(10, Math.round(size * 0.28));

  return (
    <View className={cn("relative", className)} style={{ height: size, width: size }}>
      <View
        className="items-center justify-center overflow-hidden rounded-full bg-accentSoft"
        style={{ height: size, width: size }}
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={{ height: size, width: size }}
            accessibilityIgnoresInvertColors
          />
        ) : (
          <Text className="font-bold text-sky-700">
            {initialsFromName(name)}
          </Text>
        )}
      </View>
      {showStatus ? (
        <View
          className={cn(
            "absolute rounded-full border-2 border-white",
            isOnline ? "bg-success" : "bg-slate-300",
          )}
          style={{
            width: dotSize,
            height: dotSize,
            right: 0,
            bottom: 0,
          }}
        />
      ) : null}
    </View>
  );
}
