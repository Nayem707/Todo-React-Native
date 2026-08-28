import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Todo } from "../store/todosSlice";

const TODO_STORAGE_KEY = "mobile-app.todos.v1";

export async function loadTodosFromStorage(): Promise<Todo[]> {
  const storedValue = await AsyncStorage.getItem(TODO_STORAGE_KEY);

  if (!storedValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(storedValue) as Todo[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTodosToStorage(todos: Todo[]) {
  return AsyncStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
}
