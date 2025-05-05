/* global hexo */
const { md2html } = require("../dist/lib/md2html"); // 构建后路径
const fs = require("fs");
const path = require("path");

// 渲染 {% chat path/to/file.md %} 自定义标签
hexo.extend.tag.register(
  "chat",
  function (args) {
    const file = args[0];
    const src = fs.readFileSync(path.join(hexo.source_dir, file), "utf-8");
    return md2html(src);
  },
  { async: false, ends: false }
);

// 在 <head> 注入默认样式，用户可覆盖 themes/<name>/source/css/chat-override.css
hexo.extend.filter.register("after_render:html", function (html) {
  const link = '<link rel="stylesheet" href="/css/chatgpt-dialog.css">';
  return html.replace("</head>", `${link}\n</head>`);
});
