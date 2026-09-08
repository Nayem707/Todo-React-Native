import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";

import "../global.css";

import { restoreSession } from "../src/store/slices";
import { useAppDispatch } from "../src/store/hooks";
import { store } from "../src/store";

function SessionBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(restoreSession());
  }, [dispatch]);

  return null;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="dark" />
          <SessionBootstrap />
          <Stack
            screenOptions={{
              headerShadowVisible: false,
              headerTintColor: "#0f172a",
              headerTitleStyle: { fontWeight: "700" },
              contentStyle: { backgroundColor: "#F8FAFC" },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(main)" options={{ headerShown: false }} />
          </Stack>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </Provider>
  );
}
