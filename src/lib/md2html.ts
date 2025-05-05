import matter from "gray-matter";
import { ChatMessage } from "./types.js";

export function md2html(src: string): string {
  const blocks = src.split("\n---\n");
  const msgs: ChatMessage[] = blocks.map((b) => {
    const { data } = matter(b, { delimiters: ["", ""] });
    // 这里做类型收窄；若需要更严谨可先判断值是否合法
    return {
      role: data.role as "user" | "assistant",
      content: String(data.content),
    };
  });

  return `
<div class="cg-chat">
  ${msgs
    .map(
      (m) => `
<div class="cg-bubble ${m.role === "user" ? "cg-right" : "cg-left"}">
  <div class="cg-inner">${m.content}</div>
</div>`
    )
    .join("")}
</div>`;
}
