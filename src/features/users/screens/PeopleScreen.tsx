import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Search, Users } from "lucide-react-native";

import { Screen } from "../../../components/common";
import { Input, Text } from "../../../components/ui";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { PersonList } from "../components/PersonList";
import {
  selectActionError,
  selectActionPendingUserId,
  selectFriends,
  selectGraphError,
  selectGraphStatus,
  selectSearchError,
  selectSearchPeople,
  selectSearchStatus,
} from "../usersSelectors";
import { clearSearch, fetchFriendGraph, searchDirectory } from "../usersSlice";
import { MIN_USER_SEARCH_LENGTH } from "../usersTypes";

export function PeopleScreen() {
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState("");
  const friends = useAppSelector(selectFriends);
  const searchPeople = useAppSelector(selectSearchPeople);
  const graphStatus = useAppSelector(selectGraphStatus);
  const graphError = useAppSelector(selectGraphError);
  const searchStatus = useAppSelector(selectSearchStatus);
  const searchError = useAppSelector(selectSearchError);
  const actionError = useAppSelector(selectActionError);
  const actionPendingUserId = useAppSelector(selectActionPendingUserId);

  const trimmedQuery = query.trim();
  const isSearching = trimmedQuery.length >= MIN_USER_SEARCH_LENGTH;
  const people = isSearching ? searchPeople : friends;
  const isListLoading =
    (isSearching &&
      (searchStatus === "loading" || searchStatus === "idle") &&
      people.length === 0) ||
    (!isSearching && graphStatus === "loading" && people.length === 0);
  const listError = isSearching ? searchError : graphError;

  useFocusEffect(
    useCallback(() => {
      void dispatch(fetchFriendGraph());
    }, [dispatch]),
  );

  useEffect(() => {
    if (!isSearching) {
      dispatch(clearSearch());
      return;
    }

    const timeout = setTimeout(() => {
      void dispatch(searchDirectory(trimmedQuery));
    }, 350);

    return () => clearTimeout(timeout);
  }, [dispatch, isSearching, trimmedQuery]);

  return (
    <Screen safe>
      <View className="px-5 pb-2 pt-4">
        <Text variant="title">People</Text>
      </View>
      <View className="px-5 pb-3">
        <Input
          leftIcon={Search}
          value={query}
          onChangeText={setQuery}
          placeholder="Search name or username"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      <PersonList
        people={people}
        isLoading={isListLoading}
        error={listError}
        emptyIcon={isSearching ? Search : Users}
        emptyTitle={isSearching ? "No people found" : "No friends yet"}
        emptySubtitle={
          isSearching
            ? "Try a different name or username."
            : "Enter at least 2 characters to search by name or username."
        }
        actionError={actionError}
        actionPendingUserId={actionPendingUserId}
        onRetry={() => {
          if (isSearching) {
            void dispatch(searchDirectory(trimmedQuery));
            return;
          }

          void dispatch(fetchFriendGraph());
        }}
      />
    </Screen>
  );
}
