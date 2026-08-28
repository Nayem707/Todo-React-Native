import { useEffect } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeftIcon, CheckIcon } from "react-native-heroicons/outline";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  TodoFormFields,
  type TodoFormValues,
} from "../components/TodoFormFields";
import { addTodo, updateTodo } from "../store/todosSlice";
import type { RootState } from "../store";

const schema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(80, "Keep the title under 80 characters"),
  description: z
    .string()
    .max(240, "Keep the description under 240 characters")
    .optional(),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z
    .string()
    .regex(/^$|^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format")
    .optional(),
  category: z
    .string()
    .max(30, "Keep the category under 30 characters")
    .optional(),
  completed: z.boolean(),
});

export default function TodoFormScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useLocalSearchParams<{ id?: string }>();
  const todoId = typeof params.id === "string" ? params.id : undefined;
  const existingTodo = useSelector((state: RootState) =>
    state.todos.items.find((todo) => todo.id === todoId),
  );

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<TodoFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
      category: "",
      completed: false,
    },
  });

  useEffect(() => {
    if (!existingTodo) {
      return;
    }

    reset({
      title: existingTodo.title,
      description: existingTodo.description,
      priority: existingTodo.priority,
      dueDate: existingTodo.dueDate,
      category: existingTodo.category,
      completed: existingTodo.completed,
    });
  }, [existingTodo, reset]);

  const onSubmit = handleSubmit((values) => {
    if (existingTodo) {
      dispatch(updateTodo({ id: existingTodo.id, changes: values }));
    } else {
      dispatch(addTodo(values));
    }

    router.back();
  });

  return (
    <View className="flex-1 bg-slate-950 px-4 pt-16">
      <View className="absolute inset-x-0 top-0 h-48 bg-sky-500/20" />
      <View className="mb-5 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center gap-2 rounded-full bg-white/10 px-4 py-3"
        >
          <ArrowLeftIcon color="#fff" size={18} />
          <Text className="text-sm font-semibold text-white">Back</Text>
        </Pressable>

        <Text className="text-sm font-semibold uppercase tracking-[3px] text-sky-300">
          {existingTodo ? "Edit Todo" : "New Todo"}
        </Text>
      </View>

      <View className="flex-1 rounded-[32px] bg-slate-100 px-4 py-5">
        <Text className="text-3xl font-black text-slate-900">
          {existingTodo ? "Update task" : "Create task"}
        </Text>
        <Text className="mt-2 text-base leading-6 text-slate-500">
          Keep the details clear so the todo stays useful later.
        </Text>

        <ScrollView
          className="mt-6 flex-1"
          showsVerticalScrollIndicator={false}
        >
          <TodoFormFields
            control={control}
            errors={errors}
            mode={existingTodo ? "edit" : "create"}
          />

          <Pressable
            onPress={onSubmit}
            className="mt-4 flex-row items-center justify-center gap-3 rounded-full bg-sky-500 px-5 py-4 shadow-glow"
          >
            <CheckIcon color="#fff" size={18} />
            <Text className="text-base font-bold text-white">
              {existingTodo ? "Save changes" : "Add todo"}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}
