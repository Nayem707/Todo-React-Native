# Socket.IO Events

> Populated as real-time features ship in Phase 4+.

## Namespaces & rooms

- Default namespace `/` used for all events.
- Room `conversation:<id>` — all authenticated members of a conversation.
- Room `user:<id>` — every socket owned by a user (multi-device).

## Authentication

Sockets authenticate from `handshake.auth.token` (or an `Authorization` header).
The server verifies the access JWT and rejects revoked JTIs; failure →
immediate disconnect with `auth_error`.

## Planned events

Client → Server:

- `join_conversation` `{ conversationId }`
- `leave_conversation` `{ conversationId }`
- `send_message` `{ conversationId, type, content?, replyToId?, tempId }`
- `message_delivered` `{ messageId }`
- `message_read` `{ conversationId, upToMessageId }`
- `typing_start` `{ conversationId }`
- `typing_stop` `{ conversationId }`

Server → Client:

- `new_message` `{ message }`
- `message_edited` `{ message }`
- `message_deleted` `{ messageId, conversationId }`
- `message_status` `{ messageId, status }`
- `user_online` `{ userId }`
- `user_offline` `{ userId, lastSeenAt }`
- `group_created` / `group_updated` / `group_member_added` / `group_member_removed`
- `typing` `{ conversationId, userId, state }`
