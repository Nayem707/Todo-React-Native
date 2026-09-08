import { View } from "react-native";
import { Check, MessageCircle, UserPlus, X } from "lucide-react-native";

import { Button } from "../../../components/ui";
import type { FriendRequestStatus } from "../usersTypes";

type FriendRequestActionsProps = {
  status: FriendRequestStatus;
  onAdd: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  onDecline: () => void;
  onMessage?: () => void;
};

export function FriendRequestActions({
  status,
  onAdd,
  onCancel,
  onConfirm,
  onDecline,
  onMessage,
}: FriendRequestActionsProps) {
  if (status === "friends") {
    return (
      <View className="flex-row flex-wrap items-center gap-2">
        <Button icon={Check} size="sm" variant="secondary" label="Friends" disabled />
        {onMessage ? (
          <Button
            icon={MessageCircle}
            size="sm"
            variant="ghost"
            label="Message"
            onPress={onMessage}
          />
        ) : null}
      </View>
    );
  }

  if (status === "request_sent") {
    return (
      <View className="flex-row flex-wrap items-center gap-2">
        <Button size="sm" variant="secondary" label="Requested" disabled />
        <Button
          icon={X}
          size="sm"
          variant="ghost"
          label="Cancel"
          onPress={onCancel}
        />
      </View>
    );
  }

  if (status === "request_received") {
    return (
      <View className="flex-row flex-wrap items-center gap-2">
        <Button
          icon={Check}
          size="sm"
          label="Confirm"
          onPress={onConfirm}
        />
        <Button
          icon={X}
          size="sm"
          variant="ghost"
          label="Decline"
          onPress={onDecline}
        />
      </View>
    );
  }

  return (
    <Button icon={UserPlus} size="sm" label="Add Friend" onPress={onAdd} />
  );
}
