import fs from "fs";
import axios, { AxiosError } from "axios";
import { Message } from "./types.js";
import { parseBackendConversation, flattenConversation } from "./chatgptParser.js"


async function auth_session() {
  const url = "https://chat.openai.com/api/auth/session";
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
      },
    });
    return data;
  } catch (e) {
    const err = e as AxiosError;
    if (err.response?.status === 401)
      throw new Error("401 Unauthorized：token 失效或权限不足");
    throw err;
  }
}

/**
 * 解析共享 / conversation 链接并返回消息列表
 * @param uuid conversation UUID
 * @param token Bearer token；若为空则自动读取 process.env.OPENAI_ACCESS_TOKEN
 */
export async function chat2json(
  uuid: string,
  token?: string
): Promise<Message[]> {

  const accessToken = token || process.env.OPENAI_ACCESS_TOKEN;
  if (!accessToken)
    throw new Error(
      "缺少 Authorization。请传入 token 参数或设置环境变量 OPENAI_ACCESS_TOKEN"
    );

  const endpoint = `https://chatgpt.com/backend-api/conversation/${uuid}`;

  const authorization = `Bearer ${accessToken}`;

  try {
    const { data } = await axios.get(endpoint, {
      headers: {
        Authorization: authorization,
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Referer": `https://chatgpt.com/c/${uuid}`,
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
      },
    });

    // 保存data
    fs.writeFileSync("demo.json", JSON.stringify(data, null, 2));


    const conversation = parseBackendConversation(data);
    const messages = flattenConversation(conversation);

    return messages;
    // /** 后端返回 tree 结构；messages 字段里顺序不保证，需按 create_time 排序 */
    // const nodes: any[] = Object.values<any>(data.mapping);

    // const sorted = nodes
    //   .filter((n) => n.message?.content?.parts?.length)
    //   .sort(
    //     (a, b) =>
    //       (a.message.create_time as number) - (b.message.create_time as number)
    //   );

    // return sorted.map((n) => ({
    //   role: n.message.author.role as "user" | "assistant" | "system",
    //   content: n.message.content.parts[0] as string,
    // }));
  } catch (e) {
    const err = e as AxiosError;
    if (err.response?.status === 401)
      throw new Error("401 Unauthorized：token 失效或权限不足");
    if (err.response?.status === 403)
      // save error response
      fs.writeFileSync("error.html", String(err.response.data));
      throw new Error("403 Forbidden");
    throw err;
  }
}