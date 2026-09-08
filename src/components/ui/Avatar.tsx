import { Image, View } from "react-native";

import { cn } from "../../utils/cn";
import { Text } from "./Text";

type AvatarProps = {
  name?: string;
  uri?: string;
  size?: number;
  className?: string;
};

function initialsFromName(name?: string) {
  if (!name) {
    return "?";
  }

  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}

export function Avatar({ name, uri, size = 48, className }: AvatarProps) {
  return (
    <View
      className={cn(
        "items-center justify-center overflow-hidden rounded-full bg-accentSoft",
        className,
      )}
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
  );
}
