import { Tabs } from "expo-router";
import { Inbox, MessageCircle, Settings, UserPlus } from "lucide-react-native";

import { colors, icons } from "../../../src/constants/theme";
import { selectIncomingCount } from "../../../src/features/users/usersSelectors";
import { useAppSelector } from "../../../src/store/hooks";

export default function TabsLayout() {
  const incomingCount = useAppSelector(selectIncomingCount);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarHideOnKeyboard: true,
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingTop: 6,
          paddingBottom: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          lineHeight: 14,
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E2E8F0",
          borderTopWidth: 1,
          height: 72,
          paddingTop: 6,
          paddingBottom: 10,
          overflow: "visible",
        },
      }}
    >
      <Tabs.Screen
        name="chats"
        options={{
          title: "Chats",
          tabBarIcon: ({ color }) => (
            <MessageCircle
              color={color}
              size={22}
              strokeWidth={icons.stroke}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="people"
        options={{
          title: "People",
          tabBarIcon: ({ color }) => (
            <UserPlus color={color} size={22} strokeWidth={icons.stroke} />
          ),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: "Requests",
          tabBarBadge: incomingCount > 0 ? incomingCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.accent,
            color: "#FFFFFF",
          },
          tabBarIcon: ({ color }) => (
            <Inbox color={color} size={22} strokeWidth={icons.stroke} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Settings color={color} size={22} strokeWidth={icons.stroke} />
          ),
        }}
      />
    </Tabs>
  );
}
