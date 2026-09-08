import { FlatList, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { CircleAlert } from "lucide-react-native";

import {
  Button,
  Divider,
  EmptyState,
  Loader,
  Text,
} from "../../../components/ui";
import { colors } from "../../../constants/theme";
import type { Person } from "../usersTypes";
import { usePersonActions } from "../usePersonActions";
import { PersonRow } from "./PersonRow";

type PersonListProps = {
  people: Person[];
  isLoading: boolean;
  error: string | null;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptySubtitle: string;
  actionError?: string | null;
  actionPendingUserId?: string | null;
  onRetry: () => void;
};

export function PersonList({
  people,
  isLoading,
  error,
  emptyIcon,
  emptyTitle,
  emptySubtitle,
  actionError,
  actionPendingUserId,
  onRetry,
}: PersonListProps) {
  const { onAdd, onCancel, onConfirm, onDecline, onMessage } =
    usePersonActions();

  return (
    <View className="flex-1">
      {actionError ? (
        <View className="flex-row items-center gap-2 px-5 pb-2">
          <CircleAlert color={colors.danger} size={16} strokeWidth={2} />
          <Text variant="caption" className="flex-1 text-danger">
            {actionError}
          </Text>
        </View>
      ) : null}
      <FlatList
        data={isLoading ? [] : people}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => <Divider />}
        contentContainerClassName="px-5 pb-8 grow"
        ListEmptyComponent={
          <View className="pt-8">
            {isLoading ? (
              <Loader size="large" />
            ) : error ? (
              <EmptyState
                icon={CircleAlert}
                title="Couldn't load people"
                subtitle={error}
              >
                <View className="mt-4 w-full">
                  <Button label="Try again" onPress={onRetry} />
                </View>
              </EmptyState>
            ) : (
              <EmptyState
                icon={emptyIcon}
                title={emptyTitle}
                subtitle={emptySubtitle}
              />
            )}
          </View>
        }
        renderItem={({ item }) => (
          <PersonRow
            person={item}
            busy={actionPendingUserId === item.id}
            onAdd={() => onAdd(item.id)}
            onCancel={() => onCancel(item.id, item.requestId)}
            onConfirm={() => onConfirm(item.id, item.requestId)}
            onDecline={() => onDecline(item.id, item.requestId)}
            onMessage={() => onMessage(item.id)}
          />
        )}
      />
    </View>
  );
}
