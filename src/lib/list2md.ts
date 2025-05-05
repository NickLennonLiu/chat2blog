import { ChatMessage } from "./types.js";

const SEP = "\n---\n";

export function list2md(list: ChatMessage[]): string {
  return list
    .map(
      (m) =>
        `role: ${m.role}\ncontent: |\n  ${m.content
          .replace(/\n/g, "\n  ")
          .trimEnd()}`
    )
    .join(SEP);
}
