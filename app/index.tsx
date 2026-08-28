import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from "react-native-heroicons/outline";
import { useDispatch, useSelector } from "react-redux";

import { EmptyState } from "../components/EmptyState";
import { ProgressBar, StatCard } from "../components/DashboardWidgets";
import { TodoCard } from "../components/TodoCard";
import { filterTodos } from "../components/TodoUtils";
import { deleteTodo, toggleTodoCompletion } from "../store/todosSlice";
import type { RootState } from "../store";

const filterOptions = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "high", label: "High Priority" },
  { key: "medium", label: "Medium Priority" },
  { key: "low", label: "Low Priority" },
];

const sortOptions = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "priority", label: "Priority" },
  { key: "dueDate", label: "Due Date" },
];

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const todos = useSelector((state: RootState) => state.todos.items);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((todo) => todo.completed).length;
    const pending = total - completed;

    return {
      total,
      completed,
      pending,
      progress: total === 0 ? 0 : (completed / total) * 100,
    };
  }, [todos]);

  const visibleTodos = useMemo(
    () => filterTodos(todos, query, filter, sort),
    [filter, query, sort, todos],
  );

  const handleDelete = (id: string) => {
    const target = todos.find((todo) => todo.id === id);

    Alert.alert(
      "Delete todo?",
      `Remove ${target?.title ?? "this task"} from your list? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => dispatch(deleteTodo(id)),
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-slate-950">
      <View className="absolute inset-x-0 top-0 h-64 bg-sky-500/20" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-32 pt-16"
      >
        <View className="rounded-[36px] bg-slate-900 px-5 py-6 shadow-glow">
          <Text className="text-sm font-semibold uppercase tracking-[4px] text-sky-300">
            Todo Vault
          </Text>
          <Text className="mt-2 text-3xl font-black text-white">
            Keep the day under control.
          </Text>
          <Text className="mt-3 max-w-[85%] text-base leading-6 text-slate-300">
            Track tasks, prioritize work, and keep every todo synced locally
            with a polished mobile dashboard.
          </Text>
        </View>

        <View className="mt-5 flex-row flex-wrap gap-3">
          <StatCard label="Total tasks" value={stats.total} accent="sky" />
          <StatCard
            label="Completed"
            value={stats.completed}
            accent="emerald"
          />
          <StatCard label="Pending" value={stats.pending} accent="amber" />
        </View>

        <View className="mt-5">
          <ProgressBar progress={stats.progress} />
        </View>

        <View className="mt-5 rounded-[28px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <View className="flex-row items-center gap-3">
            <MagnifyingGlassIcon color="#64748b" size={20} />
            <TextInput
              className="flex-1 text-base text-slate-900"
              placeholder="Search title, description, category"
              placeholderTextColor="#94a3b8"
              value={query}
              onChangeText={setQuery}
            />
          </View>
        </View>

        <View className="mt-5 gap-3">
          <View className="flex-row items-center gap-2">
            <AdjustmentsHorizontalIcon color="#0f172a" size={20} />
            <Text className="text-lg font-bold text-slate-900">Filters</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2 pr-4"
          >
            {filterOptions.map((option) => (
              <Pressable
                key={option.key}
                onPress={() => setFilter(option.key)}
                className={`rounded-full px-4 py-2 ${filter === option.key ? "bg-sky-500" : "bg-white"}`}
              >
                <Text
                  className={`text-sm font-semibold ${filter === option.key ? "text-white" : "text-slate-700"}`}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View className="mt-5 gap-3">
          <Text className="text-lg font-bold text-slate-900">Sort by</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2 pr-4"
          >
            {sortOptions.map((option) => (
              <Pressable
                key={option.key}
                onPress={() => setSort(option.key)}
                className={`rounded-full border px-4 py-2 ${sort === option.key ? "border-sky-500 bg-sky-50" : "border-slate-200 bg-white"}`}
              >
                <Text
                  className={`text-sm font-semibold ${sort === option.key ? "text-sky-700" : "text-slate-700"}`}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View className="mt-6">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-xl font-black text-white">Your tasks</Text>
            <Text className="text-sm font-semibold text-slate-300">
              {visibleTodos.length} shown
            </Text>
          </View>

          {visibleTodos.length === 0 ? (
            <EmptyState
              title="No todos here"
              subtitle={
                query || filter !== "all"
                  ? "Change the search or filters to reveal matching tasks."
                  : "Tap the plus button to create your first todo."
              }
            />
          ) : (
            <FlatList
              data={visibleTodos}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TodoCard
                  todo={item}
                  onToggle={(id) => dispatch(toggleTodoCompletion(id))}
                  onEdit={(id) =>
                    router.push({ pathname: "/todo-form", params: { id } })
                  }
                  onDelete={handleDelete}
                />
              )}
            />
          )}
        </View>
      </ScrollView>

      <Pressable
        onPress={() => router.push("/todo-form")}
        className="absolute bottom-8 right-5 flex-row items-center gap-3 rounded-full bg-sky-500 px-5 py-4 shadow-glow"
      >
        <PlusIcon color="#fff" size={20} />
        <Text className="text-base font-bold text-white">Add Todo</Text>
      </Pressable>
    </View>
  );
}
