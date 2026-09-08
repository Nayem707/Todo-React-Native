import { useCallback, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";

import "../global.css";

import { BrandSplash } from "../components/BrandSplash";
import { store } from "../store";

export default function RootLayout() {
  const [isSplashDone, setIsSplashDone] = useState(false);
  const handleSplashFinish = useCallback(() => {
    setIsSplashDone(true);
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShadowVisible: false,
              headerTintColor: "#0f172a",
              headerTitleStyle: { fontWeight: "700" },
              contentStyle: { backgroundColor: "#F8FAFC" },
            }}
          >
            <Stack.Screen name="index" options={{ title: "Chats" }} />
            <Stack.Screen name="chat/[id]" options={{ title: "Chat" }} />
          </Stack>
          {!isSplashDone ? <BrandSplash onFinish={handleSplashFinish} /> : null}
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </Provider>
  );
}
