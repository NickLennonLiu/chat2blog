import { list2md } from "../src/lib/list2md.js";
import { describe, it, expect } from "vitest";

describe("list2md", () => {
  it("converts messages to markdown separated by ---", () => {
    const md = list2md([
      { role: "user",       content: "hi" },
      { role: "assistant",  content: "hello" },
    ]);

    expect(md).toMatchInlineSnapshot(`
      "role: user
      content: |
        hi
      ---
      role: assistant
      content: |
        hello"
    `);
  });
});
