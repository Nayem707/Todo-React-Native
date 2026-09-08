import { Redirect, Stack, useRouter } from "expo-router";
import { UserCircleIcon } from "react-native-heroicons/outline";

import { IconButton } from "../../src/components/ui";
import { colors } from "../../src/constants/theme";
import { SessionLoader } from "../../src/features/auth/SessionLoader";
import { useAuth } from "../../src/features/auth/useAuth";

function ProfileHeaderButton() {
  const router = useRouter();

  return (
    <IconButton
      accessibilityLabel="Profile"
      onPress={() => router.push("/profile")}
    >
      <UserCircleIcon color={colors.ink} size={24} />
    </IconButton>
  );
}

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
      <Stack.Screen
        name="chats"
        options={{
          title: "Chats",
          headerRight: () => <ProfileHeaderButton />,
        }}
      />
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
      <Stack.Screen name="chat/[id]" options={{ title: "Chat" }} />
    </Stack>
  );
}
