import type { Todo, TodoPriority } from "../store/todosSlice";

export const priorityOrder: TodoPriority[] = ["high", "medium", "low"];

export const defaultCategories = [
  "Work",
  "Study",
  "Personal",
  "Shopping",
  "Other",
];

export function formatDate(value: string) {
  if (!value) {
    return "No due date";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

export function getPriorityLabel(priority: TodoPriority) {
  return priority[0].toUpperCase() + priority.slice(1);
}

export function getPriorityTone(priority: TodoPriority) {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700";
    case "medium":
      return "bg-amber-100 text-amber-700";
    case "low":
      return "bg-emerald-100 text-emerald-700";
  }
}

export function filterTodos(
  todos: Todo[],
  query: string,
  filter: string,
  sort: string,
) {
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = todos.filter((todo) => {
    const matchesSearch =
      !normalizedQuery ||
      [todo.title, todo.description, todo.category].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      );

    const matchesFilter =
      filter === "all" ||
      (filter === "active" && !todo.completed) ||
      (filter === "completed" && todo.completed) ||
      filter === todo.priority;

    return matchesSearch && matchesFilter;
  });

  return filtered.sort((left, right) => {
    if (sort === "priority") {
      return (
        priorityOrder.indexOf(left.priority) -
        priorityOrder.indexOf(right.priority)
      );
    }

    const leftTime = new Date(left.createdAt).getTime();
    const rightTime = new Date(right.createdAt).getTime();
    const leftDue = left.dueDate
      ? new Date(left.dueDate).getTime()
      : Number.POSITIVE_INFINITY;
    const rightDue = right.dueDate
      ? new Date(right.dueDate).getTime()
      : Number.POSITIVE_INFINITY;
    const safeLeftDue = Number.isNaN(leftDue)
      ? Number.POSITIVE_INFINITY
      : leftDue;
    const safeRightDue = Number.isNaN(rightDue)
      ? Number.POSITIVE_INFINITY
      : rightDue;

    if (sort === "oldest") {
      return leftTime - rightTime;
    }

    if (sort === "dueDate") {
      return safeLeftDue - safeRightDue;
    }

    return rightTime - leftTime;
  });
}
