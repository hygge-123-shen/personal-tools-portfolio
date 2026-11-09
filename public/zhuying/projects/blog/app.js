const state = {
  token: window.ZhuyingDemo.getSession()?.token || '',
  user: null, categories: [], pendingHash: "",
  lastListHash: "#/posts", routeVersion: 0, previewVersion: 0, previewTimer: null
};
const $ = (selector, root = document) => root.querySelector(selector);
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const safeUrl = value => /^(\/uploads\/|\/assets\/|https?:\/\/)/i.test(value || "") ? value.replace(/^\/assets\//, "./assets/") : "";
function avatar(user, large = false) {
  const name = user.display_name || user.username || user.author || "纸";
  const url = safeUrl(user.avatar || user.author_avatar);
  return '<span class="avatar' + (large ? ' large' : '') + '">' + (url ? '<img src="' + esc(url) + '" alt="">' : esc(name.slice(0, 1))) + '</span>';
}
function formatDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : new Intl.DateTimeFormat("zh-CN", {year:"numeric",month:"2-digit",day:"2-digit"}).format(d);
}
function toast(message, error = false) {
  const el = $("#toast");
  el.textContent = message; el.classList.toggle("error", error); el.classList.add("show");
  clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 3200);
}
async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (state.token) headers.set("Authorization", "Bearer " + state.token);
  let body = options.body;
  if (body && !(body instanceof FormData) && typeof body !== "string") {
    body = JSON.stringify(body); headers.set("Content-Type", "application/json");
  }
  let response;
  try { response = await CourseClassroom.request(path, {...options, headers, body}); }
  catch { throw new Error("课堂演示未加载，请刷新页面后重试。"); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) { state.token = ""; state.user = null; renderAccount(); }
    throw new Error(data.error || "操作未完成，请稍后重试。");
  }
  return data;
}
function navigate(hash) {
  if (location.hash === hash) route(); else location.hash = hash;
}
function listHash(params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value !== "" && value != null && value !== false) query.set(key, String(value));
  return "#/posts" + (query.size ? "?" + query.toString() : "");
}
function renderAccount() {
  $("#accountArea").innerHTML = state.user
    ? '<button class="account-button" data-action="profile">' + avatar(state.user) + '<span>' + esc(state.user.display_name || state.user.username) + '</span></button>'
    : '<button class="button ghost small" data-action="login">课堂登录</button>';
}
function requireAuth(hash) {
  if (state.user) return true;
  state.pendingHash = hash || location.hash; openAuth();
  $("#page").innerHTML = '<div class="empty"><b>这一页，留给登录后的你。</b>登录课堂演示账号后可以写文章并管理自己的内容。<br><button class="button primary" data-action="login">课堂登录</button><br><a class="back-link" href="#/posts">返回文章列表</a></div>';
  return false;
}
function openAuth() {
  $("#authTitle").textContent = "登录课堂演示账号";
  $("#authContent").innerHTML = '<form data-form="auth"><div class="field"><label for="authUsername">演示账号</label><input id="authUsername" name="username" autocomplete="username" value="' + esc(window.ZhuyingDemo.USERNAME) + '" required></div><div class="field"><label for="authPassword">演示密码</label><input id="authPassword" name="password" type="password" autocomplete="current-password" required><small>课堂演示密码 ' + esc(window.ZhuyingDemo.PASSWORD) + '。</small></div><div class="form-error" data-form-error role="alert"></div><button class="button primary" type="submit">登录</button></form>';
  if (!$("#authDialog").open) $("#authDialog").showModal();
}
function tagLinks(tags, filters = {}) {
  return '<span class="tags">' + (tags || []).map(tag => '<a href="' + esc(listHash({...filters, tag, page:"", pageSize:""})) + '"># ' + esc(tag) + '</a>').join("") + '</span>';
}
async function loadCategories() { state.categories = (await api("/api/categories")).items; return state.categories; }
function categoryNav(active, filters = {}) {
  const count = state.categories.reduce((sum, c) => sum + Number(c.post_count), 0);
  return '<aside class="rail"><p class="rail-title">EXPLORE BY TOPIC</p><nav class="category-nav" aria-label="文章分类"><a href="' + esc(listHash({...filters, category:"", page:"", pageSize:""})) + '" class="category-link ' + (!active ? 'active' : '') + '"><span>全部分类</span><em>' + count + '</em></a>' + state.categories.map(c => '<a href="' + esc(listHash({...filters, category:c.id, page:"", pageSize:""})) + '" class="category-link ' + (String(c.id) === String(active) ? 'active' : '') + '"><span>' + esc(c.name) + '</span><em>' + c.post_count + '</em></a>').join("") + '</nav><div class="rail-note">把刚刚学会的，<br>写给以后的自己。<small>ONE PAGE AT A TIME</small></div></aside>';
}
function sidebar() {
  return '<aside class="sidebar"><div class="note-card"><span class="number">01</span><p class="eyebrow">A LITTLE REMINDER</p><h3>从一小段记录，<br>开始一次分享。</h3><p>一段调试的过程，一个忽然想通的概念，或者今天的小小发现。都值得写下来。</p><a class="text-link" href="#/write">写下第一段 →</a></div><div class="reading-note"><h3>写作小笺</h3><ol><li>用一个清楚的标题，告诉读者你想分享什么。</li><li>描述过程，也写下尝试失败的地方。</li><li>发布前，看看右侧的 Markdown 预览。</li></ol></div><div class="sidebar-quote"><span>“</span>文字，是思想<br>留下的脚印。<small>MAKE ROOM FOR YOUR IDEAS</small></div></aside>';
}
function card(post, filters = {}) {
  const cover = safeUrl(post.cover);
  return '<article class="post-card ' + (!cover ? 'no-cover' : '') + '"><div><div class="post-meta"><a class="category-badge" href="' + esc(listHash({...filters, category:post.category_id, page:"", pageSize:""})) + '">' + esc(post.category) + '</a><time>' + formatDate(post.created_at) + '</time><span>' + post.views + ' 次阅读</span></div><h3><a href="#/post/' + post.id + '">' + esc(post.title) + '</a></h3><p class="post-excerpt">' + esc(post.excerpt) + '</p><div class="post-foot"><span class="author">' + avatar(post) + esc(post.author) + '</span>' + tagLinks(post.tags, filters) + '</div></div>' + (cover ? '<a href="#/post/' + post.id + '" class="post-cover" tabindex="-1" aria-hidden="true"><img src="' + esc(cover) + '" alt="" loading="lazy"></a>' : '') + '</article>';
}
async function renderFeed(query, version) {
  const mine = query.get("mine") === "1";
  if (mine && !requireAuth(location.hash)) return;
  state.lastListHash = location.hash || "#/posts";
  const page = Math.max(1, Number(query.get("page")) || 1);
  const params = {page, pageSize:10, keyword:query.get("keyword") || "", category:query.get("category") || "", tag:query.get("tag") || "", mine:mine ? 1 : ""};
  const requestQuery = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== ""));
  const [data] = await Promise.all([api("/api/posts?" + requestQuery), loadCategories()]);
  if (version !== state.routeVersion) return;
  if (page > Math.max(1, data.pages)) { navigate(listHash({...params, page:Math.max(1, data.pages), pageSize:""})); return; }
  const makePage = p => listHash({...params, page:p, pageSize:""});
  let pageButtons = '';
  for (let p = Math.max(1, page - 2); p <= Math.min(Math.max(1, data.pages), page + 2); p++) pageButtons += '<button class="button small ' + (p === page ? 'current' : '') + '" data-action="go" data-hash="' + esc(makePage(p)) + '" ' + (p === page ? 'aria-current="page"' : '') + '>' + p + '</button>';
  const filtered = params.keyword || params.tag || params.category;
  const categoryLabel = state.categories.find(c => String(c.id) === String(params.category))?.name || params.category;
  $("#page").innerHTML = '<div class="intro"><div><p class="eyebrow">NOTES, IDEAS & EVERYDAY DISCOVERIES</p><h1>' + (mine ? '我的文字，也在慢慢生长。' : '把今天弄懂的，留给明天。') + '</h1><p>' + (mine ? '这里收着你发布的所有文章。继续写，也可以回头修改。' : '关于学习、开发与日常的记录。慢慢写，认真分享。') + '</p></div><div class="issue">PERSONAL JOURNAL<b>纸间 / BLOG</b>EVERY IDEA DESERVES A PAGE</div></div><div class="page-grid">' + categoryNav(params.category, params) + '<section class="feed"><div class="feed-head"><h2>' + (mine ? '我的文章' : filtered ? '文章筛选' : '最近更新') + '<small>' + data.total + ' 篇记录</small></h2><form class="search" data-form="search"><label class="visually-hidden" for="searchKeyword">搜索文章</label><input id="searchKeyword" name="keyword" value="' + esc(params.keyword) + '" placeholder="搜索标题或正文" maxlength="120"><button type="submit">搜索</button></form></div>' + (filtered ? '<div class="active-filter"><span>' + (params.keyword ? '搜索：' + esc(params.keyword) + '　' : '') + (params.category ? '分类：' + esc(categoryLabel) + '　' : '') + (params.tag ? '标签：# ' + esc(params.tag) : '') + '</span><button data-action="go" data-hash="' + (mine ? '#/posts?mine=1' : '#/posts') + '">清除筛选</button></div>' : '') + (data.items.length ? data.items.map(post => card(post, params)).join("") : '<div class="empty"><b>' + (mine ? '你的第一篇，正等着被写下。' : '这一页暂时还没有文章。') + '</b>' + (filtered ? '换个关键词或分类试试。' : '记录一次尝试，也是一篇值得分享的文章。') + '<br><a href="#/write" class="button primary">写一篇文章</a></div>') + '<div class="pagination"><span>共 ' + data.total + ' 篇 · 每页 10 篇</span><div class="page-buttons"><button class="button small" data-action="go" data-hash="' + esc(makePage(page - 1)) + '" ' + (page <= 1 ? 'disabled' : '') + '>上一页</button>' + pageButtons + '<button class="button small" data-action="go" data-hash="' + esc(makePage(page + 1)) + '" ' + (page >= data.pages ? 'disabled' : '') + '>下一页</button></div></div></section>' + sidebar() + '</div>';
}
async function renderPost(id, version) {
  const {item:p} = await api("/api/posts/" + id);
  if (version !== state.routeVersion) return;
  const own = state.user && Number(state.user.id) === Number(p.author_id);
  $("#page").innerHTML = '<div class="article-shell"><a class="back-link" href="' + esc(state.lastListHash) + '">← 返回文章列表</a><article><div class="article-top"><a class="category-badge" href="' + esc(listHash({category:p.category_id})) + '">' + esc(p.category) + '</a><h1>' + esc(p.title) + '</h1><div class="article-byline"><span class="author">' + avatar(p) + esc(p.author) + '</span><span>发布于 ' + formatDate(p.created_at) + '</span><span>' + p.views + ' 次阅读</span><span>更新于 ' + formatDate(p.updated_at) + '</span></div>' + (own ? '<div class="article-toolbar"><a href="#/edit/' + p.id + '" class="button small">编辑文章</a><button class="button small danger" data-action="delete-post" data-id="' + p.id + '">删除文章</button></div>' : '') + '</div>' + (safeUrl(p.cover) ? '<img class="article-cover" src="' + esc(safeUrl(p.cover)) + '" alt="文章封面">' : '') + '<div class="markdown">' + p.content_html + '</div><div class="article-bottom">' + tagLinks(p.tags) + '<a href="' + esc(state.lastListHash) + '" class="text-link">继续阅读其他文章 →</a></div><div class="author-card">' + avatar(p) + '<div><strong>' + esc(p.author) + '</strong><p>' + esc(p.author_bio || '在这里，记录学习和生活中的小小发现。') + '</p></div></div></article></div>';
}
function categoryOptions(selected) {
  return state.categories.map(c => '<option value="' + c.id + '" ' + (Number(selected) === Number(c.id) ? 'selected' : '') + '>' + esc(c.name) + '</option>').join("");
}
async function renderEditor(id, version) {
  if (!requireAuth(location.hash)) return;
  const [_, result] = await Promise.all([loadCategories(), id ? api("/api/posts/" + id) : Promise.resolve(null)]);
  if (version !== state.routeVersion) return;
  const p = result?.item || {title:"",content:"",tags:[],cover:"",category_id:state.categories[0]?.id};
  if (id && Number(p.author_id) !== Number(state.user.id)) throw new Error("只能编辑自己发布的文章。");
  $("#page").innerHTML = '<section class="editor-shell"><a class="back-link" href="' + esc(id ? '#/post/' + id : state.lastListHash) + '">← ' + (id ? '返回文章' : '返回文章列表') + '</a><form data-form="post" data-id="' + (id || '') + '"><div class="editor-heading"><div><p class="eyebrow">YOUR WRITING DESK</p><h1>' + (id ? '给这篇文章，再一点打磨。' : '今天，想写点什么？') + '</h1><p>左边专注写作，右边看看文字呈现的样子。</p></div><div class="editor-actions"><a class="button ghost" href="' + esc(id ? '#/post/' + id : state.lastListHash) + '">取消</a><button class="button primary" type="submit">' + (id ? '保存修改' : '发布文章') + '</button></div></div><div class="field"><label class="visually-hidden" for="postTitle">文章标题</label><input class="title-input" id="postTitle" name="title" value="' + esc(p.title) + '" required maxlength="100" placeholder="为这段记录，起一个标题"></div><div class="form-grid"><div class="field"><div class="label-line"><label for="postCategory">文章分类</label><button type="button" class="text-link" data-action="manage-categories">管理分类</button></div><select id="postCategory" name="category_id" required>' + categoryOptions(p.category_id) + '</select></div><div class="field"><label for="postTags">标签</label><input id="postTags" name="tags" value="' + esc((p.tags || []).join(", ")) + '" placeholder="全栈, 学习笔记, 实践"><small>用英文或中文逗号分隔，最多 8 个标签，每个不超过 24 字。</small></div></div><label class="visually-hidden" for="contentInput">文章 Markdown 正文</label><div class="editor-pane"><div class="edit-half"><div class="pane-label">MARKDOWN <small id="charCount">' + p.content.length + ' / 50000 字符</small></div><textarea id="contentInput" name="content" required maxlength="50000" spellcheck="false" placeholder="# 从一个想法开始&#10;&#10;写下过程，也留下思考…">' + esc(p.content) + '</textarea></div><div class="edit-half"><div class="pane-label">实时预览 <small>自动更新</small></div><div class="markdown" id="markdownPreview"><p class="preview-placeholder">写下第一行后，预览会出现在这里。</p></div></div></div><div class="help-row"><span>常用语法：# 标题　**粗体**　- 列表　三个反引号包围代码块</span><span>体验文章保存在当前浏览器</span></div><div class="form-error" data-form-error role="alert"></div></form></section>';
  updatePreview(p.content);
}
async function updatePreview(content) {
  const version = ++state.previewVersion;
  const target = $("#markdownPreview"); if (!target) return;
  if (!content.trim()) { target.innerHTML = '<p class="preview-placeholder">写下第一行后，预览会出现在这里。</p>'; return; }
  try {
    const d = await api("/api/preview", {method:"POST", body:{content}});
    if (version === state.previewVersion && $("#markdownPreview")) $("#markdownPreview").innerHTML = d.html;
  } catch (error) { if (version === state.previewVersion && $("#markdownPreview")) $("#markdownPreview").innerHTML = '<p class="form-error">' + esc(error.message) + '</p>'; }
}
function renderProfile() {
  if (!requireAuth(location.hash)) return;
  const user = state.user;
  $("#page").innerHTML = '<section class="profile-shell"><a class="back-link" href="#/posts">← 返回文章列表</a><div class="profile-heading"><p class="eyebrow">ABOUT THE WRITER</p><h1>课堂演示账号</h1><p>你可以查看自己在这个浏览器里写下的文章。</p></div><div class="profile-card">' + avatar(user, true) + '<h3>' + esc(user.display_name || user.username) + '</h3><a class="button ghost small" href="#/posts?mine=1">查看我的文章 →</a><button type="button" class="button ghost small" data-action="logout">退出当前账号</button></div></section>';
}
async function route() {
  const version = ++state.routeVersion;
  clearTimeout(state.previewTimer);
  const [path, rawQuery = ""] = (location.hash.slice(1) || "/posts").split("?");
  const query = new URLSearchParams(rawQuery);
  $("#navPosts").classList.toggle("active", path === "/posts" && query.get("mine") !== "1");
  $("#navMine").classList.toggle("active", path === "/posts" && query.get("mine") === "1");
  $("#navProfile").classList.toggle("active", path === "/profile");
  $("#page").innerHTML = '<div class="loading">正在打开这一页…</div>';
  try {
    if (path === "/posts" || path === "/") await renderFeed(query, version);
    else if (/^\/post\/\d+$/.test(path)) await renderPost(path.split("/")[2], version);
    else if (path === "/write") await renderEditor(null, version);
    else if (/^\/edit\/\d+$/.test(path)) await renderEditor(path.split("/")[2], version);
    else if (path === "/profile") renderProfile();
    else $("#page").innerHTML = '<div class="empty"><b>这一页还没有写下。</b><a href="#/posts" class="button">回到文章列表</a></div>';
  } catch (error) {
    if (version === state.routeVersion) $("#page").innerHTML = '<div class="empty"><b>暂时没能打开这一页。</b><p>' + esc(error.message) + '</p><button class="button" data-action="retry">重试</button> <a class="button ghost" href="#/posts">文章列表</a></div>';
  }
  window.scrollTo({top:0, behavior:"auto"});
}
function categoryFormHtml(item = null) {
  return '<h3 class="category-form-title">' + (item ? '修改分类' : '新建分类') + '</h3><form data-form="category" data-id="' + (item?.id || '') + '"><div class="field"><label for="categoryName">分类名称</label><input id="categoryName" name="name" required maxlength="30" value="' + esc(item?.name || '') + '" placeholder="例如：读书随记"></div><div class="field"><label for="categoryDescription">分类说明</label><input id="categoryDescription" name="description" maxlength="200" value="' + esc(item?.description || '') + '"></div><div class="form-end">' + (item ? '<button type="button" class="text-link" data-action="reset-category">取消修改</button>' : '<span></span>') + '<button type="submit" class="button primary small">' + (item ? '保存分类' : '添加分类') + '</button></div><div class="form-error" data-form-error role="alert"></div></form>';
}
async function openCategories() {
  if (!state.user) return openAuth();
  await loadCategories();
  $("#categoryContent").innerHTML = '<div class="category-list">' + state.categories.map(c => '<div class="category-row"><div><b>' + esc(c.name) + ' <small class="muted">' + c.post_count + ' 篇</small></b><p>' + esc(c.description) + '</p></div>' + (Number(c.creator_id) === Number(state.user.id) ? '<div class="row-actions"><button data-action="edit-category" data-id="' + c.id + '">修改</button><button data-action="delete-category" data-id="' + c.id + '" ' + (c.post_count ? 'disabled title="请先调整该分类下文章的分类"' : '') + '>删除</button></div>' : '<span class="muted">其他作者创建</span>') + '</div>').join("") + '</div><div id="categoryFormArea">' + categoryFormHtml() + '</div>';
  if (!$("#categoryDialog").open) $("#categoryDialog").showModal();
}
function refreshCategorySelect(selected = null) {
  const select = $("#postCategory");
  if (select) { const current = selected ?? select.value; select.innerHTML = categoryOptions(current); }
}
document.addEventListener("click", async event => {
  const button = event.target.closest("[data-action]"); if (!button || button.disabled) return;
  const action = button.dataset.action;
  try {
    if (action === "go") navigate(button.dataset.hash);
    else if (action === "profile") navigate("#/profile");
    else if (action === "retry") route();
    else if (action === "login") openAuth("login");
    else if (action === "auth-mode") openAuth(button.dataset.mode);
    else if (action === "close-auth") { state.pendingHash = ""; $("#authDialog").close(); }
    else if (action === "logout") { window.ZhuyingDemo.logout(); state.user = null; state.token = ""; renderAccount(); toast("已退出登录"); navigate("#/posts"); }
    else if (action === "remove-cover") { $("#coverValue").value = ""; $("#coverPreview").textContent = "＋"; }
    else if (action === "remove-avatar") { $("#avatarValue").value = ""; $("#avatarPreview").innerHTML = avatar({username:state.user.username}, true); }
    else if (action === "delete-post") {
      if (!confirm("确定删除这篇文章吗？删除后无法恢复。")) return;
      button.disabled = true;
      await api("/api/posts/" + button.dataset.id, {method:"DELETE"});
      toast("文章已删除"); navigate("#/posts?mine=1");
    } else if (action === "manage-categories") await openCategories();
    else if (action === "close-categories") { $("#categoryDialog").close(); refreshCategorySelect(); }
    else if (action === "edit-category") { const c = state.categories.find(c => c.id === Number(button.dataset.id)); $("#categoryFormArea").innerHTML = categoryFormHtml(c); $("#categoryName").focus(); }
    else if (action === "reset-category") $("#categoryFormArea").innerHTML = categoryFormHtml();
    else if (action === "delete-category") {
      if (!confirm("确定删除这个空分类吗？")) return;
      await api("/api/categories/" + button.dataset.id, {method:"DELETE"});
      await openCategories(); refreshCategorySelect(); toast("分类已删除");
    }
  } catch (error) { button.disabled = false; toast(error.message, true); }
});
document.addEventListener("submit", async event => {
  const form = event.target.closest("form[data-form]"); if (!form) return;
  event.preventDefault();
  const type = form.dataset.form;
  const values = Object.fromEntries(new FormData(form).entries());
  if (type === "search") {
    const query = new URLSearchParams((location.hash.split("?")[1]) || "");
    query.set("keyword", values.keyword.trim()); query.delete("page");
    navigate("#/posts?" + query.toString()); return;
  }
  if ((type === "post" || type === "profile") && Number(form.dataset.uploads || 0) > 0) {
    $('[data-form-error]', form).textContent = "图片正在上传，请完成后再保存。";
    return;
  }
  const submit = $('button[type="submit"]', form);
  const original = submit.textContent;
  const errorArea = $('[data-form-error]', form); errorArea.textContent = "";
  submit.disabled = true; submit.textContent = "正在保存…";
  try {
    if (type === "auth") {
      const data = await api("/api/auth/login", {method:"POST", body:values});
      state.user = data.user; state.token = data.token;
      const target = state.pendingHash || location.hash || "#/posts"; state.pendingHash = "";
      renderAccount(); $("#authDialog").close(); toast("已登录课堂演示账号"); navigate(target);
    } else if (type === "post") {
      values.category_id = Number(values.category_id);
      values.tags = values.tags.split(/[,，]/).map(x => x.trim()).filter(Boolean);
      const data = await api("/api/posts" + (form.dataset.id ? "/" + form.dataset.id : ""), {method:form.dataset.id ? "PUT" : "POST", body:values});
      toast(form.dataset.id ? "修改已保存" : "文章已发布"); navigate("#/post/" + data.item.id);
    } else if (type === "profile") {
      const data = await api("/api/me", {method:"PUT", body:values}); state.user = data.user; renderAccount(); toast("个人资料已更新"); renderProfile();
    } else if (type === "category") {
      const data = await api("/api/categories" + (form.dataset.id ? "/" + form.dataset.id : ""), {method:form.dataset.id ? "PUT" : "POST", body:values});
      await openCategories(); refreshCategorySelect(data.item.id); toast("分类已保存");
    }
  } catch (error) { errorArea.textContent = error.message; }
  finally { submit.disabled = false; submit.textContent = original; }
});
document.addEventListener("input", event => {
  if (event.target.id === "contentInput") {
    $("#charCount").textContent = event.target.value.length + " / 50000 字符";
    clearTimeout(state.previewTimer); const content = event.target.value;
    state.previewTimer = setTimeout(() => updatePreview(content), 320);
  }
});
document.addEventListener("change", async event => {
  const input = event.target.closest("input[data-upload]"); if (!input || !input.files[0]) return;
  const file = input.files[0];
  if (file.size > 5 * 1024 * 1024) { toast("图片不能超过 5 MB，请压缩后重试。", true); input.value = ""; return; }
  const form = input.closest("form");
  const submit = form ? $('button[type="submit"]', form) : null;
  if (form) form.dataset.uploads = String(Number(form.dataset.uploads || 0) + 1);
  input.disabled = true;
  if (submit) submit.disabled = true;
  try {
    toast("正在上传图片…");
    const data = new FormData(); data.append("file", file);
    const result = await api("/api/uploads", {method:"POST", body:data});
    if (!form?.isConnected) { toast("图片上传完成；页面已切换，当前表单未作更改。"); return; }
    if (input.dataset.upload === "cover" && $("#coverValue", form)) {
      $("#coverValue", form).value = result.url; $("#coverPreview", form).innerHTML = '<img src="' + esc(result.url) + '" alt="封面预览">';
    } else if (input.dataset.upload === "avatar" && $("#avatarValue", form)) {
      $("#avatarValue", form).value = result.url; $("#avatarPreview", form).innerHTML = avatar({username:state.user?.username || "纸",avatar:result.url}, true);
    }
    toast("图片已上传，记得保存表单。");
  } catch (error) { toast(error.message, true); }
  finally { if (form) form.dataset.uploads = String(Math.max(0, Number(form.dataset.uploads || 0) - 1)); input.disabled = false; input.value = ""; if (submit && Number(form.dataset.uploads || 0) === 0) submit.disabled = false; }
});
for (const id of ["authDialog", "categoryDialog"]) {
  $("#" + id).addEventListener("click", event => { if (event.target === event.currentTarget) event.currentTarget.close(); });
}
$("#authDialog").addEventListener("close", () => { state.pendingHash = ""; });
window.addEventListener("hashchange", route);
(async function start() {
  renderAccount();
  if (state.token) {
    try { state.user = (await api("/api/me")).user; renderAccount(); }
    catch { state.token = ""; renderAccount(); }
  }
  await route();
})();
