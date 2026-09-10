import test from "node:test";
import assert from "node:assert/strict";

const BASE_URL = "http://localhost:3000";

test("GET / (Landing Page) returns 200 and renders hero", async () => {
  const res = await fetch(`${BASE_URL}/`);
  assert.equal(res.status, 200);
  const text = await res.text();
  assert.match(text, /MailPilot/);
  assert.match(text, /Write better emails/);
  assert.match(text, /100% Free/);
});

test("GET /login returns 200 and renders Sign In form", async () => {
  const res = await fetch(`${BASE_URL}/login`);
  assert.equal(res.status, 200);
  const text = await res.text();
  assert.match(text, /Welcome back/);
  assert.match(text, /1-Click Demo Sign In/);
});

test("GET /register returns 200 and renders Registration form", async () => {
  const res = await fetch(`${BASE_URL}/register`);
  assert.equal(res.status, 200);
  const text = await res.text();
  assert.match(text, /Create your free account/);
  assert.match(text, /100% Free Forever/);
});

test("GET /api/templates returns all pre-seeded built-in templates", async () => {
  const res = await fetch(`${BASE_URL}/api/templates`);
  assert.equal(res.status, 200);
  const templates = await res.json();
  assert.ok(Array.isArray(templates));
  assert.ok(templates.length >= 30, `Expected at least 30 templates, got ${templates.length}`);

  const leaveTemplate = templates.find((t) => t.title === "Leave Request");
  assert.ok(leaveTemplate, "Leave Request template must exist");
  assert.equal(leaveTemplate.category, "WORK");
});

test("GET /api/templates?category=WORK filters accurately", async () => {
  const res = await fetch(`${BASE_URL}/api/templates?category=WORK`);
  assert.equal(res.status, 200);
  const templates = await res.json();
  assert.ok(templates.every((t) => t.category === "WORK"));
});

test("GET /api/templates?category=BUSINESS filters accurately", async () => {
  const res = await fetch(`${BASE_URL}/api/templates?category=BUSINESS`);
  assert.equal(res.status, 200);
  const templates = await res.json();
  assert.ok(templates.every((t) => t.category === "BUSINESS"));
});

test("POST /api/auth/register creates user account", async () => {
  const testEmail = `testuser_${Date.now()}@mailpilot.app`;
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Integration Test User",
      email: testEmail,
      password: "securepassword123",
    }),
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.user.email, testEmail);
});
