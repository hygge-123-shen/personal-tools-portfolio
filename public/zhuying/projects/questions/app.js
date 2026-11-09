const state = {token: window.ZhuyingDemo.getSession()?.token || '', user: null, sort: 'latest', tag: '', keyword: '', page: 1, qid: null, answerPage: 1, detail: null, community: null, loadId: 0};
const $ = (selector, root = document) => root.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const date = value => { const d = new Date(value); return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('zh-CN', {month: 'short', day: 'numeric'}); };
const avatar = (name, image = '') => `<i class="avatar">${image ? `<img src="${esc(image)}" alt="" loading="lazy">` : esc((name || '问').slice(0, 1))}</i>`;
function toast(message, error = false) { const box = $('#toast'); box.textContent = message; box.classList.toggle('error', error); box.classList.add('visible'); clearTimeout(toast.timer); toast.timer = setTimeout(() => box.classList.remove('visible'), 3200); }
async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (state.token) headers.set('Authorization', 'Bearer ' + state.token);
  let response;
  try { response = await CourseClassroom.request(path, {...options, headers}); }
  catch { throw new Error('课堂演示未加载，请刷新页面后重试。'); }
  let payload = {};
  try { payload = await response.json(); } catch { throw new Error('服务返回了无法读取的结果，请稍后重试'); }
  if (!response.ok) {
    if (response.status === 401 && state.token) { state.token = ''; state.user = null; renderAuth(); }
    throw new Error(payload.error || '请求未能完成，请稍后重试');
  }
  return payload;
}
function renderAuth() { $('#authArea').innerHTML = state.user ? `<button class="user-button" data-action="profile">${avatar(state.user.display_name || state.user.username, state.user.avatar)}<span class="user-label">${esc(state.user.display_name || state.user.username)}<small>${state.user.points} 积分</small></span></button>` : '<button class="button secondary" data-action="login">课堂登录</button>'; }
async function refreshUser() { if (state.token) { state.user = (await api('/api/me')).user; } renderAuth(); }
function requireUser() { if (state.user) return true; openAuth(); return false; }
function closeDialog() { const dialog = $('#appDialog'); if (dialog) { dialog.close(); dialog.remove(); } }
function openDialog(title, subtitle, content) {
  closeDialog(); document.body.insertAdjacentHTML('beforeend', `<dialog id="appDialog" aria-labelledby="dialogTitle"><div class="dialog-inner"><div class="dialog-head"><div><h2 id="dialogTitle">${esc(title)}</h2><p>${esc(subtitle)}</p></div><button class="close-button" data-action="close" aria-label="关闭">×</button></div>${content}</div></dialog>`);
  const dialog = $('#appDialog'); dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(); }); dialog.showModal();
}
function openAuth() {
  openDialog('登录课堂演示账号', '登录后可以提问、回答或赞同示例讨论。', `<form data-form="login"><div class="form-field"><label for="authUsername">演示账号</label><input id="authUsername" name="username" value="${esc(window.ZhuyingDemo.USERNAME)}" autocomplete="username" required></div><div class="form-field"><label for="authPassword">演示密码</label><input id="authPassword" name="password" type="password" autocomplete="current-password" required></div><div class="inline-error" role="alert"></div><div class="form-bottom"><button class="button" type="submit">登录</button></div></form>`);
}
function editor(name, label, minLength) { return `<div class="editor-grid"><div class="editor-pane"><div class="editor-label"><span>${esc(label)}</span><span>Markdown</span></div><textarea name="${name}" data-preview-input required minlength="${minLength}" maxlength="20000" aria-label="${esc(label)}" placeholder="描述背景、已经尝试过的办法，或写下一段代码…"></textarea></div><div class="editor-pane"><div class="editor-label"><span>实时预览</span><span>PREVIEW</span></div><div class="preview markdown" data-preview><p class="preview-placeholder">你写下的内容会在这里排版。</p></div></div></div>`; }
function openQuestionComposer() { if (!requireUser()) return; openDialog('提出一个好问题', '写清问题背景和尝试过程，更容易得到有用的回答。', `<form data-form="question"><div class="form-field"><label for="questionTitle">问题标题</label><input id="questionTitle" name="title" required minlength="5" maxlength="120" placeholder="用一句话说清你想解决的问题"></div><div class="form-field"><label>问题描述</label>${editor('content', '编辑描述', 10)}</div><div class="form-field"><label for="questionTags">标签</label><input id="questionTags" name="tags" maxlength="200" placeholder="例如：MySQL, API, 全栈入门"><p class="form-hint">用逗号分隔，最多 8 个标签，每个不超过 24 字。</p></div><div class="inline-error" role="alert"></div><div class="form-bottom"><small>发布将扣除 5 积分 · 当前 ${state.user.points} 积分</small><button class="button" type="submit">发布问题</button></div></form>`); }
function openProfile() {
  if (!requireUser()) return;
  const user = state.user;
  openDialog('课堂演示账号', '体验记录和积分保存在当前浏览器。', '<div class="profile-summary">' + avatar(user.display_name || user.username) + '<b>' + user.points + '</b><span>社区积分</span></div><button type="button" class="button danger" data-action="logout">退出登录</button>');
}
function tagButtons(tags) { return `<span class="tags">${(tags || []).map(tag => `<button class="tag ${state.tag === tag ? 'active' : ''}" data-action="tag" data-tag="${esc(tag)}">${esc(tag)}</button>`).join('')}</span>`; }
function pagination(page, size, total, action) {
  const pages = Math.max(1, Math.ceil(total / size));
  if (pages === 1) return total ? `<div class="pagination"><span>共 ${total} 条 · 已显示全部</span></div>` : '';
  const numbers = [...new Set([1, ...Array.from({length: 5}, (_, i) => page - 2 + i).filter(n => n > 0 && n <= pages), pages])].sort((a, b) => a - b);
  let last = 0;
  const controls = numbers.map(n => { const gap = n - last > 1 ? '<span style="padding:0 3px">…</span>' : ''; last = n; return gap + `<button class="page-button ${n === page ? 'active' : ''}" data-action="${action}" data-page="${n}" ${n === page ? 'aria-current="page"' : ''}>${n}</button>`; }).join('');
  return `<div class="pagination"><span>共 ${total} 条 · 第 ${page} / ${pages} 页</span><div class="pagination-buttons"><button class="page-button arrow" data-action="${action}" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}>上一页</button>${controls}<button class="page-button arrow" data-action="${action}" data-page="${page + 1}" ${page >= pages ? 'disabled' : ''}>下一页</button></div></div>`;
}
function renderQuestionCard(q) { return `<article class="question-card"><div class="question-numbers"><div class="number-box"><strong>${q.votes}</strong>点赞</div><div class="number-box answer ${q.is_solved ? 'solved' : ''}"><strong>${q.answers_count}</strong>${q.is_solved ? '已解决' : '回答'}</div></div><div class="question-summary"><a class="question-title" href="#question/${q.id}">${esc(q.title)}</a><p class="excerpt">${esc(q.content.replace(/[#*`>]/g, ''))}</p><div class="question-foot">${tagButtons(q.tags)}<span class="author-meta">${avatar(q.author, q.author_avatar)}${esc(q.author)}<span>· ${date(q.created_at)}</span></span></div></div></article>`; }
function renderList(data) {
  const tabs = [['latest', '最新问题'], ['hot', '热门讨论'], ['unsolved', '待解决']];
  $('#main').innerHTML = `<section class="intro"><div class="kicker">A LITTLE CURIOSITY, A LOT OF POSSIBILITY</div><div class="intro-bottom"><div><h1>让每个好问题，<em>都有回响。</em></h1><p>从一个卡住的地方开始，和同行的人一起弄懂。</p></div><span class="intro-decoration" aria-hidden="true">?+</span></div></section><section class="feed" aria-label="问题列表"><div class="feed-toolbar"><div class="tabs">${tabs.map(([key, name]) => `<button class="tab ${state.sort === key ? 'active' : ''}" data-action="sort" data-sort="${key}">${name}</button>`).join('')}</div><span class="feed-count">${data.total} 个好问题</span></div>${state.tag || state.keyword ? `<div class="filters"><span>当前筛选</span>${state.tag ? `<button class="filter-value" data-action="clear-tag"># ${esc(state.tag)} ×</button>` : ''}${state.keyword ? `<button class="filter-value" data-action="clear-search">${esc(state.keyword)} ×</button>` : ''}<button class="tag" data-action="clear-filters">清除全部</button></div>` : ''}${data.items.length ? data.items.map(renderQuestionCard).join('') : '<div class="empty"><b>还没有找到这样的好问题</b>试试其他关键词，或者成为第一个提问的人。<br><button class="button secondary" data-action="compose">提出你的问题</button></div>'}${pagination(data.page, data.pageSize, data.total, 'page')}</section>`;
}
async function loadList() {
  const marker = ++state.loadId; state.qid = null; state.detail = null;
  $('#main').innerHTML = '<div class="loading">正在寻找好问题…</div>';
  try { const query = new URLSearchParams({page: state.page, pageSize: 10, sort: state.sort, tag: state.tag, keyword: state.keyword}); const data = await api('/api/questions?' + query); if (marker === state.loadId) renderList(data); }
  catch (e) { if (marker === state.loadId) $('#main').innerHTML = `<div class="empty"><b>问题暂时没有加载成功</b>${esc(e.message)}<br><button class="button secondary" data-action="reload">重新加载</button></div>`; }
}
function voteButton(kind, item) { return state.user && state.user.id === item.author_id ? '<span class="self-note">这是你的分享</span>' : `<button class="vote-button ${item.liked ? 'liked' : ''}" data-action="vote" data-kind="${kind}" data-id="${item.id}" aria-pressed="${item.liked}">${item.liked ? '已点赞' : '赞同'} · ${item.votes}</button>`; }
function renderDetail(data) {
  const q = data.item; state.detail = q;
  const canAccept = state.user && state.user.id === q.author_id && !q.is_solved;
  const answers = data.answers.map(a => `<article class="answer-card ${a.is_accepted ? 'accepted' : ''}" id="answer-${a.id}"><div class="answer-author">${avatar(a.author, a.author_avatar)}<div><div class="name">${esc(a.author)}</div><div class="points">${a.author_points} 积分</div></div><time>${date(a.created_at)}</time></div>${a.is_accepted ? '<p class="solved-label">✓ 提问者已采纳 · 最佳答案</p>' : ''}<div class="markdown">${a.content_html}</div><div class="detail-actions">${voteButton('answer', a)}${canAccept ? `<button class="accept-button" data-action="accept" data-id="${a.id}">采纳为最佳答案</button>` : ''}</div></article>`).join('');
  $('#main').innerHTML = `<a href="#questions" class="back-link">← 返回问题广场</a><article class="detail-card"><div class="detail-heading">${q.is_solved ? '<span class="solved-label">✓ 已解决</span>' : '<span class="tag">等待一个好答案</span>'}<h1>${esc(q.title)}</h1><div class="detail-meta">${avatar(q.author, q.author_avatar)}<span>${esc(q.author)}</span><span>提问于 ${date(q.created_at)}</span><span>·</span><span>${q.views} 次浏览</span></div></div><div class="detail-body markdown">${q.content_html}</div><div class="detail-actions">${voteButton('question', q)}${tagButtons(q.tags)}</div></article><section id="answers"><div class="answers-heading"><h2>${q.answers_count} 个回答</h2><span>采纳优先，其次按赞同数排列</span></div>${answers || '<div class="answer-card empty"><b>你的经验，或许正是这里需要的</b>写下第一个回答，一起向前一步。</div>'}${data.answerTotal > data.answerPageSize ? pagination(data.answerPage, data.answerPageSize, data.answerTotal, 'answer-page') : ''}</section>${state.user ? `<section class="answer-compose"><h2>写下你的回答</h2><p class="muted">分享思路、关键步骤，或一段真正有帮助的代码。</p><form data-form="answer" data-id="${q.id}">${editor('content', '编辑回答', 5)}<div class="inline-error" role="alert"></div><div class="form-bottom"><small>认真回答可以获得 10 积分</small><button class="button" type="submit">发布回答</button></div></form></section>` : '<section class="login-prompt"><p>把你知道的分享出来，让这个问题多一种可能。</p><button class="button secondary" data-action="login">登录后回答</button></section>'}`;
}
async function loadDetail(qid, countView = true) {
  const marker = ++state.loadId; state.qid = Number(qid);
  $('#main').innerHTML = '<div class="loading">正在打开这场讨论…</div>';
  try { const data = await api(`/api/questions/${state.qid}?answerPage=${state.answerPage}&answerPageSize=10&view=${countView ? 1 : 0}`); if (marker === state.loadId) renderDetail(data); }
  catch (e) { if (marker === state.loadId) $('#main').innerHTML = `<a href="#questions" class="back-link">← 返回问题广场</a><div class="empty"><b>暂时无法打开这个问题</b>${esc(e.message)}</div>`; }
}
function renderSidebar() {
  const c = state.community;
  if (!c) return;
  const {stats, leaders, tags} = c;
  $('#sidebar').innerHTML = `<section class="side-card join-card"><div class="side-kicker">ASK · THINK · SHARE</div><h2>一个人的疑问，<br>一群人的灵感。</h2><p>带上问题和好奇心。<br>这里欢迎每一步认真尝试。</p><button class="button" data-action="compose">＋ 我要提问</button></section><section class="side-card"><h2 class="side-title">一起成长的社区 <span>COMMUNITY</span></h2><div class="community-stats"><div><b>${stats.questions}</b><small>好问题</small></div><div><b>${stats.answers}</b><small>经验分享</small></div><div><b>${stats.solved}</b><small>已被解决</small></div><div><b>${stats.members}</b><small>同行伙伴</small></div></div></section><section class="side-card"><h2 class="side-title">从兴趣开始 <span>TOPICS</span></h2><div class="side-tags">${tags.map(t => `<button class="tag ${state.tag === t.name ? 'active' : ''}" data-action="tag" data-tag="${esc(t.name)}">${esc(t.name)}<small>${t.count}</small></button>`).join('') || '<span class="muted">还没有标签</span>'}</div></section><section class="side-card"><h2 class="side-title">谢谢这些分享者 <span>CONTRIBUTORS</span></h2>${leaders.map((u, i) => `<div class="leader"><span class="leader-rank">${i + 1}</span>${avatar(u.username, u.avatar)}<span class="leader-name">${esc(u.username)}</span><span class="leader-points">${u.points} 分</span></div>`).join('')}</section><section class="side-card rules"><h2 class="side-title">小小的积分约定</h2><p>提问 −5 · 回答 +10</p><p>答案被采纳 +30</p><p>问题获赞 +5 · 回答获赞 +10</p><p>取消点赞会撤回对应积分。</p></section><p class="side-note"><b>先尝试，再提问。</b><br>描述你做过什么、期待什么、遇到了什么，让讨论从清楚的地方开始。</p>`;
}
async function loadCommunity() { try { state.community = await api('/api/community'); renderSidebar(); } catch { $('#sidebar').innerHTML = '<div class="side-card muted">社区信息暂时不可用，稍后刷新试试。</div>'; } }
function goList() { if (location.hash !== '#questions') location.hash = '#questions'; else loadList(); renderSidebar(); }
function route() { const match = location.hash.match(/^#question\/(\d+)$/); if (match) { if (state.qid !== Number(match[1])) state.answerPage = 1; loadDetail(Number(match[1])); } else loadList(); }
function viewingQuestion(qid) { return state.qid === Number(qid) && location.hash === '#question/' + Number(qid); }
async function refreshDiscussion(qid) { await refreshUser(); if (viewingQuestion(qid)) await loadDetail(qid, false); await loadCommunity(); }

document.addEventListener('click', async event => {
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  const action = button.dataset.action;
  try {
    if (action === 'login') openAuth();
    else if (action === 'auth-tab') openAuth(button.dataset.mode);
    else if (action === 'close') closeDialog();
    else if (action === 'compose') openQuestionComposer();
    else if (action === 'profile') openProfile();
    else if (action === 'logout') { window.ZhuyingDemo.logout(); state.user = null; state.token = ''; closeDialog(); renderAuth(); if (state.qid) await loadDetail(state.qid, false); toast('已退出登录'); }
    else if (action === 'sort') { state.sort = button.dataset.sort; state.page = 1; goList(); }
    else if (action === 'tag') { state.tag = button.dataset.tag; state.page = 1; goList(); }
    else if (action === 'clear-tag') { state.tag = ''; state.page = 1; goList(); }
    else if (action === 'clear-search') { state.keyword = ''; $('#search').value = ''; state.page = 1; goList(); }
    else if (action === 'clear-filters') { state.tag = ''; state.keyword = ''; $('#search').value = ''; state.page = 1; goList(); }
    else if (action === 'page') { state.page = Number(button.dataset.page); await loadList(); $('#main').scrollIntoView({behavior: 'smooth'}); }
    else if (action === 'answer-page') { state.answerPage = Number(button.dataset.page); await loadDetail(state.qid, false); $('#answers')?.scrollIntoView({behavior: 'smooth'}); }
    else if (action === 'reload') { if (state.qid) await loadDetail(state.qid, false); else await loadList(); }
    else if (action === 'vote') {
      if (!requireUser()) return; button.disabled = true; const discussionId = state.qid;
      const kind = button.dataset.kind === 'question' ? 'questions' : 'answers';
      const result = await api(`/api/${kind}/${button.dataset.id}/vote`, {method: 'POST', body: '{}'});
      toast(result.liked ? '已赞同这份分享' : '已取消赞同'); await refreshDiscussion(discussionId);
    } else if (action === 'accept') {
      if (!requireUser() || !confirm('确定把这个回答采纳为最佳答案吗？每个问题只能采纳一个答案。')) return;
      button.disabled = true; const discussionId = state.qid; const result = await api(`/api/answers/${button.dataset.id}/accept`, {method: 'POST', body: '{}'}); toast(result.message); await refreshDiscussion(discussionId);
    } else if (action === 'upload-avatar') {
      const file = $('#avatarUpload').files[0]; if (!file) throw new Error('请先选择一张图片');
      button.disabled = true; const field = $('#profileAvatar'); const submit = $('[type=submit]', field.closest('form')); submit.disabled = true;
      try { const form = new FormData(); form.append('file', file); const result = await api('/api/uploads', {method: 'POST', body: form}); if (field.isConnected) { field.value = result.url; toast('头像已上传，保存资料后生效'); } }
      finally { if (submit.isConnected) submit.disabled = false; }
    }
  } catch (e) { toast(e.message, true); }
  finally { if (button.isConnected) button.disabled = false; }
});

document.addEventListener('submit', async event => {
  const form = event.target.closest('form[data-form]'); if (!form) return;
  event.preventDefault(); const values = Object.fromEntries(new FormData(form)); const type = form.dataset.form;
  const submit = $('[type=submit]', form); if (submit.disabled) return; submit.disabled = true;
  const error = $('.inline-error', form); if (error) error.textContent = '';
  try {
    if (type === 'login') {
      const result = await api('/api/auth/' + type, {method: 'POST', body: JSON.stringify(values)});
      state.token = result.token; await refreshUser(); closeDialog(); toast('已登录课堂演示账号');
      if (state.qid) await loadDetail(state.qid, false); else await loadList(); await loadCommunity();
    } else if (type === 'question') {
      values.tags = values.tags.split(/[,，]/).map(t => t.trim()).filter(Boolean);
      const result = await api('/api/questions', {method: 'POST', body: JSON.stringify(values)}); closeDialog(); toast(result.message); await refreshUser(); await loadCommunity(); state.answerPage = 1; location.hash = '#question/' + result.id;
    } else if (type === 'answer') {
      const discussionId = Number(form.dataset.id); const oldTotal = state.detail?.id === discussionId ? state.detail.answers_count : 0;
      const result = await api(`/api/questions/${discussionId}/answers`, {method: 'POST', body: JSON.stringify(values)}); toast(result.message); if (viewingQuestion(discussionId)) state.answerPage = Math.floor(oldTotal / 10) + 1; await refreshDiscussion(discussionId); if (viewingQuestion(discussionId)) $('#answers')?.scrollIntoView({behavior: 'smooth'});
    } else if (type === 'profile') {
      state.user = (await api('/api/me', {method: 'PUT', body: JSON.stringify(values)})).user; closeDialog(); renderAuth(); toast('个人资料已保存');
      if (state.qid) await loadDetail(state.qid, false); else await loadList(); await loadCommunity();
    }
  } catch (e) { if (error?.isConnected) error.textContent = e.message; toast(e.message, true); }
  finally { if (submit.isConnected) submit.disabled = false; }
});

let searchTimer, previewTimer, previewRevision = 0;
document.addEventListener('input', event => {
  if (event.target.id === 'search') { clearTimeout(searchTimer); state.keyword = event.target.value.trim(); state.page = 1; searchTimer = setTimeout(goList, 320); }
  if (event.target.matches('[data-preview-input]')) {
    clearTimeout(previewTimer); const textarea = event.target; const value = textarea.value; const preview = $('[data-preview]', textarea.closest('.editor-grid')); const revision = ++previewRevision;
    previewTimer = setTimeout(async () => {
      if (!value.trim()) { preview.innerHTML = '<p class="preview-placeholder">你写下的内容会在这里排版。</p>'; return; }
      try { const result = await api('/api/preview', {method: 'POST', body: JSON.stringify({content: value})}); if (revision === previewRevision && preview.isConnected) preview.innerHTML = result.html; }
      catch (e) { if (revision === previewRevision && preview.isConnected) preview.textContent = '预览暂时不可用：' + e.message; }
    }, 350);
  }
});
window.addEventListener('hashchange', () => { clearTimeout(searchTimer); route(); window.scrollTo({top: 0, behavior: 'smooth'}); });
(async () => { renderAuth(); try { if (state.token) await refreshUser(); } catch { state.user = null; renderAuth(); } await loadCommunity(); route(); })();
