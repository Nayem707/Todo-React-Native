import { useCallback } from "react";
import { View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Inbox } from "lucide-react-native";

import { Screen } from "../../../components/common";
import { Text } from "../../../components/ui";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { PersonList } from "../components/PersonList";
import {
  selectActionError,
  selectActionPendingUserId,
  selectGraphError,
  selectGraphStatus,
  selectIncomingPeople,
} from "../usersSelectors";
import { fetchFriendGraph } from "../usersSlice";

export function RequestsScreen() {
  const dispatch = useAppDispatch();
  const people = useAppSelector(selectIncomingPeople);
  const graphStatus = useAppSelector(selectGraphStatus);
  const graphError = useAppSelector(selectGraphError);
  const actionError = useAppSelector(selectActionError);
  const actionPendingUserId = useAppSelector(selectActionPendingUserId);
  const isListLoading = graphStatus === "loading" && people.length === 0;

  useFocusEffect(
    useCallback(() => {
      void dispatch(fetchFriendGraph());
    }, [dispatch]),
  );

  return (
    <Screen safe>
      <View className="px-5 pb-3 pt-4">
        <Text variant="title">Requests</Text>
      </View>
      <PersonList
        people={people}
        isLoading={isListLoading}
        error={graphError}
        emptyIcon={Inbox}
        emptyTitle="No friend requests"
        emptySubtitle="When someone sends you a request, it will show up here."
        actionError={actionError}
        actionPendingUserId={actionPendingUserId}
        onRetry={() => {
          void dispatch(fetchFriendGraph());
        }}
      />
    </Screen>
  );
}
