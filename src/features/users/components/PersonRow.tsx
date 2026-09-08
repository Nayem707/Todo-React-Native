import { View } from "react-native";

import { Avatar, Text } from "../../../components/ui";
import type { Person } from "../usersTypes";
import { FriendRequestActions } from "./FriendRequestActions";

type PersonRowProps = {
  person: Person;
  busy?: boolean;
  onAdd: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  onDecline: () => void;
  onMessage?: () => void;
};

export function PersonRow({
  person,
  busy = false,
  onAdd,
  onCancel,
  onConfirm,
  onDecline,
  onMessage,
}: PersonRowProps) {
  const subtitle = person.username
    ? `@${person.username}`
    : person.email;

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
        {subtitle ? (
          <Text variant="caption" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
        <Text
          variant="caption"
          className={person.isOnline ? "text-success" : "text-slate-400"}
        >
          {person.isOnline ? "Online" : "Offline"}
        </Text>
        <View className="mt-2">
          <FriendRequestActions
            status={person.status}
            busy={busy}
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
