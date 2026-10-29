import { describe, it } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { withTransaction } from "../src/Database/transactionHelper.js";
import { addSSEClient, broadcastToUser } from "../src/services/changeStreamService.js";

describe("Phase 5 Advanced MongoDB Features", () => {
  it("withTransaction executes callback and returns value", async () => {
    const result = await withTransaction(async (session) => {
      // In standalone, session is null; in replica set, session is ClientSession
      return { executed: true, hadSession: Boolean(session) };
    });
    assert.equal(result.executed, true);
  });

  it("Keyset cursor encoding and decoding preserves date and _id", () => {
    const testId = new mongoose.Types.ObjectId();
    const testDate = new Date();

    const cursorStr = Buffer.from(
      JSON.stringify({ date: testDate.toISOString(), _id: testId.toString() })
    ).toString("base64");

    const decoded = JSON.parse(Buffer.from(cursorStr, "base64").toString("utf8"));
    assert.equal(decoded._id, testId.toString());
    assert.equal(new Date(decoded.date).getTime(), testDate.getTime());
  });

  it("SSE client tracking and broadcasting works correctly", () => {
    const mockUserId = new mongoose.Types.ObjectId();
    let writtenData = "";

    const mockRes = {
      write: (chunk) => {
        writtenData += chunk;
      },
      on: (_evt, _cb) => {},
    };

    addSSEClient(mockUserId, mockRes);
    broadcastToUser(mockUserId, "test_event", { hello: "world" });

    assert.ok(writtenData.includes("event: test_event"), "Should output SSE event line");
    assert.ok(writtenData.includes('"hello":"world"'), "Should output JSON data payload");
  });
});

