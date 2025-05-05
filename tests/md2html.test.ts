import { md2html } from "../src/lib/md2html.js";
import { describe, it, expect } from "vitest";

const md = `
role: user
content: |
  hi
---
role: assistant
content: |
  hello
`.trim();

describe("md2html", () => {
  it("renders chat bubbles with correct side", () => {
    const html = md2html(md);

    expect(html).toContain('class="cg-bubble cg-right"'); // user 气泡
    expect(html).toContain('class="cg-bubble cg-left"');  // assistant 气泡
  });
});
