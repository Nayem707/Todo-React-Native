export const friendsEndpoints = {
  list: "/friends",
  request: "/friends/request",
  incoming: "/friends/requests/incoming",
  sent: "/friends/requests/sent",
  status: (peerUserId: string) =>
    `/friends/status/${encodeURIComponent(peerUserId)}`,
  accept: (requestId: string) =>
    `/friends/${encodeURIComponent(requestId)}/accept`,
  reject: (requestId: string) =>
    `/friends/${encodeURIComponent(requestId)}/reject`,
  cancel: (requestId: string) => `/friends/${encodeURIComponent(requestId)}`,
} as const;
