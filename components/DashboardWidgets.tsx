import { Text, View } from "react-native";

type StatCardProps = {
  label: string;
  value: string | number;
  accent?: "sky" | "emerald" | "amber" | "slate";
};

const accentStyles = {
  sky: "bg-sky-50 text-sky-700",
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  slate: "bg-slate-100 text-slate-700",
};

export function StatCard({ accent = "slate", label, value }: StatCardProps) {
  return (
    <View
      className={`min-w-[150px] flex-1 rounded-[24px] p-4 ${accentStyles[accent]}`}
    >
      <Text className="text-sm font-medium opacity-80">{label}</Text>
      <Text className="mt-2 text-3xl font-bold">{value}</Text>
    </View>
  );
}

type ProgressBarProps = {
  progress: number;
};

export function ProgressBar({ progress }: ProgressBarProps) {
  const safeProgress = Math.max(0, Math.min(100, progress));

  return (
    <View className="gap-3 rounded-[28px] border border-slate-200 bg-white p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-slate-900">Progress</Text>
        <Text className="text-sm font-semibold text-sky-700">
          {Math.round(safeProgress)}%
        </Text>
      </View>
      <View className="h-3 overflow-hidden rounded-full bg-slate-100">
        <View
          className="h-full rounded-full bg-sky-500"
          style={{ width: `${safeProgress}%` }}
        />
      </View>
    </View>
  );
}
