import { View } from "react-native";

import { Screen } from "../../../components/common";
import { Avatar, Button, Card, Divider, Text } from "../../../components/ui";
import { useAuth } from "../../auth/useAuth";
import { logout } from "../../../store/slices";
import { useAppDispatch } from "../../../store/hooks";

export function ProfileScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  return (
    <Screen className="px-6 py-8">
      <Card className="items-center p-6">
        <Avatar name={user?.name} size={72} />
        <Text variant="title" className="mt-4">
          {user?.name ?? "Guest"}
        </Text>
        <Text variant="muted" className="mt-1 text-center">
          {user?.email ?? "No session"}
        </Text>
        <Divider className="my-6 w-full" />
        <View className="w-full gap-3">
          <Button
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
