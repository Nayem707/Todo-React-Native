import { FlatList, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight, MessageCircle, UserPlus } from "lucide-react-native";

import { Screen } from "../../../components/common";
import { Avatar, Button, EmptyState, Text } from "../../../components/ui";
import { colors } from "../../../constants/theme";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { FindPeopleModal } from "../../users/components/FindPeopleModal";
import { selectFriends } from "../../users/usersSelectors";
import { openFindPeople } from "../../users/usersSlice";
import type { Person } from "../../users/usersTypes";

function FriendListItem({ person }: { person: Person }) {
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      className="mb-3 flex-row items-center gap-3 rounded-[24px] border border-slate-200 bg-white px-4 py-3"
      onPress={() =>
        router.push({
          pathname: "/chat/[id]",
          params: { id: person.id },
        })
      }
    >
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
        <Text variant="muted" numberOfLines={1}>
          No messages yet
        </Text>
      </View>
      <ChevronRight color={colors.muted} size={20} strokeWidth={2} />
    </Pressable>
  );
}

export function ChatsScreen() {
  const dispatch = useAppDispatch();
  const friends = useAppSelector(selectFriends);

  return (
    <Screen>
      {friends.length === 0 ? (
        <View className="flex-1 justify-center px-6 py-8">
          <EmptyState
            icon={MessageCircle}
            title="No conversations yet"
            subtitle="Add friends to start chatting. New conversations stay empty until you send a message."
          />
          <View className="mt-6">
            <Button
              icon={UserPlus}
              label="Find People"
              onPress={() => dispatch(openFindPeople())}
            />
          </View>
        </View>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 py-4"
          renderItem={({ item }) => <FriendListItem person={item} />}
        />
      )}
      <FindPeopleModal />
    </Screen>
  );
}
