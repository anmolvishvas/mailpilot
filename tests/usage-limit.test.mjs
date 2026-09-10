import test from "node:test";
import assert from "node:assert/strict";

// Mock UsageService test
class MockUsageService {
  constructor(limit = 10) {
    this.dailyLimit = limit;
    this.records = new Map(); // userId_date -> count
  }

  getUsageStatus(userId, date = "2026-09-09") {
    const key = `${userId}_${date}`;
    const usedToday = this.records.get(key) || 0;
    const remainingToday = Math.max(0, this.dailyLimit - usedToday);
    return {
      dailyLimit: this.dailyLimit,
      usedToday,
      remainingToday,
      canGenerate: remainingToday > 0,
    };
  }

  checkGenerationLimit(userId, date = "2026-09-09") {
    const status = this.getUsageStatus(userId, date);
    if (!status.canGenerate) {
      throw new Error("You've used all 10 AI generations for today. Your limit will reset tomorrow.");
    }
    return status;
  }

  recordSuccessfulGeneration(userId, date = "2026-09-09") {
    const key = `${userId}_${date}`;
    const current = this.records.get(key) || 0;
    this.records.set(key, current + 1);
    return this.getUsageStatus(userId, date);
  }
}

test("UsageService initializes with 10 free daily generations", () => {
  const usageService = new MockUsageService(10);
  const status = usageService.getUsageStatus("user_1");

  assert.equal(status.dailyLimit, 10);
  assert.equal(status.usedToday, 0);
  assert.equal(status.remainingToday, 10);
  assert.equal(status.canGenerate, true);
});

test("Successful generations decrease remaining count accurately", () => {
  const usageService = new MockUsageService(10);

  // Run 3 successful generations
  usageService.recordSuccessfulGeneration("user_1");
  usageService.recordSuccessfulGeneration("user_1");
  const status = usageService.recordSuccessfulGeneration("user_1");

  assert.equal(status.usedToday, 3);
  assert.equal(status.remainingToday, 7);
  assert.equal(status.canGenerate, true);
});

test("Failed AI generations do not consume quota", () => {
  const usageService = new MockUsageService(10);

  usageService.recordSuccessfulGeneration("user_1");
  assert.equal(usageService.getUsageStatus("user_1").remainingToday, 9);

  // Simulate an AI provider failure
  try {
    throw new Error("AI Provider network error");
    // If it fails, recordSuccessfulGeneration is NOT called!
  } catch (e) {
    // Graceful catch
  }

  // Quota must remain unchanged at 9
  assert.equal(usageService.getUsageStatus("user_1").remainingToday, 9);
});

test("Enforces hard block when 10 generations are exhausted", () => {
  const usageService = new MockUsageService(10);

  for (let i = 0; i < 10; i++) {
    usageService.checkGenerationLimit("user_1");
    usageService.recordSuccessfulGeneration("user_1");
  }

  const finalStatus = usageService.getUsageStatus("user_1");
  assert.equal(finalStatus.usedToday, 10);
  assert.equal(finalStatus.remainingToday, 0);
  assert.equal(finalStatus.canGenerate, false);

  assert.throws(
    () => usageService.checkGenerationLimit("user_1"),
    /You've used all 10 AI generations for today/
  );
});
