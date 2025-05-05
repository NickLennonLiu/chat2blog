import axios from "axios";
import * as cheerio from "cheerio";
import { ChatMessage } from "./types.js";

// 浏览器 UA，避免 403
const UA =
  "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

export async function share2json(url: string): Promise<ChatMessage[]> {
  const { data: html } = await axios.get(url, {
    headers: { "User-Agent": UA },
  });

  const $ = cheerio.load(html);
  const script = $("script#__NEXT_DATA__").html();
  if (!script) throw new Error("无法找到页面数据脚本");

  const raw = JSON.parse(script).props.pageProps.serverResponse;
  const linear = raw.data.linear_conversation as any[];

  return linear
    .filter((x) => x.message?.content?.parts?.length)
    .map((x, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: x.message.content.parts[0] as string,
    }));
}
