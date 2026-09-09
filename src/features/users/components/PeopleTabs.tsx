import { Pressable, View } from "react-native";

import { Text } from "../../../components/ui";
import { cn } from "../../../utils/cn";

export type PeopleTab = "friends" | "requests";

type PeopleTabsProps = {
  active: PeopleTab;
  requestsCount?: number;
  onChange: (tab: PeopleTab) => void;
};

export function PeopleTabs({
  active,
  requestsCount = 0,
  onChange,
}: PeopleTabsProps) {
  return (
    <View className="flex-row gap-2 px-5 pb-3">
      <TabButton
        label="Friends"
        selected={active === "friends"}
        onPress={() => onChange("friends")}
      />
      <TabButton
        label="Requests"
        selected={active === "requests"}
        badge={requestsCount > 0 ? requestsCount : undefined}
        onPress={() => onChange("requests")}
      />
    </View>
  );
}

type TabButtonProps = {
  label: string;
  selected: boolean;
  badge?: number;
  onPress: () => void;
};

function TabButton({ label, selected, badge, onPress }: TabButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={cn(
        "flex-row items-center rounded-full border px-4 py-2",
        selected
          ? "border-accent bg-accentSoft"
          : "border-slate-200 bg-white",
      )}
    >
      <Text
        className={cn(
          "text-sm font-semibold",
          selected ? "text-sky-700" : "text-slate-600",
        )}
      >
        {label}
      </Text>
      {badge != null ? (
        <View className="ml-2 min-w-5 items-center rounded-full bg-accent px-1.5 py-0.5">
          <Text className="text-[10px] font-semibold text-white">{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}
