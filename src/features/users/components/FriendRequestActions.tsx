import { View } from "react-native";
import { Check, MessageCircle, UserPlus, X } from "lucide-react-native";

import { Button, IconButton } from "../../../components/ui";
import { colors } from "../../../constants/theme";
import type { FriendRequestStatus } from "../usersTypes";

type FriendRequestActionsProps = {
  status: FriendRequestStatus;
  busy?: boolean;
  onAdd: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  onDecline: () => void;
  onMessage?: () => void;
};

export function FriendRequestActions({
  status,
  busy = false,
  onAdd,
  onCancel,
  onConfirm,
  onDecline,
  onMessage,
}: FriendRequestActionsProps) {
  if (status === "friends") {
    if (!onMessage) {
      return null;
    }

    return (
      <IconButton
        icon={MessageCircle}
        accessibilityLabel="Message"
        color={colors.accent}
        disabled={busy}
        onPress={onMessage}
      />
    );
  }

  if (status === "request_sent") {
    return (
      <Button
        size="sm"
        variant="ghost"
        icon={X}
        label="Cancel"
        disabled={busy}
        onPress={onCancel}
      />
    );
  }

  if (status === "request_received") {
    return (
      <View className="flex-row items-center gap-2">
        <Button
          icon={Check}
          size="sm"
          label="Confirm"
          disabled={busy}
          onPress={onConfirm}
        />
        <Button
          icon={X}
          size="sm"
          variant="ghost"
          label="Decline"
          disabled={busy}
          onPress={onDecline}
        />
      </View>
    );
  }

  return (
    <Button
      icon={UserPlus}
      size="sm"
      label="Add Friend"
      disabled={busy}
      onPress={onAdd}
    />
  );
}
