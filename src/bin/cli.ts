#!/usr/bin/env node
import { program } from "commander";
import { share2json } from "../lib/share2json.js";
import { list2md } from "../lib/list2md.js";
import fs from "fs";

program
  .command("share2json <url> <out>")
  .description("共享链接 → messages.json")
  .action(async (url, out) => {
    const list = await share2json(url);
    fs.writeFileSync(out, JSON.stringify(list, null, 2));
  });

program
  .command("json2md <jsonFile> <mdOut>")
  .description("messages.json → markdown")
  .action((jsonFile, mdOut) => {
    const list = JSON.parse(fs.readFileSync(jsonFile, "utf-8"));
    fs.writeFileSync(mdOut, list2md(list));
  });

program.parse();
