const $ = (selector, root = document) => root.querySelector(selector);
const root = $('#view-root');
const modalRoot = $('#modal-root');
const USER = '我';
const labels = { home: '发现灵感', tasks: '创作任务', gallery: '作品广场', mine: '我的创作' };
let state = { view: 'home', tasks: [], works: [], category: '全部', query: '' };
let toastTimer;

const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
async function api(path, options = {}) {
  return workshopLocalApi(path, options);
}
function toast(message) {
  const node = $('#toast'); node.textContent = message; node.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => node.classList.remove('show'), 2600);
}
function taskById(id) { return state.tasks.find(task => task.id === id); }
function setView(view) {
  state.view = view; state.query = ''; state.category = '全部';
  document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === view));
  $('#current-section').textContent = labels[view];
  render();
}
function taskCard(task) {
  return `<article class="task-card" data-task="${esc(task.id)}" tabindex="0" role="button" aria-label="查看${esc(task.title)}任务">
    <div class="task-top"><span class="task-emoji ${esc(task.color)}">${esc(task.emoji)}</span><span class="pill">${esc(task.level)}</span></div>
    <h3>${esc(task.title)}</h3><p>${esc(task.summary)}</p>
    <div class="task-meta"><span>${esc(task.category)}</span><span>◷ ${esc(task.duration)}</span></div>
  </article>`;
}
function homeView() {
  const picks = state.tasks.slice(0, 4);
  const featured = state.works.slice(0, 1)[0];
  return `<section class="hero"><div class="hero-copy"><div class="eyebrow">LEARN · MAKE · SHARE</div><h1>让每一个想法，<br>都成为作品。</h1><p>从一个小小的创意开始，把数智编程的知识用起来。<br>探索任务、动手创作、分享你的灵感。</p><button class="button" data-go="tasks">开启第一个创作 <span>↗</span></button></div><div class="hero-art" aria-hidden="true"><span class="hero-spark one">✳</span><div class="hero-art-core">✣</div><span class="hero-spark two">✦</span></div></section>
    <section><div class="section-heading"><div><div class="eyebrow">START CREATING</div><h2>从这里找到灵感</h2><p>每个任务都藏着一个可以亲手完成的小作品</p></div><button class="text-link" data-go="tasks">查看全部任务　→</button></div><div class="task-grid">${picks.map(taskCard).join('')}</div></section>
    <section class="home-bottom"><div class="highlight-panel"><div class="eyebrow">CREATOR'S NOTE</div><h3>把知识，变成看得见的创意</h3><p>不需要一步到位。先试着做出一个小作品，再慢慢加上自己的想法。</p><div class="mini-stat"><span class="stat-number">${state.works.length}</span><span class="stat-copy">件创意作品<br>已经在这里分享</span></div><span class="highlight-decoration">✳</span></div><div class="highlight-panel"><div class="eyebrow">本周灵感</div><h3>${featured ? esc(featured.title) : '你的作品会成为下一份灵感'}</h3><p>${featured ? esc(featured.description) : '完成创作并发布，和大家分享你从课程里学到的新点子。'}</p><button class="text-link" data-go="gallery">去作品广场看看　→</button><span class="highlight-decoration">✦</span></div></section>`;
}
function tasksView() {
  const categories = ['全部', '编程基础', '数据应用', '智能应用'];
  const filtered = state.tasks.filter(task => (state.category === '全部' || task.category === state.category) && (!state.query || `${task.title} ${task.summary} ${task.knowledge.join(' ')}`.toLowerCase().includes(state.query.toLowerCase())));
  return `<div class="toolbar"><div class="toolbar-title"><div class="eyebrow">IDEA LIBRARY</div><h1>创作任务</h1><p>选一个方向，用课程知识做出自己的小作品。</p></div><div class="toolbar-actions"><label class="search-box"><span>⌕</span><input id="search-input" placeholder="搜索任务" value="${esc(state.query)}"></label></div></div><div class="filters">${categories.map(c => `<button class="filter-chip ${state.category === c ? 'active' : ''}" data-category="${esc(c)}">${esc(c)}</button>`).join('')}</div><div class="task-grid">${filtered.length ? filtered.map(taskCard).join('') : '<div class="empty-state">⌕<strong>没有找到相关任务</strong><p>换个关键词试试看。</p></div>'}</div>`;
}
function workCard(work, index) {
  const task = taskById(work.taskId);
  const avatar = (work.author || '同').slice(0, 1);
  const tags = work.tags || [];
  return `<article class="work-card"><div class="work-cover tone-${index % 4}" data-work="${esc(work.id)}" role="button" tabindex="0" aria-label="查看${esc(work.title)}"><span class="cover-dots a">✦ · ✦</span><div class="cover-shape">${task ? esc(task.emoji) : '✳'}</div><span class="cover-dots b">· ✧ ·</span></div><div class="work-content" data-work="${esc(work.id)}" role="button" tabindex="0"><h3>${esc(work.title)}</h3><p>${esc(work.description)}</p><div class="tag-row">${tags.slice(0, 3).map(tag => `<span class="tag">${esc(tag)}</span>`).join('') || (task ? `<span class="tag">${esc(task.category)}</span>` : '')}</div></div><div class="work-footer"><div class="author"><span class="author-avatar">${esc(avatar)}</span>${esc(work.author || '同学')}</div><div class="work-actions"><button class="work-action" data-interact="like" data-id="${esc(work.id)}" title="点赞">♡ ${work.likes || 0}</button><button class="work-action" data-interact="favorite" data-id="${esc(work.id)}" title="收藏">☆ ${work.favorites || 0}</button></div></div></article>`;
}
function galleryView(mine = false) {
  const works = mine ? state.works.filter(work => work.author === USER) : state.works;
  return `<div class="toolbar"><div class="toolbar-title"><div class="eyebrow">${mine ? 'YOUR CREATIONS' : 'COMMUNITY GALLERY'}</div><h1>${mine ? '我的创作' : '作品广场'}</h1><p>${mine ? '收藏你的灵感，继续完善每一个小作品。' : '看看同学们把课程知识变成了什么有趣的作品。'}</p></div><div class="toolbar-actions">${mine ? '' : `<label class="search-box"><span>⌕</span><input id="search-input" placeholder="搜索作品" value="${esc(state.query)}"></label>`}<button class="button" data-create>＋ 发布作品</button></div></div><div class="work-grid">${works.length ? works.map(workCard).join('') : `<div class="empty-state">✳<strong>${mine ? '还没有发布作品' : '作品正在等待第一位创作者'}</strong><p>${mine ? '选一个创作任务，把你的想法分享出来吧。' : '成为第一个分享创意的人。'}</p><button class="button" data-create>开始创作</button></div>`}</div>`;
}
async function render() {
  root.innerHTML = '<div class="loading-state">正在准备创作空间…</div>';
  try {
    const [tasks, works] = await Promise.all([api('/api/tasks'), api('/api/works', { query: state.view === 'gallery' ? state.query : '' })]);
    state.tasks = tasks; state.works = works;
    root.innerHTML = state.view === 'home' ? homeView() : state.view === 'tasks' ? tasksView() : galleryView(state.view === 'mine');
  } catch (error) {
    root.innerHTML = `<div class="empty-state"><strong>暂时无法连接到创作工坊</strong><p>${esc(error.message)}。请重新加载本地演示。</p></div>`;
  }
}
function openTask(id) {
  const task = taskById(id); if (!task) return;
  modalRoot.innerHTML = `<div class="modal-backdrop" data-backdrop><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><div><div class="eyebrow">CREATION BRIEF · ${esc(task.category)}</div><h2 id="modal-title">${esc(task.emoji)} ${esc(task.title)}</h2></div><button class="modal-close" data-close aria-label="关闭">×</button></div><p class="modal-copy">${esc(task.summary)}</p><div class="modal-section"><h3>本次会用到</h3><div class="knowledge-list">${task.knowledge.map(k => `<span class="tag">${esc(k)}</span>`).join('')}</div></div><div class="modal-section"><h3>创作步骤</h3><ol class="step-list">${task.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol></div><div class="form-actions"><button class="button secondary" data-close>稍后再说</button><button class="button" data-create-task="${esc(task.id)}">开始创作　↗</button></div></section></div>`;
}
function openCreate(taskId = '') {
  if (!state.tasks.length) return toast('任务列表还没有准备好，请稍后再试');
  const options = state.tasks.map(t => `<option value="${esc(t.id)}" ${t.id === taskId ? 'selected' : ''}>${esc(t.title)}</option>`).join('');
  modalRoot.innerHTML = `<div class="modal-backdrop" data-backdrop><section class="modal wide" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><div><div class="eyebrow">SHARE YOUR IDEA</div><h2 id="modal-title">发布一个新作品</h2></div><button class="modal-close" data-close aria-label="关闭">×</button></div><form id="create-form"><div class="field"><label for="work-title">作品名称</label><input id="work-title" name="title" maxlength="80" placeholder="给你的创意起个名字" required></div><div class="field"><label for="work-task">关联创作任务</label><select id="work-task" name="taskId" required>${options}</select></div><div class="field"><label for="work-description">作品介绍</label><textarea id="work-description" name="description" maxlength="1200" placeholder="它解决了什么问题？你用了哪些课程知识？" required></textarea></div><div class="field"><label for="work-link">作品链接 <span class="field-hint">（选填）</span></label><input id="work-link" name="link" type="url" placeholder="https://..."><span class="field-hint">可粘贴在线作品或演示页面地址。</span></div><div class="form-actions"><button type="button" class="button secondary" data-close>取消</button><button class="button" type="submit">发布作品　↗</button></div></form></section></div>`;
}
function openWork(id) {
  const work = state.works.find(item => item.id === id); if (!work) return;
  const task = taskById(work.taskId);
  modalRoot.innerHTML = `<div class="modal-backdrop" data-backdrop><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><div><div class="eyebrow">COMMUNITY CREATION</div><h2 id="modal-title">${esc(work.title)}</h2></div><button class="modal-close" data-close aria-label="关闭">×</button></div><p class="modal-copy">${esc(work.description)}</p><div class="modal-section"><h3>创作信息</h3><p class="modal-copy">作者：${esc(work.author)}　·　任务：${task ? esc(task.title) : '自由创作'}</p><div class="knowledge-list">${(work.tags || []).map(tag => `<span class="tag">${esc(tag)}</span>`).join('')}</div></div>${work.link ? `<div class="form-actions"><a class="button" href="${esc(work.link)}" target="_blank" rel="noopener noreferrer">打开作品链接 ↗</a></div>` : ''}</section></div>`;
}

