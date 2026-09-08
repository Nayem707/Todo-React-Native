import { View } from "react-native";
import { Bell, LogOut, Settings } from "lucide-react-native";

import { Screen } from "../../../components/common";
import { Avatar, Button, Card, Divider, Text } from "../../../components/ui";
import { colors, icons } from "../../../constants/theme";
import { useAuth } from "../../auth/useAuth";
import { logout } from "../../../store/slices";
import { useAppDispatch } from "../../../store/hooks";

export function ProfileScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  return (
    <Screen safe className="px-6 py-8">
      <Card className="items-center p-6">
        <Avatar name={user?.name} uri={user?.avatar} size={72} />
        <Text variant="title" className="mt-4">
          {user?.name ?? "Guest"}
        </Text>
        {user?.username ? (
          <Text variant="caption" className="mt-1">
            @{user.username}
          </Text>
        ) : null}
        <Text variant="muted" className="mt-1 text-center">
          {user?.email ?? "No session"}
        </Text>
        <Divider className="my-6 w-full" />
        <View className="w-full gap-3">
          <View className="flex-row items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
            <Settings
              color={colors.muted}
              size={icons.size.md}
              strokeWidth={icons.stroke}
            />
            <Text variant="muted">Settings will be added later</Text>
          </View>
          <View className="flex-row items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
            <Bell
              color={colors.muted}
              size={icons.size.md}
              strokeWidth={icons.stroke}
            />
            <Text variant="muted">Notifications will be added later</Text>
          </View>
          <Button
            icon={LogOut}
            variant="secondary"
            label="Sign out"
            onPress={() => {
              void dispatch(logout());
            }}
          />
        </View>
      </Card>
    </Screen>
  );
}
