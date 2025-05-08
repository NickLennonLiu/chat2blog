/* global hexo */
const { md2htmltag } = require("../dist/lib/md2html"); // 构建后路径

// 渲染 {% chat path/to/file.md %} 自定义标签
hexo.extend.tag.register(
  "chat",
  function (args, content) {
    const md = hexo.render.renderSync({ text: content, engine: 'markdown'});
    return `${md2htmltag(args)}\n${md}\n</div>`;
  },
  { ends: true }
);