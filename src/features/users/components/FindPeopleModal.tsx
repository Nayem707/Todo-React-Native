import { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { CircleAlert, Search, Users, X } from "lucide-react-native";

import {
  KeyboardAvoidingWrapper,
  SheetModal,
} from "../../../components/common";
import {
  Button,
  Divider,
  EmptyState,
  IconButton,
  Input,
  Loader,
  Text,
} from "../../../components/ui";
import { colors, icons } from "../../../constants/theme";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  selectActionError,
  selectActionPendingUserId,
  selectGraphError,
  selectGraphStatus,
  selectIsFindPeopleOpen,
  selectModalPeople,
  selectSearchError,
  selectSearchStatus,
} from "../usersSelectors";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  clearSearch,
  closeFindPeople,
  declineFriendRequest,
  fetchFriendGraph,
  searchDirectory,
  sendFriendRequest,
} from "../usersSlice";
import { MIN_USER_SEARCH_LENGTH } from "../usersTypes";
import { useOpenConversation } from "../../chat/useOpenConversation";
import { PersonRow } from "./PersonRow";

export function FindPeopleModal() {
  const openConversation = useOpenConversation();
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState("");
  const visible = useAppSelector(selectIsFindPeopleOpen);
  const people = useAppSelector((state) => selectModalPeople(state, query));
  const graphStatus = useAppSelector(selectGraphStatus);
  const graphError = useAppSelector(selectGraphError);
  const searchStatus = useAppSelector(selectSearchStatus);
  const searchError = useAppSelector(selectSearchError);
  const actionError = useAppSelector(selectActionError);
  const actionPendingUserId = useAppSelector(selectActionPendingUserId);

  const trimmedQuery = query.trim();
  const isSearching = trimmedQuery.length >= MIN_USER_SEARCH_LENGTH;
  const isListLoading =
    (isSearching &&
      (searchStatus === "loading" || searchStatus === "idle") &&
      people.length === 0) ||
    (!isSearching && graphStatus === "loading" && people.length === 0);
  const listError = isSearching ? searchError : graphError;

  useEffect(() => {
    if (!visible) {
      return;
    }

    void dispatch(fetchFriendGraph());
  }, [dispatch, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (!isSearching) {
      dispatch(clearSearch());
      return;
    }

    const timeout = setTimeout(() => {
      void dispatch(searchDirectory(trimmedQuery));
    }, 350);

    return () => clearTimeout(timeout);
  }, [dispatch, isSearching, trimmedQuery, visible]);

  const handleClose = () => {
    setQuery("");
    dispatch(closeFindPeople());
  };

  return (
    <SheetModal
      visible={visible}
      onClose={handleClose}
      contentClassName="h-[88%]"
    >
      <KeyboardAvoidingWrapper>
        <View className="flex-row items-center justify-between px-5 pb-2 pt-4">
          <View className="flex-row items-center gap-2">
            <Users
              color={colors.ink}
              size={icons.size.md}
              strokeWidth={icons.stroke}
            />
            <Text variant="title">Find People</Text>
          </View>
          <IconButton
            icon={X}
            accessibilityLabel="Close"
            onPress={handleClose}
          />
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
        {actionError ? (
          <View className="flex-row items-center gap-2 px-5 pb-2">
            <CircleAlert color={colors.danger} size={16} strokeWidth={2} />
            <Text variant="caption" className="flex-1 text-danger">
              {actionError}
            </Text>
          </View>
        ) : null}
        <FlatList
          data={isListLoading ? [] : people}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <Divider />}
          contentContainerClassName="px-5 pb-8 grow"
          ListEmptyComponent={
            <View className="pt-8">
              {isListLoading ? (
                <Loader size="large" />
              ) : listError ? (
                <EmptyState
                  icon={CircleAlert}
                  title="Couldn't load people"
                  subtitle={listError}
                >
                  <View className="mt-4 w-full">
                    <Button
                      label="Try again"
                      onPress={() => {
                        if (isSearching) {
                          void dispatch(searchDirectory(trimmedQuery));
                          return;
                        }

                        void dispatch(fetchFriendGraph());
                      }}
                    />
                  </View>
                </EmptyState>
              ) : isSearching ? (
                <EmptyState
                  icon={Search}
                  title="No people found"
                  subtitle="Try a different name or username."
                />
              ) : (
                <EmptyState
                  icon={Search}
                  title="Search for people"
                  subtitle="Enter at least 2 characters to search by name or username."
                />
              )}
            </View>
          }
          renderItem={({ item }) => (
            <PersonRow
              person={item}
              busy={actionPendingUserId === item.id}
              onAdd={() =>
                void dispatch(sendFriendRequest({ userId: item.id }))
              }
              onCancel={() =>
                void dispatch(
                  cancelFriendRequest({
                    userId: item.id,
                    requestId: item.requestId,
                  }),
                )
              }
              onConfirm={() =>
                void dispatch(
                  acceptFriendRequest({
                    userId: item.id,
                    requestId: item.requestId,
                  }),
                )
              }
              onDecline={() =>
                void dispatch(
                  declineFriendRequest({
                    userId: item.id,
                    requestId: item.requestId,
                  }),
                )
              }
              onMessage={() => {
                void openConversation(item.id).then((opened) => {
                  if (opened) {
                    handleClose();
                  }
                });
              }}
            />
          )}
        />
      </KeyboardAvoidingWrapper>
    </SheetModal>
  );
}
