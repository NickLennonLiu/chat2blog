import { describe, it, expect, vi } from "vitest";
import axios from "axios";
import fs from "node:fs/promises";
import { share2json } from "../src/lib/share2json.js";

// ① mock axios.get，让函数无需真实访问 OpenAI
vi.mock("axios");

describe("share2json", () => {
  it("parses linear_conversation into ChatMessage[]", async () => {
    /** 准备一段离线的 share HTML，夹带 __NEXT_DATA__ */
    const fakeHTML = await fs.readFile(
      new URL("./fixtures/share.html", import.meta.url),
      "utf8"
    );

    (axios.get as any).mockResolvedValue({ data: fakeHTML });

    const list = await share2json("https://chat.openai.com/share/abc");

    expect(list.length).toBeGreaterThan(0);
    expect(list[0]).toEqual({
      role: "user",
      content: expect.stringContaining("你好"),
    });
  });
});
