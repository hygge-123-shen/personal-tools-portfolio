installCoursePreview('questions', {
  "questions": [
    {
      "id": 1,
      "title": "前端调用 API 时，GET 和 POST 应该怎样选择？",
      "content": "我正在做第一个全栈项目。\n\n已经知道前端要通过 API 和后端通信，但不清楚**查询文章**和**发布文章**应该用什么请求方式。\n\n有没有一个容易理解的例子？",
      "tags": [
        "API",
        "全栈入门"
      ],
      "content_html": "<p>我正在做第一个全栈项目。</p><p>已经知道前端要通过 API 和后端通信，但不清楚<strong>查询文章</strong>和<strong>发布文章</strong>应该用什么请求方式。</p><p>有没有一个容易理解的例子？</p>",
      "author": "demo",
      "author_id": 1,
      "views": 36,
      "votes": 1,
      "liked": false,
      "is_solved": true,
      "answers_count": 2,
      "created_at": "2026-10-29T15:00:00+08:00"
    },
    {
      "id": 2,
      "title": "MySQL 的事务为什么能保证下单流程完整？",
      "content": "创建订单需要写入订单表、订单商品表、扣减库存，再清理购物车。\n\n如果其中一步失败，应该怎样使用 `commit` 和 `rollback`，让数据保持一致？",
      "tags": [
        "MySQL",
        "数据库"
      ],
      "content_html": "<p>创建订单需要写入订单表、订单商品表、扣减库存，再清理购物车。</p><p>如果其中一步失败，应该怎样使用 <code>commit</code> 和 <code>rollback</code>，让数据保持一致？</p>",
      "author": "helper",
      "author_id": 2,
      "views": 43,
      "votes": 0,
      "liked": false,
      "is_solved": false,
      "answers_count": 1,
      "created_at": "2026-10-29T12:00:00+08:00"
    },
    {
      "id": 3,
      "title": "Markdown 中如何展示一段 Python 代码？",
      "content": "想在学习笔记里插入代码块，并保留缩进。\n\n普通换行似乎没有预期效果，请问应该用什么语法？",
      "tags": [
        "Markdown",
        "学习方法"
      ],
      "content_html": "<p>想在学习笔记里插入代码块，并保留缩进。</p><p>普通换行似乎没有预期效果，请问应该用什么语法？</p>",
      "author": "demo",
      "author_id": 1,
      "views": 50,
      "votes": 1,
      "liked": false,
      "is_solved": false,
      "answers_count": 0,
      "created_at": "2026-10-29T09:00:00+08:00"
    },
    {
      "id": 4,
      "title": "登录之后，为什么每次请求还要携带 Token？",
      "content": "前端已经显示登录成功了，但受保护接口还是提示未登录。\n\n我应该把 Token 放在哪个请求头？后端又如何确认身份？",
      "tags": [
        "登录认证",
        "API"
      ],
      "content_html": "<p>前端已经显示登录成功了，但受保护接口还是提示未登录。</p><p>我应该把 Token 放在哪个请求头？后端又如何确认身份？</p>",
      "author": "helper",
      "author_id": 2,
      "views": 57,
      "votes": 0,
      "liked": false,
      "is_solved": false,
      "answers_count": 0,
      "created_at": "2026-10-29T06:00:00+08:00"
    },
    {
      "id": 5,
      "title": "点赞按钮怎样避免重复点赞和重复加分？",
      "content": "我想实现问题点赞：同一个用户只能对同一个问题点赞一次。\n\n除了禁用前端按钮，数据库还需要哪些约束？",
      "tags": [
        "数据库",
        "业务逻辑"
      ],
      "content_html": "<p>我想实现问题点赞：同一个用户只能对同一个问题点赞一次。</p><p>除了禁用前端按钮，数据库还需要哪些约束？</p>",
      "author": "demo",
      "author_id": 1,
      "views": 64,
      "votes": 1,
      "liked": false,
      "is_solved": false,
      "answers_count": 1,
      "created_at": "2026-10-29T03:00:00+08:00"
    },
    {
      "id": 6,
      "title": "分页查询的 LIMIT 和 OFFSET 有什么关系？",
      "content": "每页显示 10 条问题。\n\n第 1 页、第 2 页的 SQL 应该如何写？总页数又应该怎样计算？",
      "tags": [
        "MySQL",
        "分页"
      ],
      "content_html": "<p>每页显示 10 条问题。</p><p>第 1 页、第 2 页的 SQL 应该如何写？总页数又应该怎样计算？</p>",
      "author": "helper",
      "author_id": 2,
      "views": 71,
      "votes": 0,
      "liked": false,
      "is_solved": false,
      "answers_count": 0,
      "created_at": "2026-10-29T00:00:00+08:00"
    },
    {
      "id": 7,
      "title": "文章封面上传后，数据库保存图片还是路径？",
      "content": "我已经实现了图片上传，接下来需要把封面与文章关联。\n\n是把图片二进制放进文章表，还是保存文件地址更合适？",
      "tags": [
        "文件上传",
        "全栈入门"
      ],
      "content_html": "<p>我已经实现了图片上传，接下来需要把封面与文章关联。</p><p>是把图片二进制放进文章表，还是保存文件地址更合适？</p>",
      "author": "demo",
      "author_id": 1,
      "views": 78,
      "votes": 0,
      "liked": false,
      "is_solved": false,
      "answers_count": 0,
      "created_at": "2026-10-28T21:00:00+08:00"
    },
    {
      "id": 8,
      "title": "如何判断一条记录是否属于当前登录用户？",
      "content": "文章详情页面只给作者显示编辑按钮。\n\n如果其他人直接调用修改接口，后端应该在哪里校验权限？",
      "tags": [
        "登录认证",
        "业务逻辑"
      ],
      "content_html": "<p>文章详情页面只给作者显示编辑按钮。</p><p>如果其他人直接调用修改接口，后端应该在哪里校验权限？</p>",
      "author": "helper",
      "author_id": 2,
      "views": 85,
      "votes": 0,
      "liked": false,
      "is_solved": false,
      "answers_count": 0,
      "created_at": "2026-10-28T18:00:00+08:00"
    },
    {
      "id": 9,
      "title": "Git 的暂存区和提交记录有什么区别？",
      "content": "我在 IDE 里修改了多个文件，只想先保存其中一部分改动。\n\n应该先暂存哪些内容，再执行什么操作？",
      "tags": [
        "Git",
        "开发工具"
      ],
      "content_html": "<p>我在 IDE 里修改了多个文件，只想先保存其中一部分改动。</p><p>应该先暂存哪些内容，再执行什么操作？</p>",
      "author": "demo",
      "author_id": 1,
      "views": 92,
      "votes": 0,
      "liked": false,
      "is_solved": false,
      "answers_count": 0,
      "created_at": "2026-10-28T15:00:00+08:00"
    },
    {
      "id": 10,
      "title": "接口返回了 400 和 403，分别说明什么？",
      "content": "调试接口时遇到了不同的 HTTP 状态码。\n\n想区分参数错误、未登录、无权限和资源不存在，方便前端展示正确提示。",
      "tags": [
        "API",
        "开发工具"
      ],
      "content_html": "<p>调试接口时遇到了不同的 HTTP 状态码。</p><p>想区分参数错误、未登录、无权限和资源不存在，方便前端展示正确提示。</p>",
      "author": "helper",
      "author_id": 2,
      "views": 99,
      "votes": 0,
      "liked": false,
      "is_solved": false,
      "answers_count": 0,
      "created_at": "2026-10-28T12:00:00+08:00"
    },
    {
      "id": 11,
      "title": "问答页面切换标签后，分页是否应该回到第一页？",
      "content": "我正在同时实现标签筛选、关键词搜索和分页。\n\n切换筛选条件之后，原来的页码可能没有数据，通常怎样处理？",
      "tags": [
        "前端",
        "分页"
      ],
      "content_html": "<p>我正在同时实现标签筛选、关键词搜索和分页。</p><p>切换筛选条件之后，原来的页码可能没有数据，通常怎样处理？</p>",
      "author": "demo",
      "author_id": 1,
      "views": 106,
      "votes": 0,
      "liked": false,
      "is_solved": false,
      "answers_count": 0,
      "created_at": "2026-10-28T09:00:00+08:00"
    },
    {
      "id": 12,
      "title": "完成一个小项目后，应该怎样安排功能检查？",
      "content": "博客的页面和接口都已经写完。\n\n除了看首页能否打开，还应该检查哪些操作，才能确认整个流程连通？",
      "tags": [
        "学习方法",
        "全栈入门"
      ],
      "content_html": "<p>博客的页面和接口都已经写完。</p><p>除了看首页能否打开，还应该检查哪些操作，才能确认整个流程连通？</p>",
      "author": "helper",
      "author_id": 2,
      "views": 113,
      "votes": 0,
      "liked": false,
      "is_solved": false,
      "answers_count": 0,
      "created_at": "2026-10-28T06:00:00+08:00"
    }
  ],
  "answers": [
    {
      "id": 1,
      "question_id": 1,
      "author": "helper",
      "content": "可以把 API 看成后端提供的办事窗口。\n\n- **GET**：读取数据，例如 `GET /api/posts` 获取文章列表。\n- **POST**：提交新数据，例如 `POST /api/posts` 发布文章。\n\n发布文章时，把标题和正文放在请求体，后端验证身份和参数后再保存到数据库。",
      "content_html": "<p>可以把 API 看成后端提供的办事窗口。</p><ul><li><strong>GET</strong>：读取数据，例如 <code>GET /api/posts</code> 获取文章列表。</li><li><strong>POST</strong>：提交新数据，例如 <code>POST /api/posts</code> 发布文章。</li></ul><p>发布文章时，把标题和正文放在请求体，后端验证身份和参数后再保存到数据库。</p>",
      "author_points": 140,
      "author_id": 2,
      "created_at": "2026-10-29T14:00:00+08:00",
      "votes": 0,
      "liked": false,
      "is_accepted": true
    },
    {
      "id": 2,
      "question_id": 1,
      "author": "demo",
      "content": "可以先从浏览器开发者工具的 Network 面板观察请求。\n\n一次查询和一次提交，对比它们的请求方式、请求体和响应内容，会更容易理解。",
      "content_html": "<p>可以先从浏览器开发者工具的 Network 面板观察请求。</p><p>一次查询和一次提交，对比它们的请求方式、请求体和响应内容，会更容易理解。</p>",
      "author_points": 125,
      "author_id": 1,
      "created_at": "2026-10-29T13:00:00+08:00",
      "votes": 0,
      "liked": false,
      "is_accepted": false
    },
    {
      "id": 3,
      "question_id": 2,
      "author": "demo",
      "content": "把这一组修改放进同一个事务：\n\n```python\ntry:\n    # 检查库存、创建订单、扣库存、清购物车\n    connection.commit()\nexcept Exception:\n    connection.rollback()\n    raise\n```\n\n库存查询还要考虑并发，可以配合行锁，避免两次下单同时读到同一份库存。",
      "content_html": "<p>把这一组修改放进同一个事务：</p><pre><code>try:\n    # 检查库存、创建订单、扣库存、清购物车\n    connection.commit()\nexcept Exception:\n    connection.rollback()\n    raise</code></pre><p>库存查询还要考虑并发，可以配合行锁，避免两次下单同时读到同一份库存。</p>",
      "author_points": 125,
      "author_id": 1,
      "created_at": "2026-10-29T12:00:00+08:00",
      "votes": 0,
      "liked": false,
      "is_accepted": false
    },
    {
      "id": 4,
      "question_id": 5,
      "author": "helper",
      "content": "前端可以显示点赞状态，但最终约束必须放在后端和数据库。\n\n给点赞记录增加 `UNIQUE(user_id, target_type, target_id)`，并把写入点赞记录、更新票数和积分放在同一个事务里。",
      "content_html": "<p>前端可以显示点赞状态，但最终约束必须放在后端和数据库。</p><p>给点赞记录增加 <code>UNIQUE(user_id, target_type, target_id)</code>，并把写入点赞记录、更新票数和积分放在同一个事务里。</p>",
      "author_points": 140,
      "author_id": 2,
      "created_at": "2026-10-29T11:00:00+08:00",
      "votes": 0,
      "liked": false,
      "is_accepted": false
    }
  ]
});
