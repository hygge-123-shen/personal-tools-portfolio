(() => {
  const storageKey = "zhuying-studyhub-classroom-v1";
  const posts = [
    {id: 1, title: "把一个想法拆成可交付的全栈功能", content: "先描述用户目标，再列数据模型和 API，最后安排页面与验收条件。每一轮只完成一个可以运行的小切片。", category: "项目方法", tags: ["全栈", "实践"], author: "林序", views: 36, created_at: "2026-10-29T09:20:00+08:00"},
    {id: 2, title: "用一张图理解 Git 的三块区域", content: "工作区保存正在编辑的文件；git add 将选中的修改放进暂存区；git commit 把暂存内容保存为版本。推送到 GitHub 前，先检查 git status 和提交说明。", category: "开发工具", tags: ["Git", "入门"], author: "阿澄", views: 24, created_at: "2026-10-28T14:10:00+08:00"},
    {id: 3, title: "小程序本地存储：从表单到列表", content: "使用本地存储 API 保存记录数组，页面 onShow 时重新读取。删除记录时按唯一 id 过滤，再写回本地存储。", category: "微信小程序", tags: ["本地存储", "JavaScript"], author: "小禾", views: 18, created_at: "2026-10-27T16:40:00+08:00"}
  ];
  const questions = [
    {id: 1, title: "为什么 git push 提示 rejected？", content: "我本地提交后推送被拒绝，提示远程有新的提交。安全的同步步骤是什么？", tags: ["Git", "协作"], author: "予安", author_id: 2, views: 19, votes: 8, created_at: "2026-10-29T09:10:00+08:00"},
    {id: 2, title: "SQLite 适合做课堂全栈演示吗？", content: "想要零配置运行，又能演示用户、订单和事务，有哪些注意点？", tags: ["数据库", "全栈"], author: "林序", author_id: 1, views: 31, votes: 5, created_at: "2026-10-28T13:00:00+08:00"}
  ];
  const answers = [
    {id: 1, question_id: 1, author: "学习者", content: "先查看状态，再执行 git pull --rebase 同步远程改动；如发生冲突，解决后继续 rebase，再推送。", votes: 5, created_at: questions[0].created_at},
    {id: 2, question_id: 2, author: "学习者", content: "很适合本地单机练习。启用外键、使用事务处理多表写入即可；生产环境应评估并发、备份和部署条件。", votes: 7, created_at: questions[1].created_at}
  ];
  const products = [
    {id: 1, name: "全栈项目拆解卡", description: "需求拆解与 API 设计练习卡。", price: 19.9, stock: 40, category: "项目工具", emoji: "🗂️"},
    {id: 2, name: "Git 提交说明手册", description: "从 add、commit 到分支合并的中文速查小册。", price: 12, stock: 60, category: "开发工具", emoji: "📘"},
    {id: 3, name: "小程序界面灵感包", description: "页面状态、空状态和表单交互设计清单。", price: 16.5, stock: 35, category: "设计资源", emoji: "🎨"}
  ];
  const address = {id: 1, recipient: "课堂演示", province: "", city: "", district: "", detail: "示例地址（无需填写个人信息）", is_default: true};
  const protectedRoutes = new Set(["me", "cart", "addresses", "orders"]);

  function load() {
    const empty = {
      posts: [], questions: [], answers: [], liked: {},
      accepted: {2: 2}, cart: {}, orders: [], nextId: 100
    };
    try {
      return {...empty, ...JSON.parse(localStorage.getItem(storageKey) || "{}")};
    } catch {
      return empty;
    }
  }

  function lookup(records, id) {
    const record = records.find(item => item.id === id);
    if (!record) throw new Error("未找到这条演示记录。");
    return record;
  }

  function text(value, max) {
    const cleaned = String(value ?? "").trim();
    if (!cleaned || cleaned.length > max) throw new Error("请填写有效的示例文字。");
    return cleaned;
  }

  function likedKey(collection, id) {
    return collection + ":" + id;
  }

  function stock(product, orders) {
    const reserved = orders.filter(order => order.status !== "已取消")
      .flatMap(order => order.items).filter(line => line.id === product.id)
      .reduce((count, line) => count + line.quantity, 0);
    return product.stock - reserved;
  }

  function request(path, options = {}, token) {
    const method = options.method || "GET";
    const url = new URL(path, "https://preview.invalid");
    const [, collection, identifier, action] = url.pathname.split("/").slice(1);
    const id = Number(identifier);
    const data = load();
    const account = window.ZhuyingDemo;
    const user = account?.isAuthorized(token) ? account.getSession()?.user : null;
    if (!user && (method !== "GET" || protectedRoutes.has(collection))) {
      throw new Error("请先登录课堂演示账号。");
    }
    const input = options.body ? JSON.parse(options.body) : {};
    const allPosts = [...data.posts, ...posts];
    const allQuestions = [...data.questions, ...questions];
    const allAnswers = [...data.answers, ...answers];
    const isLiked = (group, recordId) => Boolean(user && data.liked[likedKey(group, recordId)]);
    const votes = (group, record) => (record.votes || 0) + Number(Boolean(data.liked[likedKey(group, record.id)]));
    const fresh = () => ({
      id: data.nextId++, author: user.display_name || user.username,
      author_id: user.id, created_at: new Date().toISOString()
    });
    const save = result => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch {
        throw new Error("当前浏览器无法保存演示记录。");
      }
      return result;
    };
    const toggleLike = (group, recordId) => {
      const key = likedKey(group, recordId);
      data.liked[key] = !data.liked[key];
      return save({liked: data.liked[key]});
    };
    const cart = () => {
      const items = products.filter(product => data.cart[product.id])
        .map(product => ({...product, quantity: data.cart[product.id]}));
      return {items, total: items.reduce((sum, item) => sum + item.price * item.quantity, 0)};
    };
    const cardQuestion = question => ({
      ...question, votes: votes("questions", question),
      answers_count: allAnswers.filter(answer => answer.question_id === question.id).length,
      is_solved: Boolean(data.accepted[question.id])
    });

    if (collection === "posts") {
      if (method === "GET" && !identifier) {
        const category = url.searchParams.get("category");
        const keyword = (url.searchParams.get("keyword") || "").toLowerCase();
        const items = allPosts.filter(post => (!category || post.category === category)
          && `${post.title} ${post.content}`.toLowerCase().includes(keyword));
        return {items, categories: [...new Set(allPosts.map(post => post.category))]};
      }
      if (method === "POST" && !identifier) {
        data.posts.unshift({...fresh(), title: text(input.title, 100), content: text(input.content, 12000),
          category: text(input.category, 32), tags: input.tags || [], views: 0});
        return save({ok: true});
      }
      const post = lookup(allPosts, id);
      if (method === "GET" && !action) {
        return {item: {...post, votes: votes("posts", post)}, liked: isLiked("posts", id)};
      }
      if (method === "POST" && action === "vote") return toggleLike("posts", id);
    }

    if (collection === "questions") {
      if (method === "GET" && !identifier) {
        const sort = url.searchParams.get("sort");
        const items = allQuestions.map(cardQuestion);
        if (sort === "hot") items.sort((a, b) => b.votes - a.votes);
        return {items: sort === "unsolved" ? items.filter(item => !item.is_solved) : items};
      }
      if (method === "POST" && !identifier) {
        data.questions.unshift({...fresh(), title: text(input.title, 120),
          content: text(input.content, 10000), tags: input.tags || [], views: 0, votes: 0});
        return save({ok: true});
      }
      const question = lookup(allQuestions, id);
      if (method === "GET" && !action) {
        return {
          item: cardQuestion(question), liked: isLiked("questions", id),
          answers: allAnswers.filter(answer => answer.question_id === id).map(answer => ({
            ...answer, votes: votes("answers", answer), liked: isLiked("answers", answer.id),
            is_accepted: data.accepted[id] === answer.id
          }))
        };
      }
      if (method === "POST" && action === "vote") return toggleLike("questions", id);
      if (method === "POST" && action === "answers") {
        data.answers.push({...fresh(), question_id: id, content: text(input.content, 8000), votes: 0});
        return save({ok: true});
      }
    }

    if (collection === "answers" && method === "POST") {
      const answer = lookup(allAnswers, id);
      if (action === "vote") return toggleLike("answers", id);
      if (action === "accept") {
        const question = lookup(allQuestions, answer.question_id);
        if (question.author_id !== user.id) throw new Error("只有提问者可以采纳回答。");
        data.accepted[question.id] = id;
        return save({ok: true});
      }
    }

    if (collection === "me" && method === "GET") return {user};
    if (collection === "products" && method === "GET") {
      return {items: products.map(product => ({...product, stock: stock(product, data.orders)}))};
    }
    if (collection === "addresses" && method === "GET") return {items: [address]};
    if (collection === "cart") {
      if (method === "GET") return cart();
      const product = lookup(products, method === "POST" ? Number(input.product_id) : id);
      if (method === "DELETE") {
        delete data.cart[product.id];
        return save({ok: true});
      }
      const quantity = Number(input.quantity) + (method === "POST" ? data.cart[product.id] || 0 : 0);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > stock(product, data.orders)) {
        throw new Error("请选择库存范围内的数量。");
      }
      data.cart[product.id] = quantity;
      return save({ok: true});
    }
    if (collection === "orders") {
      if (method === "GET") return {items: data.orders};
      if (method === "POST" && action === "cancel") {
        const order = lookup(data.orders, id);
        if (order.status !== "已创建") {
          throw new Error("该演示订单已经取消。");
        }
        order.status = "已取消";
        return save({ok: true});
      }
      if (method === "POST" && !identifier) {
        const {items, total} = cart();
        if (Number(input.address_id) !== address.id || !items.length) throw new Error("请选择示例地址并添加资料。");
        if (items.some(item => item.quantity > stock(item, data.orders))) throw new Error("库存不足，请调整数量。");
        const orderId = data.nextId++;
        const order = {id: orderId, order_no: "DEMO-" + orderId, created_at: new Date().toISOString(),
          items: items.map(item => ({id: item.id, product_name: item.name, quantity: item.quantity})),
          recipient: address.recipient, status: "已创建", total_price: total};
        data.orders.unshift(order);
        data.cart = {};
        return save(order);
      }
    }
    throw new Error("这项操作暂未开放。");
  }

  window.StudyHubDemo = {request};
})();
