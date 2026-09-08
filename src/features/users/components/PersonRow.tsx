import { View } from "react-native";

import { Avatar, Text } from "../../../components/ui";
import type { FriendRequestStatus, Person } from "../usersTypes";
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

function friendStatusLabel(status: FriendRequestStatus) {
  if (status === "friends") {
    return "Friends";
  }

  if (status === "request_sent") {
    return "Sent";
  }

  if (status === "request_received") {
    return "Incoming";
  }

  return null;
}

export function PersonRow({
  person,
  busy = false,
  onAdd,
  onCancel,
  onConfirm,
  onDecline,
  onMessage,
}: PersonRowProps) {
  const statusLabel = friendStatusLabel(person.status);

  return (
    <View className="flex-row items-center gap-3 py-3">
      <Avatar
        name={person.name}
        uri={person.avatar}
        size={48}
        showStatus
        isOnline={person.isOnline}
      />
      <View className="min-w-0 flex-1">
        <Text variant="subtitle" numberOfLines={1}>
          {person.name}
        </Text>
        {statusLabel ? (
          <Text
            variant="caption"
            numberOfLines={1}
            className={
              person.status === "friends" ? "text-sky-700" : "text-slate-500"
            }
          >
            {statusLabel}
          </Text>
        ) : null}
      </View>
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
  );
}
