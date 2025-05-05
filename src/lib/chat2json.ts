import fs from "fs";
import axios, { AxiosError } from "axios";
import { ChatMessage } from "./types.js";

/**
 * 解析共享 / conversation 链接并返回消息列表
 * @param uuid conversation UUID
 * @param token Bearer token；若为空则自动读取 process.env.OPENAI_ACCESS_TOKEN
 */
export async function chat2json(
  uuid: string,
  token?: string
): Promise<ChatMessage[]> {

  const accessToken = token || process.env.OPENAI_ACCESS_TOKEN;
  if (!accessToken)
    throw new Error(
      "缺少 Authorization。请传入 token 参数或设置环境变量 OPENAI_ACCESS_TOKEN"
    );

  const endpoint = `https://chatgpt.com/backend-api/conversation/${uuid}`;

  const authorization = `Bearer ${accessToken}`;
  // console.log(authorization);

  try {
    const { data } = await axios.get(endpoint, {
      headers: {
        // Authorization: authorization,
        Authorization: "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjE5MzQ0ZTY1LWJiYzktNDRkMS1hOWQwLWY5NTdiMDc5YmQwZSIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MSJdLCJhenAiOiJUZEpJY2JlMTZXb1RIdE45NW55eXdoNUU0eU9vNkl0RyIsImNsaWVudF9pZCI6ImFwcF9YOHpZNnZXMnBROXRSM2RFN25LMWpMNWdIIiwiZXhwIjoxNzQ3Mjg3MzcyLCJodHRwczovL2FwaS5vcGVuYWkuY29tL2F1dGgiOnsicG9pZCI6Im9yZy05TGpLN1lFMUVDQlF0MlFNd3FrR3h4VUkiLCJ1c2VyX2lkIjoidXNlci1tNFpxYllTczNoTXFORFBMRjJZZkdpazUifSwiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS9wcm9maWxlIjp7ImVtYWlsIjoianVuZXRoZXJpdmVyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlfSwiaWF0IjoxNzQ2NDIzMzcyLCJpc3MiOiJodHRwczovL2F1dGgub3BlbmFpLmNvbSIsImp0aSI6ImQ2YTkwODBiLTc0ZGUtNGI3MS05YzAyLWYxOGQ0NTc0NjIyNyIsIm5iZiI6MTc0NjQyMzM3MiwicHdkX2F1dGhfdGltZSI6MTczOTc3ODg3ODk5OCwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCBwaG9uZSBlbWFpbF9jb2RlX3ZlcmlmaWNhdGlvbiIsInNjcCI6WyJvcGVuaWQiLCJlbWFpbCIsInByb2ZpbGUiLCJvZmZsaW5lX2FjY2VzcyIsIm1vZGVsLnJlcXVlc3QiLCJtb2RlbC5yZWFkIiwib3JnYW5pemF0aW9uLnJlYWQiLCJvcmdhbml6YXRpb24ud3JpdGUiXSwic2Vzc2lvbl9pZCI6ImF1dGhzZXNzX3JROUtqYk9FY2o2Znlkd1ZhV3l1ckpvMCIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTAzMjE1MDE0MTk1MDA4NTM1OTA4In0.J_04ovgZ70clgNm9utt5Am54DjQ8v2qk-tzFDTvUlGDCUaj-St6NcJi-5Z4SCONNRoi_qxgHVQiqIJ-mYywxecwbh5vHmKITLX0Ju-KdPE3ki6MmINI9sL77xWVqljULluA9YV2gvoyrzjAHp7y4X13mhU_pJJp7jH18Wy933WGydgwg5__enFN6ZwkvljwWWObl9sP64aupP5yV0CygT72J2CMaKb6dLEMlxwqIpsQwzGgT2DYhEpaCaviqiX8P8rXayu67I2DkTa73SFqwatlO9_khyPpSS3rNQ0SrlbEu_toY4oSiE4zpDR4ZZTZ69Sc0ulvwYJ72_GDgpGARPQMVDaIntvOyKa_UH_NbEoGqxjVSOxKs-gJblZkuqpdM5IJLU6TQHv-WPTyFmnzb5q0H9pzI6XifhzSNMj-4358y-KyWWL7fLkqmspsPfHydq89KuzYAMlGYRwh9nao-S6UFZpA66mthEGLrtOxx_B_Z3Z9u47bJDvTzDJOtfKAD8IMTihpMeqvk0hP3nuVCRfYQZGsyvDTx6VY81t1XGlMBiaYdWWVOeHTTpPoqiAHkJQN-wWEDDpoTauKCIQkeNJAwZBBF8eMDjOGvXtMJb_y8kkyXgBTL67nIB00UMdTP_lKGyWrlBxw_eQQ23NqrAY_04V-MAjkz6Zn9pk6OkG0",
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Referer": `https://chatgpt.com/c/${uuid}`,
        // "Connection": "keep-alive",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
        // "Cookie": "__cf_bm=fx1cNqWP7cF0hqoMyztdeSX6qee8t7NJ5kkR3iDduKI-1746447896-1.0.1.1-pP_s7DdgiIgvoTFIBzds_J2doj9BKi__dmlVc4zCGjKCOupTyK4XgYFjdSSx02AG541x4Cj8a._85Tt_Tq1s9zBVcK_kdYCwmVQ_9YSDHMg; __cflb=0H28vzvP5FJafnkHxiseZX82KGkF3aDnXFsurQH2FiK; _cfuvid=ZYs0E3IQVUqCmzkz5_bG4mA9HmeSBp4f.0qUonsJsJs-1746447008730-0.0.1.1-604800000"
        // "User-Agent": "Mozilla/5.0", // 随意 UA，规避 403
      },
    });

    /** 后端返回 tree 结构；messages 字段里顺序不保证，需按 create_time 排序 */
    const nodes: any[] = Object.values<any>(data.mapping);

    const sorted = nodes
      .filter((n) => n.message?.content?.parts?.length)
      .sort(
        (a, b) =>
          (a.message.create_time as number) - (b.message.create_time as number)
      );

    return sorted.map((n) => ({
      role: n.message.author.role as "user" | "assistant" | "system",
      content: n.message.content.parts[0] as string,
    }));
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