import { useCallback, useEffect, useState, type ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Provider, useDispatch, useSelector } from "react-redux";

import "../global.css";

import { loadTodosFromStorage, saveTodosToStorage } from "../lib/todoStorage";
import { BrandSplash } from "../components/BrandSplash";
import { store } from "../store";
import { loadTodos } from "../store/todosSlice";
import type { RootState } from "../store";

function TodoBootstrap({
  children,
  onReadyChange,
}: {
  children: ReactNode;
  onReadyChange: (isReady: boolean) => void;
}) {
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

  useEffect(() => {
    onReadyChange(isReady);
  }, [isReady, onReadyChange]);

  if (!isReady) {
    return null;
  }

  return children;
}

export default function RootLayout() {
  const [isDataReady, setIsDataReady] = useState(false);
  const [isSplashDone, setIsSplashDone] = useState(false);

  const handleBootstrapReady = useCallback((isReady: boolean) => {
    setIsDataReady(isReady);
  }, []);

  useEffect(() => {
    // Keep splash visible for 5 seconds
    const timer = setTimeout(() => {
      setIsSplashDone(true);
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Splash stays until:
  // 1. Todo data is loaded
  // 2. 5 seconds have passed
  const shouldShowSplash = !isDataReady || !isSplashDone;

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          {/* Main app content */}
          <TodoBootstrap onReadyChange={handleBootstrapReady}>
            <StatusBar style="light" />

            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: "#F8FAFC",
                },
              }}
            >
              <Stack.Screen name="index" />

              <Stack.Screen
                name="todo-form"
                options={{ presentation: "modal" }}
              />
            </Stack>
          </TodoBootstrap>

          {/* Splash overlay */}
          {shouldShowSplash && <BrandSplash onFinish={() => {}} />}
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </Provider>
  );
}
