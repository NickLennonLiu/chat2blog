// tests/chat2json.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { chat2json } from "../src/lib/chat2json.js";

// 全量 mock axios
vi.mock("axios");
const mockedGet = axios.get as unknown as ReturnType<typeof vi.fn>;

const uuid = "abc-123";
const token = "sk-test-token";

const fakeMapping = {
  "id-1": {
    message: {
      author: { role: "user" },
      content: { parts: ["hi"] },
      create_time: 1,
    },
  },
  "id-2": {
    message: {
      author: { role: "assistant" },
      content: { parts: ["hello"] },
      create_time: 2,
    },
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("chat2json", () => {
  it("returns sorted ChatMessage[]", async () => {
    mockedGet.mockResolvedValueOnce({ data: { mapping: fakeMapping } });

    const url = `https://chat.openai.com/backend-api/conversation/${uuid}`;

    const list = await chat2json(uuid, token);

    expect(mockedGet).toHaveBeenCalledWith(url, {
      headers: { Authorization: `Bearer ${token}`, "User-Agent": "Mozilla/5.0" },
    });

    expect(list).toEqual([
      { role: "user", content: "hi" },
      { role: "assistant", content: "hello" },
    ]);
  });

  it("throws on 401 Unauthorized", async () => {
    mockedGet.mockRejectedValueOnce({ response: { status: 401 } });

    const url = `https://chat.openai.com/backend-api/conversation/${uuid}`;

    await expect(chat2json(url, token)).rejects.toThrow("401 Unauthorized");
  });
});