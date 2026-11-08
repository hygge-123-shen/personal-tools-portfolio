installCoursePreview('blog', {
  "posts": [
    {
      "id": 1,
      "title": "从一篇文章开始，理解全栈的完整旅程",
      "category": "开发手记",
      "category_id": 1,
      "tags": [
        "全栈",
        "实践"
      ],
      "content": "# 一次发布，经过了什么？\n\n当我们点击发布，标题和正文会经历一段很短、却完整的旅程。\n\n## 前端：收集与呈现\n\n页面收集输入，通过 API 把请求交给后端，再把结果呈现出来。\n\n## 后端：验证与处理\n\n后端确认身份、检查参数、执行 SQL，把内容写入 MySQL。\n\n```python\n# 示例：查询一篇文章\npost = fetch_one('SELECT * FROM posts WHERE id=%s', (post_id,))\n```\n\n## 数据库：记住这次创作\n\n- **用户表**保存作者信息\n- **文章表**保存标题、正文与作者关系\n- **分类表**让内容更容易被发现\n\n> 完成一个小而完整的流程，比一次堆出很多页面更容易理解系统。\n\n这是一篇演示文章，你可以登录 demo 账号编辑、替换封面或发布自己的内容。",
      "excerpt": " 一次发布，经过了什么？\n\n当我们点击发布，标题和正文会经历一段很短、却完整的旅程。\n\n 前端：收集与呈现\n\n页面收集输入，通过 API 把请求交给后端，再把结果呈现出来。\n\n 后端：验证…",
      "content_html": "<h2>一次发布，经过了什么？</h2><p>当我们点击发布，标题和正文会经历一段很短、却完整的旅程。</p><h2>前端：收集与呈现</h2><p>页面收集输入，通过 API 把请求交给后端，再把结果呈现出来。</p><h2>后端：验证与处理</h2><p>后端确认身份、检查参数、执行 SQL，把内容写入 MySQL。</p><pre><code># 示例：查询一篇文章\npost = fetch_one(&#x27;SELECT * FROM posts WHERE id=%s&#x27;, (post_id,))</code></pre><h2>数据库：记住这次创作</h2><ul><li><strong>用户表</strong>保存作者信息</li><li><strong>文章表</strong>保存标题、正文与作者关系</li><li><strong>分类表</strong>让内容更容易被发现</li></ul><p>&gt; 完成一个小而完整的流程，比一次堆出很多页面更容易理解系统。</p><p>这是一篇演示文章，你可以登录 demo 账号编辑、替换封面或发布自己的内容。</p>",
      "cover": "/assets/cover-journey.svg",
      "author": "demo",
      "author_id": 1,
      "views": 84,
      "created_at": "2026-10-29T15:00:00+08:00",
      "updated_at": "2026-10-29T15:00:00+08:00"
    },
    {
      "id": 2,
      "title": "先画数据关系，再打开编辑器",
      "category": "开发手记",
      "category_id": 1,
      "tags": [
        "MySQL",
        "数据库"
      ],
      "content": "# 从关系开始\n\n一个博客至少需要用户、文章、分类三类数据。\n\n## 先问三个问题\n\n1. 每条记录由谁创建？\n2. 两张表如何关联？\n3. 删除记录时会影响什么？\n\n```sql\nSELECT p.title, u.username\nFROM posts p\nJOIN users u ON u.id = p.author_id;\n```\n\n把字段和关系记在 `database.md`，写接口时就有了清楚的依据。",
      "excerpt": " 从关系开始\n\n一个博客至少需要用户、文章、分类三类数据。\n\n 先问三个问题\n\n1. 每条记录由谁创建？\n2. 两张表如何关联？\n3. 删除记录时会影响什么？\n\nsql\nSELECT p.…",
      "content_html": "<h2>从关系开始</h2><p>一个博客至少需要用户、文章、分类三类数据。</p><h2>先问三个问题</h2><p>1. 每条记录由谁创建？<br>2. 两张表如何关联？<br>3. 删除记录时会影响什么？</p><pre><code>SELECT p.title, u.username\nFROM posts p\nJOIN users u ON u.id = p.author_id;</code></pre><p>把字段和关系记在 <code>database.md</code>，写接口时就有了清楚的依据。</p>",
      "cover": "/assets/cover-data.svg",
      "author": "demo",
      "author_id": 1,
      "views": 77,
      "created_at": "2026-10-28T15:00:00+08:00",
      "updated_at": "2026-10-28T15:00:00+08:00"
    },
    {
      "id": 3,
      "title": "把一个大需求，拆成可以完成的小步骤",
      "category": "学习方法",
      "category_id": 2,
      "tags": [
        "拆解",
        "PRD"
      ],
      "content": "# 让需求更具体\n\n与其只写“做一个博客”，不如把目标拆成可以观察的动作。\n\n- 访客能浏览文章\n- 用户能注册并登录\n- 作者能修改自己的内容\n- 搜索后可以按页查看结果\n\n## 给每一步写验收条件\n\n例如：登录用户提交标题和正文后，刷新页面仍能找到新文章。\n\n> 每次完成一个小流程，再进入下一个。",
      "excerpt": " 让需求更具体\n\n与其只写“做一个博客”，不如把目标拆成可以观察的动作。\n\n- 访客能浏览文章\n- 用户能注册并登录\n- 作者能修改自己的内容\n- 搜索后可以按页查看结果\n\n 给每一步写验…",
      "content_html": "<h2>让需求更具体</h2><p>与其只写“做一个博客”，不如把目标拆成可以观察的动作。</p><ul><li>访客能浏览文章</li><li>用户能注册并登录</li><li>作者能修改自己的内容</li><li>搜索后可以按页查看结果</li></ul><h2>给每一步写验收条件</h2><p>例如：登录用户提交标题和正文后，刷新页面仍能找到新文章。</p><p>&gt; 每次完成一个小流程，再进入下一个。</p>",
      "cover": "/assets/cover-notes.svg",
      "author": "demo",
      "author_id": 1,
      "views": 70,
      "created_at": "2026-10-27T15:00:00+08:00",
      "updated_at": "2026-10-27T15:00:00+08:00"
    },
    {
      "id": 4,
      "title": "Markdown：专注内容的轻量写作方式",
      "category": "工具与效率",
      "category_id": 3,
      "tags": [
        "Markdown",
        "写作"
      ],
      "content": "# 让格式服务内容\n\n用简单符号表达结构，让注意力留在文字上。\n\n## 常用语法\n\n- `#` 表示标题\n- `**内容**` 表示**强调**\n- 三个反引号包围代码块\n\n```javascript\nconst note = '写一点，预览一点';\nconsole.log(note);\n```\n\n纸间的编辑器会在右侧同步呈现这些格式。",
      "excerpt": " 让格式服务内容\n\n用简单符号表达结构，让注意力留在文字上。\n\n 常用语法\n\n-  表示标题\n- 内容 表示强调\n- 三个反引号包围代码块\n\njavascript\nconst note =…",
      "content_html": "<h2>让格式服务内容</h2><p>用简单符号表达结构，让注意力留在文字上。</p><h2>常用语法</h2><ul><li><code>#</code> 表示标题</li><li><code><strong>内容</strong></code> 表示<strong>强调</strong></li><li>三个反引号包围代码块</li></ul><pre><code>const note = &#x27;写一点，预览一点&#x27;;\nconsole.log(note);</code></pre><p>纸间的编辑器会在右侧同步呈现这些格式。</p>",
      "cover": "/assets/cover-journey.svg",
      "author": "demo",
      "author_id": 1,
      "views": 63,
      "created_at": "2026-10-26T15:00:00+08:00",
      "updated_at": "2026-10-26T15:00:00+08:00"
    },
    {
      "id": 5,
      "title": "工作区、暂存区和提交记录",
      "category": "工具与效率",
      "category_id": 3,
      "tags": [
        "Git",
        "版本管理"
      ],
      "content": "# 给每次修改留下记录\n\nGit 可以帮助我们理解一段代码为什么变成现在这样。\n\n## 一次基本提交\n\n```bash\ngit status\ngit add app.py public/\ngit commit -m \"feat: add article editor\"\n```\n\n提交信息描述这次修改的目的，后面回看会更容易。",
      "excerpt": " 给每次修改留下记录\n\nGit 可以帮助我们理解一段代码为什么变成现在这样。\n\n 一次基本提交\n\nbash\ngit status\ngit add app.py public/\ngit co…",
      "content_html": "<h2>给每次修改留下记录</h2><p>Git 可以帮助我们理解一段代码为什么变成现在这样。</p><h2>一次基本提交</h2><pre><code>git status\ngit add app.py public/\ngit commit -m &quot;feat: add article editor&quot;</code></pre><p>提交信息描述这次修改的目的，后面回看会更容易。</p>",
      "cover": "/assets/cover-data.svg",
      "author": "demo",
      "author_id": 1,
      "views": 56,
      "created_at": "2026-10-25T15:00:00+08:00",
      "updated_at": "2026-10-25T15:00:00+08:00"
    },
    {
      "id": 6,
      "title": "API 是前端与后端的约定",
      "category": "开发手记",
      "category_id": 1,
      "tags": [
        "API",
        "HTTP"
      ],
      "content": "# 一份明确的约定\n\n前端需要知道请求发到哪里、提供哪些字段、会收到什么结果。\n\n| 方法 | 地址 | 作用 |\n| --- | --- | --- |\n| GET | /api/posts | 读取文章列表 |\n| POST | /api/posts | 发布文章 |\n| PUT | /api/posts/1 | 修改文章 |\n\n后端还会检查登录状态与作者权限。",
      "excerpt": " 一份明确的约定\n\n前端需要知道请求发到哪里、提供哪些字段、会收到什么结果。\n\n| 方法 | 地址 | 作用 |\n| --- | --- | --- |\n| GET | /api/post…",
      "content_html": "<h2>一份明确的约定</h2><p>前端需要知道请求发到哪里、提供哪些字段、会收到什么结果。</p><p>| 方法 | 地址 | 作用 |<br>| --- | --- | --- |<br>| GET | /api/posts | 读取文章列表 |<br>| POST | /api/posts | 发布文章 |<br>| PUT | /api/posts/1 | 修改文章 |</p><p>后端还会检查登录状态与作者权限。</p>",
      "cover": "/assets/cover-notes.svg",
      "author": "demo",
      "author_id": 1,
      "views": 49,
      "created_at": "2026-10-24T15:00:00+08:00",
      "updated_at": "2026-10-24T15:00:00+08:00"
    },
    {
      "id": 7,
      "title": "为写作留一段安静的时间",
      "category": "日常观察",
      "category_id": 4,
      "tags": [
        "日常",
        "记录"
      ],
      "content": "# 记录小小的进展\n\n写下今天弄懂的一个概念、修好的一个问题、没想明白的一个疑问。\n\n## 不必从长篇开始\n\n- 今天遇到了什么\n- 试过哪些办法\n- 下次会怎么做\n\n日积月累之后，这些片段会成为自己的学习地图。",
      "excerpt": " 记录小小的进展\n\n写下今天弄懂的一个概念、修好的一个问题、没想明白的一个疑问。\n\n 不必从长篇开始\n\n- 今天遇到了什么\n- 试过哪些办法\n- 下次会怎么做\n\n日积月累之后，这些片段会成…",
      "content_html": "<h2>记录小小的进展</h2><p>写下今天弄懂的一个概念、修好的一个问题、没想明白的一个疑问。</p><h2>不必从长篇开始</h2><ul><li>今天遇到了什么</li><li>试过哪些办法</li><li>下次会怎么做</li></ul><p>日积月累之后，这些片段会成为自己的学习地图。</p>",
      "cover": "/assets/cover-journey.svg",
      "author": "demo",
      "author_id": 1,
      "views": 42,
      "created_at": "2026-10-23T15:00:00+08:00",
      "updated_at": "2026-10-23T15:00:00+08:00"
    },
    {
      "id": 8,
      "title": "权限校验要放在服务端",
      "category": "开发手记",
      "category_id": 1,
      "tags": [
        "安全",
        "权限"
      ],
      "content": "# 隐藏按钮还不够\n\n网页只为作者显示编辑按钮，服务端仍需要再次检查文章归属。\n\n```python\nif post['author_id'] != user['id']:\n    raise ApiError(403, '只能编辑自己的文章')\n```\n\n不要相信浏览器传来的作者编号；作者应从登录令牌中取得。",
      "excerpt": " 隐藏按钮还不够\n\n网页只为作者显示编辑按钮，服务端仍需要再次检查文章归属。\n\npython\nif post['author_id'] != user['id']:\n    raise A…",
      "content_html": "<h2>隐藏按钮还不够</h2><p>网页只为作者显示编辑按钮，服务端仍需要再次检查文章归属。</p><pre><code>if post[&#x27;author_id&#x27;] != user[&#x27;id&#x27;]:\n    raise ApiError(403, &#x27;只能编辑自己的文章&#x27;)</code></pre><p>不要相信浏览器传来的作者编号；作者应从登录令牌中取得。</p>",
      "cover": "/assets/cover-data.svg",
      "author": "demo",
      "author_id": 1,
      "views": 35,
      "created_at": "2026-10-22T15:00:00+08:00",
      "updated_at": "2026-10-22T15:00:00+08:00"
    },
    {
      "id": 9,
      "title": "为什么列表需要分页",
      "category": "开发手记",
      "category_id": 1,
      "tags": [
        "分页",
        "性能"
      ],
      "content": "# 每次只取需要的数据\n\n文章变多之后，一次读取全部内容会拖慢页面。\n\n## 一页十篇\n\n后端通过页码和每页条数查询，前端显示总数与翻页按钮。\n\n```sql\nSELECT * FROM posts\nORDER BY created_at DESC\nLIMIT 10 OFFSET 10;\n```\n\n搜索、分类和分页应一起生效。",
      "excerpt": " 每次只取需要的数据\n\n文章变多之后，一次读取全部内容会拖慢页面。\n\n 一页十篇\n\n后端通过页码和每页条数查询，前端显示总数与翻页按钮。\n\nsql\nSELECT  FROM posts\nO…",
      "content_html": "<h2>每次只取需要的数据</h2><p>文章变多之后，一次读取全部内容会拖慢页面。</p><h2>一页十篇</h2><p>后端通过页码和每页条数查询，前端显示总数与翻页按钮。</p><pre><code>SELECT * FROM posts\nORDER BY created_at DESC\nLIMIT 10 OFFSET 10;</code></pre><p>搜索、分类和分页应一起生效。</p>",
      "cover": "/assets/cover-notes.svg",
      "author": "demo",
      "author_id": 1,
      "views": 28,
      "created_at": "2026-10-21T15:00:00+08:00",
      "updated_at": "2026-10-21T15:00:00+08:00"
    },
    {
      "id": 10,
      "title": "让错误提示告诉用户下一步",
      "category": "学习方法",
      "category_id": 2,
      "tags": [
        "交互",
        "错误处理"
      ],
      "content": "# 把失败说清楚\n\n“操作失败”和“邮箱已被注册，请换一个邮箱或直接登录”给人的帮助不同。\n\n## 提示里包含行动\n\n- 网络暂不可用：稍后重试\n- 表单缺少字段：指出具体字段\n- 权限不足：说明需要的身份\n\n表单提交过程中也应显示正在保存，避免重复点击。",
      "excerpt": " 把失败说清楚\n\n“操作失败”和“邮箱已被注册，请换一个邮箱或直接登录”给人的帮助不同。\n\n 提示里包含行动\n\n- 网络暂不可用：稍后重试\n- 表单缺少字段：指出具体字段\n- 权限不足：说…",
      "content_html": "<h2>把失败说清楚</h2><p>“操作失败”和“邮箱已被注册，请换一个邮箱或直接登录”给人的帮助不同。</p><h2>提示里包含行动</h2><ul><li>网络暂不可用：稍后重试</li><li>表单缺少字段：指出具体字段</li><li>权限不足：说明需要的身份</li></ul><p>表单提交过程中也应显示正在保存，避免重复点击。</p>",
      "cover": "/assets/cover-journey.svg",
      "author": "demo",
      "author_id": 1,
      "views": 21,
      "created_at": "2026-10-20T15:00:00+08:00",
      "updated_at": "2026-10-20T15:00:00+08:00"
    },
    {
      "id": 11,
      "title": "一张封面，也是一段阅读线索",
      "category": "日常观察",
      "category_id": 4,
      "tags": [
        "设计",
        "封面"
      ],
      "content": "# 给文章一个视觉入口\n\n封面可以是草图、照片或简单的几何图形。\n\n## 保持清楚\n\n选择横向比例的图片，让主体留在中间；封面并非必填，内容仍然是文章的核心。\n\n你可以在编辑页上传自己的 PNG、JPEG、GIF 或 WebP 图片。",
      "excerpt": " 给文章一个视觉入口\n\n封面可以是草图、照片或简单的几何图形。\n\n 保持清楚\n\n选择横向比例的图片，让主体留在中间；封面并非必填，内容仍然是文章的核心。\n\n你可以在编辑页上传自己的 PNG…",
      "content_html": "<h2>给文章一个视觉入口</h2><p>封面可以是草图、照片或简单的几何图形。</p><h2>保持清楚</h2><p>选择横向比例的图片，让主体留在中间；封面并非必填，内容仍然是文章的核心。</p><p>你可以在编辑页上传自己的 PNG、JPEG、GIF 或 WebP 图片。</p>",
      "cover": "/assets/cover-data.svg",
      "author": "demo",
      "author_id": 1,
      "views": 14,
      "created_at": "2026-10-19T15:00:00+08:00",
      "updated_at": "2026-10-19T15:00:00+08:00"
    },
    {
      "id": 12,
      "title": "一次完整练习的复盘清单",
      "category": "学习方法",
      "category_id": 2,
      "tags": [
        "复盘",
        "实践"
      ],
      "content": "# 从能运行到能解释\n\n完成练习后，试着回答这些问题。\n\n1. 数据保存在哪个数据库？\n2. 前端调用了哪个接口？\n3. 后端怎样检查当前用户？\n4. 重启后数据是否还在？\n\n能解释这些过程，也就更容易定位下一次的问题。",
      "excerpt": " 从能运行到能解释\n\n完成练习后，试着回答这些问题。\n\n1. 数据保存在哪个数据库？\n2. 前端调用了哪个接口？\n3. 后端怎样检查当前用户？\n4. 重启后数据是否还在？\n\n能解释这些过程…",
      "content_html": "<h2>从能运行到能解释</h2><p>完成练习后，试着回答这些问题。</p><p>1. 数据保存在哪个数据库？<br>2. 前端调用了哪个接口？<br>3. 后端怎样检查当前用户？<br>4. 重启后数据是否还在？</p><p>能解释这些过程，也就更容易定位下一次的问题。</p>",
      "cover": "/assets/cover-notes.svg",
      "author": "demo",
      "author_id": 1,
      "views": 7,
      "created_at": "2026-10-18T15:00:00+08:00",
      "updated_at": "2026-10-18T15:00:00+08:00"
    }
  ],
  "categories": [
    {
      "id": 1,
      "name": "开发手记",
      "description": "用代码验证刚学会的想法"
    },
    {
      "id": 2,
      "name": "学习方法",
      "description": "记录有效的练习方式"
    },
    {
      "id": 3,
      "name": "工具与效率",
      "description": "让开发流程更顺手"
    },
    {
      "id": 4,
      "name": "日常观察",
      "description": "工作台之外的小发现"
    }
  ]
});
