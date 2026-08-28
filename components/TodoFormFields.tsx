import { Controller, type Control, type FieldErrors } from "react-hook-form";
import {
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import type { TodoPriority } from "../store/todosSlice";
import { defaultCategories, getPriorityTone } from "./TodoUtils";

export type TodoFormValues = {
  title: string;
  description?: string;
  priority: TodoPriority;
  dueDate?: string;
  category?: string;
  completed: boolean;
};

type TodoFormFieldsProps = {
  control: Control<TodoFormValues>;
  errors: FieldErrors<TodoFormValues>;
  mode: "create" | "edit";
};

export function TodoFormFields({ control, errors, mode }: TodoFormFieldsProps) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerClassName="gap-4 pb-10"
    >
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <Text className="mb-2 text-sm font-semibold text-slate-700">
              Title
            </Text>
            <TextInput
              className="rounded-3xl border border-slate-200 bg-white px-4 py-4 text-base text-slate-900"
              placeholder="Prepare product demo"
              placeholderTextColor="#94a3b8"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value ?? ""}
            />
            {errors.title ? (
              <Text className="mt-2 text-sm text-red-600">
                {errors.title.message}
              </Text>
            ) : null}
          </View>
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <Text className="mb-2 text-sm font-semibold text-slate-700">
              Description
            </Text>
            <TextInput
              className="min-h-[120px] rounded-3xl border border-slate-200 bg-white px-4 py-4 text-base text-slate-900"
              placeholder="Add a quick note, context, or checklist"
              placeholderTextColor="#94a3b8"
              multiline
              textAlignVertical="top"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value ?? ""}
            />
            {errors.description ? (
              <Text className="mt-2 text-sm text-red-600">
                {errors.description.message}
              </Text>
            ) : null}
          </View>
        )}
      />

      <View>
        <Text className="mb-2 text-sm font-semibold text-slate-700">
          Priority
        </Text>
        <Controller
          control={control}
          name="priority"
          render={({ field: { onChange, value } }) => (
            <View className="flex-row gap-2">
              {(["low", "medium", "high"] as const).map((priority) => (
                <Pressable
                  key={priority}
                  onPress={() => onChange(priority)}
                  className={`flex-1 rounded-3xl border px-4 py-3 ${value === priority ? "border-sky-500 bg-sky-50" : "border-slate-200 bg-white"}`}
                >
                  <Text
                    className={`text-center text-sm font-semibold capitalize ${getPriorityTone(priority)}`}
                  >
                    {priority}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        />
      </View>

      <View className="flex-row gap-3">
        <Controller
          control={control}
          name="dueDate"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="flex-1">
              <Text className="mb-2 text-sm font-semibold text-slate-700">
                Due date
              </Text>
              <TextInput
                className="rounded-3xl border border-slate-200 bg-white px-4 py-4 text-base text-slate-900"
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94a3b8"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value ?? ""}
              />
              {errors.dueDate ? (
                <Text className="mt-2 text-sm text-red-600">
                  {errors.dueDate.message}
                </Text>
              ) : null}
            </View>
          )}
        />

        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="flex-1">
              <Text className="mb-2 text-sm font-semibold text-slate-700">
                Category
              </Text>
              <TextInput
                className="rounded-3xl border border-slate-200 bg-white px-4 py-4 text-base text-slate-900"
                placeholder="Work"
                placeholderTextColor="#94a3b8"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value ?? ""}
              />
            </View>
          )}
        />
      </View>

      <View>
        <Text className="mb-2 text-sm font-semibold text-slate-700">
          Quick categories
        </Text>
        <View className="flex-row flex-wrap gap-2">
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <>
                {defaultCategories.map((category) => (
                  <Pressable
                    key={category}
                    onPress={() => onChange(category)}
                    className={`rounded-full px-4 py-2 ${value === category ? "bg-sky-500" : "bg-slate-100"}`}
                  >
                    <Text
                      className={`text-sm font-semibold ${value === category ? "text-white" : "text-slate-700"}`}
                    >
                      {category}
                    </Text>
                  </Pressable>
                ))}
              </>
            )}
          />
        </View>
      </View>

      <Controller
        control={control}
        name="completed"
        render={({ field: { onChange, value } }) => (
          <View className="flex-row items-center justify-between rounded-3xl border border-slate-200 bg-white px-4 py-4">
            <View>
              <Text className="text-base font-semibold text-slate-900">
                Mark as completed
              </Text>
              <Text className="mt-1 text-sm text-slate-500">
                {mode === "edit"
                  ? "Adjust completion state from here."
                  : "Optional for new todos."}
              </Text>
            </View>
            <Switch value={value} onValueChange={onChange} />
          </View>
        )}
      />
    </ScrollView>
  );
}
