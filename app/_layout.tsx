import { useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Provider, useDispatch, useSelector } from "react-redux";

import "../global.css";

import { loadTodosFromStorage, saveTodosToStorage } from "../lib/todoStorage";
import { store } from "../store";
import { loadTodos } from "../store/todosSlice";
import type { RootState } from "../store";

function TodoBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const todos = useSelector((state: RootState) => state.todos.items);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;

    loadTodosFromStorage()
      .then((storedTodos) => {
        if (!active) {
          return;
        }

        dispatch(loadTodos(storedTodos));
      })
      .finally(() => {
        if (active) {
          setIsReady(true);
        }
      });

    return () => {
      active = false;
    };
  }, [dispatch]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    void saveTodosToStorage(todos);
  }, [isReady, todos]);

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-950 px-6">
        <View className="items-center rounded-[32px] bg-white/10 px-8 py-10">
          <Text className="text-lg font-semibold text-white">
            Loading todos
          </Text>
          <ActivityIndicator className="mt-4" color="#7dd3fc" />
        </View>
      </View>
    );
  }

  return children;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <TodoBootstrap>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#F8FAFC" },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen
                name="todo-form"
                options={{ presentation: "modal" }}
              />
            </Stack>
          </TodoBootstrap>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </Provider>
  );
}
