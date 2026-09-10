import test from "node:test";
import assert from "node:assert/strict";

function canManageMembers(role) {
  return role === "OWNER" || role === "ADMIN";
}

function canManageRoles(role) {
  return role === "OWNER";
}

function canManageSharedTemplates(role) {
  return role === "OWNER" || role === "ADMIN";
}

function canManageVoiceAndTone(role) {
  return role === "OWNER" || role === "ADMIN";
}

function canViewAnalytics(role) {
  return role === "OWNER" || role === "ADMIN";
}

test("Owner has all permissions", () => {
  const role = "OWNER";
  assert.equal(canManageMembers(role), true);
  assert.equal(canManageRoles(role), true);
  assert.equal(canManageSharedTemplates(role), true);
  assert.equal(canManageVoiceAndTone(role), true);
  assert.equal(canViewAnalytics(role), true);
});

test("Admin has management permissions but cannot change roles", () => {
  const role = "ADMIN";
  assert.equal(canManageMembers(role), true);
  assert.equal(canManageRoles(role), false); // Only owner can change roles
  assert.equal(canManageSharedTemplates(role), true);
  assert.equal(canManageVoiceAndTone(role), true);
  assert.equal(canViewAnalytics(role), true);
});

test("Member cannot manage settings, members, or templates", () => {
  const role = "MEMBER";
  assert.equal(canManageMembers(role), false);
  assert.equal(canManageRoles(role), false);
  assert.equal(canManageSharedTemplates(role), false);
  assert.equal(canManageVoiceAndTone(role), false);
  assert.equal(canViewAnalytics(role), false);
});
