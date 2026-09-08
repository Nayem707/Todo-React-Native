import { useState } from "react";
import { FlatList, View } from "react-native";
import { useRouter } from "expo-router";
import { Search, Users, X } from "lucide-react-native";

import {
  KeyboardAvoidingWrapper,
  SheetModal,
} from "../../../components/common";
import {
  Divider,
  EmptyState,
  IconButton,
  Input,
  Text,
} from "../../../components/ui";
import { colors, icons } from "../../../constants/theme";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  selectFilteredPeople,
  selectIsFindPeopleOpen,
} from "../usersSelectors";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  closeFindPeople,
  declineFriendRequest,
  sendFriendRequest,
} from "../usersSlice";
import { PersonRow } from "./PersonRow";

export function FindPeopleModal() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState("");
  const visible = useAppSelector(selectIsFindPeopleOpen);
  const people = useAppSelector((state) => selectFilteredPeople(state, query));

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
        <FlatList
          data={people}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <Divider />}
          contentContainerClassName="px-5 pb-8 grow"
          ListEmptyComponent={
            <View className="pt-8">
              <EmptyState
                icon={Search}
                title="No people found"
                subtitle="Try a different name or username."
              />
            </View>
          }
          renderItem={({ item }) => (
            <PersonRow
              person={item}
              onAdd={() => dispatch(sendFriendRequest(item.id))}
              onCancel={() => dispatch(cancelFriendRequest(item.id))}
              onConfirm={() => dispatch(acceptFriendRequest(item.id))}
              onDecline={() => dispatch(declineFriendRequest(item.id))}
              onMessage={() => {
                handleClose();
                router.push({
                  pathname: "/chat/[id]",
                  params: { id: item.id },
                });
              }}
            />
          )}
        />
      </KeyboardAvoidingWrapper>
    </SheetModal>
  );
}
