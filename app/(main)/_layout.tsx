import { View } from "react-native";
import { Redirect, Stack } from "expo-router";
import { MoreVertical, Phone, Video } from "lucide-react-native";

import { HeaderBackButton } from "../../src/components/common";
import { IconButton } from "../../src/components/ui";
import { SessionLoader } from "../../src/features/auth/SessionLoader";
import { useAuth } from "../../src/features/auth/useAuth";

export default function MainLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <SessionLoader />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
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
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="chat/[id]"
        options={{
          title: "",
          headerTitleAlign: "left",
          headerStyle: { backgroundColor: "#FFFFFF" },
          headerLeft: () => <HeaderBackButton />,
          headerRight: () => (
            <View className="flex-row items-center">
              <IconButton icon={Video} accessibilityLabel="Video call" />
              <IconButton icon={Phone} accessibilityLabel="Voice call" />
              <IconButton
                icon={MoreVertical}
                accessibilityLabel="More options"
              />
            </View>
          ),
        }}
      />
    </Stack>
  );
}
