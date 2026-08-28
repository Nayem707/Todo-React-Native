import { Text, View } from "react-native";
import { InboxArrowDownIcon } from "react-native-heroicons/outline";

type EmptyStateProps = {
  title: string;
  subtitle: string;
};

export function EmptyState({ subtitle, title }: EmptyStateProps) {
  return (
    <View className="items-center rounded-[28px] border border-dashed border-slate-300 bg-white/80 px-6 py-10">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-sky-50">
        <InboxArrowDownIcon color="#0284c7" size={28} />
      </View>
      <Text className="text-center text-xl font-bold text-slate-900">
        {title}
      </Text>
      <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
        {subtitle}
      </Text>
    </View>
  );
}
