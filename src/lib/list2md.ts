import {
  Message,
  TextContent,
  CodeContent,
  ThoughtsContent, 
  UnknownContent,
} from "./types.js";

/**
 * 把 Message[] 转成 Hexo `{% chat %}` 语法的 Markdown
 */
export function list2md(list: Message[]): string {
  return sortByParentThenTime(cleanMessages(list))
    .map(renderMsg)
    .join("\n\n");
}

/* ----------------- helpers ----------------- */


/* -------------------------------------------------- */
/* 1. 过滤无效消息                                     */
/* -------------------------------------------------- */

export function cleanMessages(list: Message[]): Message[] {
  return list.filter((m) => {
    // (1) 隐藏标记
    if ((m.metadata as any)?.is_visually_hidden_from_conversation) return false;

    // (2) 可渲染的 content_type
    const ct = (m.content as any).content_type;
    if (ct === "text") {
      const parts = (m.content as TextContent).parts ?? [];
      if (parts.every((p) => p.trim() === "")) return false;
    } else if (ct === "code") {
      const text = (m.content as CodeContent).text ?? "";
      if (text.trim() === "") return false;
    } else if (ct === "thoughts") {
      const thoughts = (m.content as ThoughtsContent).thoughts ?? [];
      if (thoughts.every((t) => t.content.trim() === "")) return false;
    } else {
      return false; // 其他类型丢弃
    }

    // (3) 角色限制
    return ["user", "assistant", "tool"].includes(m.author.role);
  });
}

/* -------------------------------------------------- */
/* (Deprecated)                                       */
/* 2. 排序：仅调整有 create_time 的消息顺序             */
/* -------------------------------------------------- */

export function sortByCreateTime(list: Message[]): Message[] {
  // 收集带时间戳的消息及其原始索引
  const timed = list
    .map((m, i) => ({ m, i }))
    .filter(({ m }) => m.create_time !== null);

  // 稳定排序：先按时间戳，再按原次序
  timed.sort((a, b) => {
    const diff = (a.m.create_time! as number) - (b.m.create_time! as number);
    return diff !== 0 ? diff : a.i - b.i;
  });

  // 结果数组 = 原数组拷贝
  const out = list.slice();
  // 依次写回排序后的消息
  timed.forEach(({ i }, k) => {
    out[i] = timed[k].m;
  });
  return out;
}

/**
 * 2. 排序：先保证 parent 在 child 之前，再按时间升序
 * 排序规则：
 *   1) 先保证 parent 在 child 之前（拓扑顺序）
 *   2) 同一个 parent 的多个子节点：
 *        · 若两条都有 create_time → 按时间升序
 *        · 其它情况 → 保留原出现顺序 (stable)
 */
export function sortByParentThenTime(list: Message[]): Message[] {
  // =========== 预处理 ===========
  const pos = new Map<string, number>();                // 记录原位置
  const id2msg = new Map<string, Message>();
  list.forEach((m, i) => {
    if (m.id) pos.set(m.id, i);
    id2msg.set(m.id, m);
  });

  // parent_id 可能放在 metadata 里
  function parentIdOf(m: Message): string | null {
    return ((m as any).metadata?.parent_id as string) ?? null;
  }

  // children 映射表
  const children: Map<string, Message[]> = new Map();
  const roots: Message[] = [];
  for (const m of list) {
    const pid = parentIdOf(m);
    if (pid && id2msg.has(pid)) {
      (children.get(pid) ?? children.set(pid, []).get(pid)!).push(m);
    } else {
      roots.push(m);            // 没 parent ⇒ 视为根
    }
  }

  // 辅助：对子列表做稳定排序
  function sortSiblings(arr: Message[]) {
    arr.sort((a, b) => {
      const at = a.create_time;
      const bt = b.create_time;
      if (at != null && bt != null && at !== bt) return at - bt;
      return pos.get(a.id)! - pos.get(b.id)!;   // 原顺序兜底
    });
  }
  roots.forEach(() => sortSiblings(roots));
  [...children.values()].forEach(sortSiblings);

  // =========== DFS 输出 ===========
  const out: Message[] = [];
  const visit = (m: Message) => {
    out.push(m);
    const kids = children.get(m.id);
    if (kids) kids.forEach(visit);
  };
  roots.forEach(visit);
  return out;
}

function renderMsg(msg: Message): string {
  const p: string[] = [];

  // 必要参数
  p.push(`role:${msg.author.role}`);
  if (msg.id) p.push(`id:${q(msg.id)}`);

  // 可选参数
  if (msg.author.name) p.push(`name:${q(msg.author.name)}`);
  if (msg.create_time !== null) p.push(`ts:${msg.create_time}`);

  const ct = (msg.content as any).content_type;
  if (ct && ct !== "text") p.push(`ct:${ct}`);
  if (ct === "code" && (msg.content as CodeContent).language)
    p.push(`lang:${(msg.content as CodeContent).language}`);

  const head = `{% chat ${p.join(" ")} %}`;
  const body = renderContent(msg.content);
  const tail = "{% endchat %}";
  return [head, body, tail].join("\n");
}

function renderContent(c: Message["content"]): string {
  switch (c.content_type) {
    case "text":
      return (c as TextContent).parts.join("\n");
    case "code": {
      const { language = "", text } = c as CodeContent;
      return "```" + language + "\n" + text + "\n```";
    }
    default: {
      // 其他类型直接 JSON 化包在代码块里
      return (
        "```" +
        c.content_type +
        "\n" +
        JSON.stringify(c as UnknownContent, null, 2) +
        "\n```"
      );
    }
  }
}

/** 参数值含空格或冒号时，加双引号并转义 */
function q(s: string): string {
  return /[\s:]/.test(s) ? `"${s.replace(/"/g, '\\"')}"` : s;
}
