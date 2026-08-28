import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";

export type TodoPriority = "low" | "medium" | "high";

export type Todo = {
  id: string;
  title: string;
  description: string;
  priority: TodoPriority;
  dueDate: string;
  category: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

type TodosState = {
  items: Todo[];
};

type TodoFormValue = {
  title: string;
  description?: string;
  priority: TodoPriority;
  dueDate?: string;
  category?: string;
  completed: boolean;
};

const initialState: TodosState = {
  items: [],
};

const upsertTimestamps = (todo: Todo, createdAt = todo.createdAt) => ({
  ...todo,
  createdAt,
  updatedAt: new Date().toISOString(),
});

const todosSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    loadTodos(state, action: PayloadAction<Todo[]>) {
      state.items = action.payload;
    },
    addTodo: {
      reducer(state, action: PayloadAction<Todo>) {
        state.items.unshift(action.payload);
      },
      prepare(todo: TodoFormValue) {
        const now = new Date().toISOString();

        return {
          payload: {
            id: nanoid(),
            ...todo,
            description: todo.description?.trim() ?? "",
            category: todo.category?.trim() ?? "",
            dueDate: todo.dueDate?.trim() ?? "",
            createdAt: now,
            updatedAt: now,
          },
        };
      },
    },
    updateTodo(
      state,
      action: PayloadAction<{ id: string; changes: Partial<TodoFormValue> }>,
    ) {
      const todo = state.items.find((entry) => entry.id === action.payload.id);

      if (!todo) {
        return;
      }

      const changes = action.payload.changes;

      todo.title = changes.title?.trim() ?? todo.title;
      todo.description = changes.description?.trim() ?? todo.description;
      todo.priority = changes.priority ?? todo.priority;
      todo.dueDate = changes.dueDate?.trim() ?? todo.dueDate;
      todo.category = changes.category?.trim() ?? todo.category;
      todo.completed =
        typeof changes.completed === "boolean"
          ? changes.completed
          : todo.completed;
      todo.updatedAt = new Date().toISOString();
    },
    toggleTodoCompletion(state, action: PayloadAction<string>) {
      const todo = state.items.find((entry) => entry.id === action.payload);

      if (!todo) {
        return;
      }

      todo.completed = !todo.completed;
      todo.updatedAt = new Date().toISOString();
    },
    deleteTodo(state, action: PayloadAction<string>) {
      state.items = state.items.filter((entry) => entry.id !== action.payload);
    },
  },
});

export const {
  addTodo,
  deleteTodo,
  loadTodos,
  toggleTodoCompletion,
  updateTodo,
} = todosSlice.actions;
export default todosSlice.reducer;
