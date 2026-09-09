import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Inbox, Search, Users } from "lucide-react-native";

import { Screen } from "../../../components/common";
import { Input, Text } from "../../../components/ui";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { PeopleTabs, type PeopleTab } from "../components/PeopleTabs";
import { PersonList } from "../components/PersonList";
import {
  selectActionError,
  selectActionPendingUserId,
  selectFriends,
  selectGraphError,
  selectGraphStatus,
  selectIncomingCount,
  selectIncomingPeople,
  selectSearchError,
  selectSearchPeople,
  selectSearchStatus,
} from "../usersSelectors";
import { clearSearch, fetchFriendGraph, searchDirectory } from "../usersSlice";
import { MIN_USER_SEARCH_LENGTH } from "../usersTypes";

export function PeopleScreen() {
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<PeopleTab>("friends");

  const friends = useAppSelector(selectFriends);
  const incoming = useAppSelector(selectIncomingPeople);
  const incomingCount = useAppSelector(selectIncomingCount);
  const searchPeople = useAppSelector(selectSearchPeople);
  const graphStatus = useAppSelector(selectGraphStatus);
  const graphError = useAppSelector(selectGraphError);
  const searchStatus = useAppSelector(selectSearchStatus);
  const searchError = useAppSelector(selectSearchError);
  const actionError = useAppSelector(selectActionError);
  const actionPendingUserId = useAppSelector(selectActionPendingUserId);

  const trimmedQuery = query.trim();
  const isSearching = trimmedQuery.length >= MIN_USER_SEARCH_LENGTH;
  const tabPeople = activeTab === "friends" ? friends : incoming;
  const people = isSearching ? searchPeople : tabPeople;

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

  const emptyCopy = isSearching
    ? {
        icon: Search,
        title: "No people found",
        subtitle: "Try a different name or username.",
      }
    : activeTab === "friends"
      ? {
          icon: Users,
          title: "No friends yet",
          subtitle: "Search above to find people and send a friend request.",
        }
      : {
          icon: Inbox,
          title: "No friend requests",
          subtitle: "When someone sends you a request, it will show up here.",
        };

  return (
    <Screen safe>
      <View className="px-5 pb-2 pt-4">
        <Text variant="title">People</Text>
      </View>
      <PeopleTabs
        active={activeTab}
        requestsCount={incomingCount}
        onChange={setActiveTab}
      />
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
        emptyIcon={emptyCopy.icon}
        emptyTitle={emptyCopy.title}
        emptySubtitle={emptyCopy.subtitle}
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
