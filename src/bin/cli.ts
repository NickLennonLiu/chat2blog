#!/usr/bin/env node
import { program } from "commander";
import { chat2json } from "../lib/chat2json.js";
import { list2md } from "../lib/list2md.js";
import fs from "fs";

program
  .command("chat2json <convUrl> <outFile>")
  .description("conversation 链接 → messages.json")
  .option("-t, --token <token>", "OpenAI Bearer token")
  .action(async (convUrl, outFile, opts) => {
    const list = await chat2json(convUrl, opts.token);
    await fs.writeFile(outFile, JSON.stringify(list, null, 2), err => {
      if (err) throw err;
      console.log(`✔ 已写入 ${outFile}`);
    });
  });

program
  .command("json2md <jsonFile> <mdOut>")
  .description("messages.json → markdown")
  .action((jsonFile, mdOut) => {
    const list = JSON.parse(fs.readFileSync(jsonFile, "utf-8"));
    fs.writeFileSync(mdOut, list2md(list));
  });

program.parse();
