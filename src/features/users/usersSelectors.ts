import { createSelector } from "@reduxjs/toolkit";

import type { RootState } from "../../store";
import { toPerson } from "./relationship";
import { MIN_USER_SEARCH_LENGTH, type Person } from "./usersTypes";

export const selectUsersState = (state: RootState) => state.users;
export const selectIsFindPeopleOpen = (state: RootState) =>
  state.users.isFindPeopleOpen;
export const selectGraphStatus = (state: RootState) => state.users.graphStatus;
export const selectGraphError = (state: RootState) => state.users.graphError;
export const selectSearchStatus = (state: RootState) => state.users.searchStatus;
export const selectSearchError = (state: RootState) => state.users.searchError;
export const selectIsRefreshing = (state: RootState) => state.users.isRefreshing;
export const selectActionPendingUserId = (state: RootState) =>
  state.users.actionPendingUserId;
export const selectActionError = (state: RootState) => state.users.actionError;

function peopleFromIds(
  ids: string[],
  entities: RootState["users"]["entities"],
  statuses: RootState["users"]["statuses"],
): Person[] {
  return ids
    .map((id) => {
      const user = entities[id];
      return user ? toPerson(user, statuses[id]) : null;
    })
    .filter((person): person is Person => person !== null);
}

export const selectFriends = createSelector(
  [selectUsersState],
  (users): Person[] =>
    peopleFromIds(users.friendIds, users.entities, users.statuses)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name)),
);

export const selectIncomingPeople = createSelector(
  [selectUsersState],
  (users): Person[] =>
    users.incoming
      .map((request) => {
        if (!request.peer) {
          return null;
        }

        return toPerson(request.peer, {
          status: request.status,
          requestId: request.requestId,
          isRequester: false,
        });
      })
      .filter((person): person is Person => person !== null),
);

export const selectSearchPeople = createSelector(
  [selectUsersState],
  (users): Person[] =>
    peopleFromIds(users.searchIds, users.entities, users.statuses),
);

export const selectModalPeople = createSelector(
  [
    selectIncomingPeople,
    selectFriends,
    selectSearchPeople,
    (_state: RootState, query: string) => query.trim(),
  ],
  (incoming, friends, searchPeople, query): Person[] => {
    if (query.length >= MIN_USER_SEARCH_LENGTH) {
      return searchPeople;
    }

    const incomingIds = new Set(incoming.map((person) => person.id));
    return [
      ...incoming,
      ...friends.filter((person) => !incomingIds.has(person.id)),
    ];
  },
);

export function selectPersonById(
  state: RootState,
  userId: string | undefined,
) {
  if (!userId) {
    return undefined;
  }

  const user = state.users.entities[userId];

  if (!user) {
    return undefined;
  }

  return toPerson(user, state.users.statuses[userId]);
}
