import test, { after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import request from "supertest";

import { createApp } from "../src/app.js";

after(async () => {
  await mongoose.disconnect();
});

const registerUser = async (app, name, email) => {
  const response = await request(app).post("/api/auth/register").send({
    name,
    email,
    password: "Password123!",
  });
  assert.equal(response.status, 201, response.body.message);
  assert.equal(response.body.success, true);
  assert.ok(response.body.data.accessToken);
  assert.ok(response.body.data.refreshToken);
  return response;
};

const cookieHeader = (response) =>
  response.headers["set-cookie"]?.map((part) => part.split(";")[0]).join("; ");

test("auth, friendship, conversation, messages, group, and authorization", async () => {
  const app = await createApp();
  const unique = Date.now();

  const registerA = await registerUser(
    app,
    "Alice Demo",
    `alice.${unique}@example.com`,
  );
  const registerB = await registerUser(
    app,
    "Bob Demo",
    `bob.${unique}@example.com`,
  );
  const registerC = await registerUser(
    app,
    "Carol Demo",
    `carol.${unique}@example.com`,
  );

  const userAId = registerA.body.data.user.id;
  const userBId = registerB.body.data.user.id;
  const cookieA = cookieHeader(registerA);
  const cookieB = cookieHeader(registerB);
  const cookieC = cookieHeader(registerC);
  const tokenC = registerC.body.data.accessToken;

  const me = await request(app).get("/api/auth/me").set("Cookie", cookieA);
  assert.equal(me.status, 200);
  assert.equal(me.body.data.email, `alice.${unique}@example.com`);

  const blockedConversation = await request(app)
    .post("/api/conversations")
    .set("Cookie", cookieA)
    .send({ userId: userBId, type: "DIRECT" });
  assert.equal(blockedConversation.status, 403);

  const requestAb = await request(app)
    .post("/api/friends/request")
    .set("Cookie", cookieA)
    .send({ recipientId: userBId });
  assert.equal(requestAb.status, 201);
  const requestId = requestAb.body.data.id;

  const accept = await request(app)
    .patch(`/api/friends/${requestId}/accept`)
    .set("Cookie", cookieB);
  assert.equal(accept.status, 200);
  assert.equal(accept.body.data.status, "ACCEPTED");

  const conversation = await request(app)
    .post("/api/conversations")
    .set("Cookie", cookieA)
    .send({ userId: userBId, type: "DIRECT" });
  assert.equal(conversation.status, 201);
  assert.equal(conversation.body.data.type, "DIRECT");
  const conversationId = conversation.body.data.id;

  const hidden = await request(app)
    .get(`/api/conversations/${conversationId}`)
    .set("Authorization", `Bearer ${tokenC}`);
  assert.equal(hidden.status, 404);

  const firstMessage = await request(app)
    .post(`/api/conversations/${conversationId}/messages`)
    .set("Cookie", cookieA)
    .send({ content: "Hello there!" });
  assert.equal(firstMessage.status, 201);
  assert.equal(firstMessage.body.data.senderId, userAId);

  const strangerMessage = await request(app)
    .post(`/api/conversations/${conversationId}/messages`)
    .set("Cookie", cookieC)
    .send({ content: "I should not be here" });
  assert.equal(strangerMessage.status, 404);

  const messages = await request(app)
    .get(`/api/conversations/${conversationId}/messages?page=1&limit=10`)
    .set("Cookie", cookieA);
  assert.equal(messages.status, 200);
  assert.ok(messages.body.data.items.length >= 1);

  const group = await request(app)
    .post("/api/groups")
    .set("Cookie", cookieA)
    .send({
      name: "Demo Crew",
      description: "Test group",
      memberIds: [userBId],
    });
  assert.equal(group.status, 201);
  assert.equal(group.body.data.name, "Demo Crew");
  const groupId = group.body.data.id;

  const groupDetails = await request(app)
    .get(`/api/groups/${groupId}`)
    .set("Cookie", cookieA);
  assert.equal(groupDetails.status, 200);

  const strangerGroup = await request(app)
    .get(`/api/groups/${groupId}`)
    .set("Cookie", cookieC);
  assert.equal(strangerGroup.status, 404);

  const logout = await request(app)
    .post("/api/auth/logout")
    .set("Cookie", cookieA);
  assert.equal(logout.status, 200);

  const afterLogout = await request(app)
    .get("/api/auth/me")
    .set("Cookie", cookieA);
  assert.equal(afterLogout.status, 401);
});

test("message sender ID consistency", async () => {
  const app = await createApp();
  const unique = Date.now() + 2;

  const registerA = await registerUser(
    app,
    "Alice Alignment Test",
    `alice-align.${unique}@example.com`,
  );
  const registerB = await registerUser(
    app,
    "Bob Alignment Test",
    `bob-align.${unique}@example.com`,
  );
  const userAId = registerA.body.data.user.id;
  const cookieA = cookieHeader(registerA);
  const cookieB = cookieHeader(registerB);

  const friendRequest = await request(app)
    .post("/api/friends/request")
    .set("Cookie", cookieA)
    .send({ recipientId: registerB.body.data.user.id });
  assert.equal(friendRequest.status, 201);

  const accept = await request(app)
    .patch(`/api/friends/${friendRequest.body.data.id}/accept`)
    .set("Cookie", cookieB);
  assert.equal(accept.status, 200);

  const conversation = await request(app)
    .post("/api/conversations")
    .set("Cookie", cookieA)
    .send({ userId: registerB.body.data.user.id, type: "DIRECT" });
  assert.equal(conversation.status, 201);

  const sentMessage = await request(app)
    .post(`/api/conversations/${conversation.body.data.id}/messages`)
    .set("Cookie", cookieA)
    .send({ content: "Alignment test message" });
  assert.equal(sentMessage.status, 201);
  assert.equal(sentMessage.body.data.senderId, userAId);

  const messages = await request(app)
    .get(`/api/conversations/${conversation.body.data.id}/messages?page=1&limit=10`)
    .set("Cookie", cookieA);
  const listed = messages.body.data.items.find(
    (item) => item.id === sentMessage.body.data.id,
  );
  assert.ok(listed);
  assert.equal(listed.senderId, userAId);
});

test("refresh rotates tokens and missing group is 404", async () => {
  const app = await createApp();
  const unique = Date.now() + 3;
  const register = await registerUser(
    app,
    "Grace Demo",
    `grace.${unique}@example.com`,
  );
  const cookie = cookieHeader(register);

  const refresh = await request(app)
    .post("/api/auth/refresh")
    .set("Cookie", cookie)
    .send({ refreshToken: register.body.data.refreshToken });
  assert.equal(refresh.status, 200);
  assert.ok(refresh.body.data.accessToken);
  assert.notEqual(
    refresh.body.data.accessToken,
    register.body.data.accessToken,
  );

  const missingGroup = await request(app)
    .get("/api/groups/aaaaaaaaaaaaaaaaaaaaaaaa")
    .set("Cookie", cookieHeader(refresh));
  assert.equal(missingGroup.status, 404);
  assert.equal(missingGroup.body.success, false);
  assert.equal(missingGroup.body.message, "Group not found.");
});
