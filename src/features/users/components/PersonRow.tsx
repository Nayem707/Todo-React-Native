import { View } from "react-native";

import { Avatar, Text } from "../../../components/ui";
import type { Person } from "../usersTypes";
import { FriendRequestActions } from "./FriendRequestActions";

type PersonRowProps = {
  person: Person;
  onAdd: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  onDecline: () => void;
  onMessage?: () => void;
};

export function PersonRow({
  person,
  onAdd,
  onCancel,
  onConfirm,
  onDecline,
  onMessage,
}: PersonRowProps) {
  return (
    <View className="flex-row gap-3 py-3">
      <Avatar
        name={person.name}
        uri={person.avatar}
        size={52}
        showStatus
        isOnline={person.isOnline}
      />
      <View className="min-w-0 flex-1">
        <Text variant="subtitle" numberOfLines={1}>
          {person.name}
        </Text>
        <Text variant="caption" numberOfLines={1}>
          @{person.username}
        </Text>
        <Text
          variant="caption"
          className={person.isOnline ? "text-success" : "text-slate-400"}
        >
          {person.isOnline ? "Online" : "Offline"}
        </Text>
        <View className="mt-2">
          <FriendRequestActions
            status={person.status}
            onAdd={onAdd}
            onCancel={onCancel}
            onConfirm={onConfirm}
            onDecline={onDecline}
            onMessage={onMessage}
          />
        </View>
      </View>
    </View>
  );
}
