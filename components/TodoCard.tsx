import { Pressable, Text, View } from "react-native";
import {
  CheckIcon,
  PencilSquareIcon,
  TrashIcon,
} from "react-native-heroicons/outline";

import type { Todo } from "../store/todosSlice";
import { formatDate, getPriorityLabel, getPriorityTone } from "./TodoUtils";

type TodoCardProps = {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export function TodoCard({ todo, onDelete, onEdit, onToggle }: TodoCardProps) {
  return (
    <View
      className={`mb-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm ${todo.completed ? "opacity-80" : ""}`}
    >
      <View className="flex-row items-start gap-3">
        <Pressable
          accessibilityRole="button"
          onPress={() => onToggle(todo.id)}
          className={`mt-1 h-7 w-7 items-center justify-center rounded-full border ${todo.completed ? "border-emerald-500 bg-emerald-500" : "border-slate-300 bg-white"}`}
        >
          {todo.completed ? <CheckIcon color="#fff" size={16} /> : null}
        </Pressable>

        <View className="flex-1">
          <View className="flex-row items-start justify-between gap-2">
            <Text
              className={`text-lg font-bold text-slate-900 ${todo.completed ? "line-through text-slate-400" : ""}`}
            >
              {todo.title}
            </Text>
            <View
              className={`rounded-full px-3 py-1 ${getPriorityTone(todo.priority)}`}
            >
              <Text className="text-[11px] font-semibold uppercase tracking-[1.5px]">
                {getPriorityLabel(todo.priority)}
              </Text>
            </View>
          </View>

          {todo.description ? (
            <Text
              className={`mt-2 text-sm leading-5 text-slate-600 ${todo.completed ? "line-through text-slate-400" : ""}`}
            >
              {todo.description}
            </Text>
          ) : null}

          <View className="mt-3 flex-row flex-wrap items-center gap-2">
            {todo.category ? (
              <View className="rounded-full bg-sky-50 px-3 py-1">
                <Text className="text-xs font-semibold text-sky-700">
                  {todo.category}
                </Text>
              </View>
            ) : null}
            <View className="rounded-full bg-slate-100 px-3 py-1">
              <Text className="text-xs font-medium text-slate-600">
                {formatDate(todo.dueDate)}
              </Text>
            </View>
            <View
              className={`rounded-full px-3 py-1 ${todo.completed ? "bg-emerald-50" : "bg-amber-50"}`}
            >
              <Text
                className={`text-xs font-semibold ${todo.completed ? "text-emerald-700" : "text-amber-700"}`}
              >
                {todo.completed ? "Completed" : "Pending"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="mt-4 flex-row justify-end gap-2">
        <Pressable
          onPress={() => onEdit(todo.id)}
          className="flex-row items-center gap-2 rounded-full bg-slate-100 px-4 py-2"
        >
          <PencilSquareIcon color="#0f172a" size={16} />
          <Text className="text-sm font-semibold text-slate-700">Edit</Text>
        </Pressable>
        <Pressable
          onPress={() => onDelete(todo.id)}
          className="flex-row items-center gap-2 rounded-full bg-red-50 px-4 py-2"
        >
          <TrashIcon color="#dc2626" size={16} />
          <Text className="text-sm font-semibold text-red-600">Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}
