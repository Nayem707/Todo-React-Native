import { Redirect, Stack } from "expo-router";

import { HeaderBackButton } from "../../src/components/common";
import { SessionLoader } from "../../src/features/auth/SessionLoader";
import { useAuth } from "../../src/features/auth/useAuth";

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <SessionLoader />;
  }

  if (isAuthenticated) {
    return <Redirect href="/chats" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTintColor: "#0f172a",
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: "#F8FAFC" },
      }}
    >
      <Stack.Screen name="login" options={{ title: "Sign in" }} />
      <Stack.Screen
        name="register"
        options={{
          title: "Create account",
          headerLeft: () => <HeaderBackButton />,
        }}
      />
    </Stack>
  );
}