document.addEventListener('click', async event => {
  const nav = event.target.closest('[data-view]'); if (nav) return setView(nav.dataset.view);
  const go = event.target.closest('[data-go]'); if (go) return setView(go.dataset.go);
  const category = event.target.closest('[data-category]'); if (category) { state.category = category.dataset.category; return render(); }
  const task = event.target.closest('[data-task]'); if (task) return openTask(task.dataset.task);
  const start = event.target.closest('[data-create-task]'); if (start) { const id = start.dataset.createTask; openCreate(id); return; }
  if (event.target.closest('[data-create]')) return openCreate();
  const work = event.target.closest('[data-work]'); if (work) return openWork(work.dataset.work);
  const interaction = event.target.closest('[data-interact]');
  if (interaction) {
    try { await api(`/api/works/${encodeURIComponent(interaction.dataset.id)}/${interaction.dataset.interact}`, { method: 'POST', body: JSON.stringify({ user: USER }) }); await render(); }
    catch (error) { toast(error.message); }
    return;
  }
  if (event.target.matches('[data-close]') || event.target.matches('[data-backdrop]')) modalRoot.innerHTML = '';
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') modalRoot.innerHTML = '';
  if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-task], [data-work]')) { event.preventDefault(); event.target.click(); }
});
document.addEventListener('input', event => {
  if (event.target.id !== 'search-input') return;
  state.query = event.target.value;
  const cursor = state.query.length;
  render().then(() => { const input = $('#search-input'); if (input) { input.focus(); input.setSelectionRange(cursor, cursor); } });
});
document.addEventListener('submit', async event => {
  if (event.target.id !== 'create-form') return;
  event.preventDefault();
  const form = new FormData(event.target);
  const payload = Object.fromEntries(form.entries()); payload.author = USER;
  const submit = event.target.querySelector('[type="submit"]'); submit.disabled = true; submit.textContent = '正在发布…';
  try { await api('/api/works', { method: 'POST', body: JSON.stringify(payload) }); modalRoot.innerHTML = ''; toast('作品发布成功，继续保持创作！'); setView('mine'); }
  catch (error) { toast(error.message); submit.disabled = false; submit.textContent = '发布作品　↗'; }
});
$('#today-label').textContent = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date());
render();
