import { createSelector } from "@reduxjs/toolkit";

import type { RootState } from "../../store";
import type { Person } from "./usersTypes";

export const selectUsersDirectory = (state: RootState) => state.users.directory;
export const selectRelationships = (state: RootState) =>
  state.users.relationships;
export const selectIsFindPeopleOpen = (state: RootState) =>
  state.users.isFindPeopleOpen;

function matchesQuery(person: Person, query: string) {
  if (!query) {
    return true;
  }

  const needle = query.trim().toLowerCase();
  return (
    person.name.toLowerCase().includes(needle) ||
    person.username.toLowerCase().includes(needle)
  );
}

export const selectPeople = createSelector(
  [selectUsersDirectory, selectRelationships],
  (directory, relationships): Person[] =>
    directory.map((user) => ({
      ...user,
      status: relationships[user.id] ?? "none",
    })),
);

export const selectFriends = createSelector([selectPeople], (people) =>
  people
    .filter((person) => person.status === "friends")
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name)),
);

export const selectFilteredPeople = createSelector(
  [selectPeople, (_state: RootState, query: string) => query],
  (people, query) => people.filter((person) => matchesQuery(person, query)),
);

export function selectPersonById(
  state: RootState,
  userId: string | undefined,
) {
  if (!userId) {
    return undefined;
  }

  return selectPeople(state).find((person) => person.id === userId);
}
