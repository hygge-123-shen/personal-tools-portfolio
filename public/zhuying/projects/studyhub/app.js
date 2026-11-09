const state = {
  tab: "posts",
  token: "",
  user: null,
  sort: "latest",
  category: "",
  keyword: "",
  searchTimer: null
};
const $ = (selector, root=document) => root.querySelector(selector);
const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const stamp = value => {
  if (!value) return "刚刚";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "刚刚";
  return new Intl.DateTimeFormat("zh-CN",{month:"short",day:"numeric"}).format(d);
};
const initials = name => esc((name || "知").slice(0,1));
function toast(message, error=false) {
  const el=$("#toast"); el.textContent=message; el.classList.toggle("error",error); el.classList.add("show");
  clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove("show"),2500);
}
async function api(path, options={}) {
  return window.StudyHubDemo.request(path, options, state.token);
}
function syncAccount() {
  const session=window.ZhuyingDemo?.getSession();
  state.token=session?.token || "";
  state.user=session?.user || null;
  renderAccount();
}
function setAuth(payload) {
  state.token=payload.token; state.user=payload.user;
  renderAccount();
  toast("已进入课堂演示");
}
function logout() {
  window.ZhuyingDemo.logout();
  syncAccount();
  updateCartCount();
  toast("已退出登录");
}
function renderAccount() {
  const area=$("#accountArea");
  const name=state.user?.display_name || state.user?.username;
  area.innerHTML=state.user
    ? '<button class="user-pill" data-action="profile"><span class="avatar">'+initials(name)+'</span><span>'+esc(name)+'</span></button>'
    : '<button class="button button-dark" data-action="login">演示登录</button>';
}
function openDialog(title, subtitle, content) {
  closeDialog();
  document.body.insertAdjacentHTML("beforeend",'<dialog id="appDialog"><div class="dialog-wrap"><div class="dialog-head"><div><h2>'+esc(title)+'</h2><p>'+esc(subtitle||"")+'</p></div><button class="close-button" data-action="close-dialog" aria-label="关闭">×</button></div>'+content+'</div></dialog>');
  const dialog=$("#appDialog"); dialog.addEventListener("click",e=>{if(e.target===dialog)closeDialog();}); dialog.showModal();
}
function closeDialog() {
  const dialog=$("#appDialog");
  if(dialog){dialog.close();dialog.remove();}
}
function requireLogin() {
  if(window.ZhuyingDemo?.isAuthorized(state.token)) return true;
  syncAccount();
  if(state.user) return true;
  openAuth();
  return false;
}
function openAuth() {
  openDialog("课堂演示登录", "登录后可以用示例内容体验互动，记录只保存在当前浏览器。",
    '<form data-form="login">'+
    '<div class="field"><label for="demoUser">演示账号</label><input id="demoUser" name="username" autocomplete="off" required maxlength="254"></div>'+
    '<div class="field"><label for="demoPassword">演示密码</label><input id="demoPassword" name="password" type="password" autocomplete="off" required></div>'+
    '<div class="form-bottom"><small>请使用收到的课堂演示账号和密码</small><button class="button button-primary" type="submit">进入知识岛</button></div></form>');
}
function postForm() {
  return '<form data-form="post"><div class="field"><label>文章标题</label><input name="title" required maxlength="100" placeholder="这次学会了什么？"></div>'+
    '<div class="form-grid"><div class="field"><label>分类</label><select name="category"><option>学习笔记</option><option>开发工具</option><option>项目方法</option><option>微信小程序</option></select></div>'+
    '<div class="field"><label>标签（逗号分隔）</label><input name="tags" placeholder="全栈, 实践"></div></div>'+
    '<div class="field"><label>正文</label><textarea name="content" required maxlength="12000" placeholder="写下过程、代码思路或你想留给下一个人的提醒…"></textarea></div>'+
    '<div class="form-bottom"><small>请填写示例内容</small><button class="button button-primary">发布文章</button></div></form>';
}
function questionForm() {
  return '<form data-form="question"><div class="field"><label>问题标题</label><input name="title" required maxlength="120" placeholder="你卡在哪一步？"></div>'+
    '<div class="field"><label>问题描述</label><textarea name="content" required maxlength="10000" placeholder="补充你尝试过的办法和看到的现象…"></textarea></div>'+
    '<div class="field"><label>标签（逗号分隔）</label><input name="tags" placeholder="Git, 数据库"></div>'+
    '<div class="form-bottom"><small>请填写示例内容</small><button class="button button-primary">发布问题</button></div></form>';
}
function sectionTitle() {
  return state.tab==="posts"?"灵感文章":state.tab==="questions"?"问答广场":"资源集市";
}
function setTab(tab) {
  state.tab=tab; state.category=""; state.keyword=""; state.sort="latest";
  document.querySelectorAll(".nav-link").forEach(x=>x.classList.toggle("active",x.dataset.tab===tab));
  $("#sectionTitle").textContent=sectionTitle();
  loadActive();
}
function controls() {
  if(state.tab==="posts") return '<div class="section-tools"><label class="search-box"><span>⌕</span><input id="searchPosts" value="'+esc(state.keyword)+'" placeholder="搜索文章"></label><button class="button button-dark" data-action="compose">＋ 写一篇</button></div>';
  if(state.tab==="questions") return '<div class="section-tools"><button class="button button-dark" data-action="compose">＋ 提个问</button></div>';
  return '<div class="section-tools"><button class="button button-light" data-action="orders">我的订单</button><button class="button button-dark" data-action="cart">购物车</button></div>';
}
function tagsHtml(items) {
  return '<span class="tag-list">'+(items||[]).slice(0,4).map(t=>'<span class="tag"># '+esc(t)+'</span>').join("")+'</span>';
}
function renderPosts(data) {
  const categories=["全部",...(data.categories||[])];
  const filters='<div class="filter-row">'+categories.map(c=>'<button class="filter-chip '+((c==="全部"?!state.category:state.category===c)?"active":"")+'" data-action="category" data-value="'+esc(c==="全部"?"":c)+'">'+esc(c)+'</button>').join("")+'</div>';
  const cards=(data.items||[]).map(p=>'<article class="post-card" data-action="post-detail" data-id="'+p.id+'"><div class="post-meta"><span class="category-label">'+esc(p.category)+'</span><span>'+stamp(p.created_at)+'</span><span>·</span><span>阅读 '+p.views+'</span></div><h3>'+esc(p.title)+'</h3><p class="post-excerpt">'+esc(p.content)+'</p><div class="post-foot"><span class="author"><i class="avatar">'+initials(p.author)+'</i>'+esc(p.author)+'</span>'+tagsHtml(p.tags)+'</div></article>').join("");
  $("#pageContent").innerHTML=filters+(cards||'<div class="empty-state"><b>这里还很安静</b>换个关键词，或者写下第一篇学习笔记吧。</div>');
}
function renderQuestions(data) {
  const sorts=[["latest","最新"],["hot","热门"],["unsolved","待解决"]];
  const tabs='<div class="sort-tabs">'+sorts.map(s=>'<button class="'+(state.sort===s[0]?"active":"")+'" data-action="sort" data-value="'+s[0]+'">'+s[1]+'</button>').join("")+'</div>';
  const cards=(data.items||[]).map(q=>'<article class="question-card"><div class="question-stats"><div class="stat-box"><b>'+q.votes+'</b>点赞</div><div class="stat-box '+(q.is_solved?"solved":"")+'"><b>'+q.answers_count+'</b>'+(q.is_solved?"已解决":"回答")+'</div></div><div><h3 class="question-title" data-action="question-detail" data-id="'+q.id+'">'+esc(q.title)+'</h3><p class="question-desc">'+esc(q.content)+'</p><div class="question-foot"><span class="author"><i class="avatar">'+initials(q.author)+'</i>'+esc(q.author)+' · '+stamp(q.created_at)+'</span>'+tagsHtml(q.tags)+'</div></div></article>').join("");
  $("#pageContent").innerHTML=tabs+(cards||'<div class="empty-state"><b>还没有这个方向的问题</b>提出一个问题，邀请岛上的伙伴一起想办法。</div>');
}
function renderMarket(data) {
  const cards=(data.items||[]).map(p=>'<article class="product-card"><div class="product-visual">'+esc(p.emoji)+'</div><h3>'+esc(p.name)+'</h3><p>'+esc(p.description)+'</p><div class="product-foot"><span class="price">¥ '+Number(p.price).toFixed(2)+' <small>· 库存 '+p.stock+'</small></span><button class="small-add" data-action="add-cart" data-id="'+p.id+'" aria-label="加入购物车">＋</button></div></article>').join("");
  $("#pageContent").innerHTML='<div class="filter-row"><span class="filter-chip active">学习资料</span><span class="filter-chip">工具手册</span><span class="filter-chip">练习卡片</span></div><div class="market-grid">'+(cards||"")+'</div><p class="muted-note">本页面只演示购物车与订单流程，不接入真实支付。</p>';
}
async function updateCartCount() {
  if(!state.user){$("#cartCount").textContent="0";return;}
  try {const d=await api("/api/cart");$("#cartCount").textContent=d.items.reduce((n,x)=>n+x.quantity,0);} catch {}
}
async function loadActive() {
  $("#sectionTitle").textContent=sectionTitle(); $("#sectionActions").innerHTML=controls(); $("#pageContent").innerHTML='<div class="loading">正在加载…</div>';
  try {
    if(state.tab==="posts") renderPosts(await api("/api/posts?keyword="+encodeURIComponent(state.keyword)+"&category="+encodeURIComponent(state.category)));
    else if(state.tab==="questions") renderQuestions(await api("/api/questions?sort="+encodeURIComponent(state.sort)));
    else renderMarket(await api("/api/products"));
    await updateCartCount();
  } catch(e) { $("#pageContent").innerHTML='<div class="empty-state"><b>暂时无法加载</b>'+esc(e.message)+'</div>'; }
}
async function showPost(id) {
  try {
    const d=await api("/api/posts/"+id); const p=d.item;
    openDialog(p.title,p.category+" · "+p.author+" · "+stamp(p.created_at)+" · 阅读 "+p.views,
      '<div class="article-body">'+esc(p.content)+'</div><div class="detail-actions"><button class="button button-light" data-action="vote-post" data-id="'+p.id+'">'+(d.liked?"♥ 已点赞":"♡ 点赞")+" · "+p.votes+'</button>'+tagsHtml(p.tags)+'</div>');
  } catch(e){toast(e.message,true);}
}
async function showQuestion(id) {
  try {
    const d=await api("/api/questions/"+id); const q=d.item;
    const answers=d.answers.map(a=>'<div class="answer-item"><div class="answer-author">'+esc(a.author)+' · '+stamp(a.created_at)+(a.is_accepted?'<span class="answer-mark">已采纳</span>':"")+'</div><div class="article-body">'+esc(a.content)+'</div><div class="detail-actions"><button class="inline-action" data-action="vote-answer" data-question="'+q.id+'" data-id="'+a.id+'">'+(a.liked?"♥ ":"♡ ")+a.votes+'</button>'+(state.user&&state.user.id===q.author_id&&!q.is_solved?'<button class="inline-action" data-action="accept-answer" data-question="'+q.id+'" data-id="'+a.id+'">采纳为最佳答案</button>':"")+'</div></div>').join("");
    const answerForm=state.user?'<form data-form="answer" data-id="'+q.id+'"><div class="field"><label>写下你的回答</label><textarea name="content" required maxlength="8000" placeholder="分享你试过的办法…"></textarea></div><div class="form-bottom"><small>请填写示例内容</small><button class="button button-primary">提交回答</button></div></form>':'<button class="button button-light" data-action="login">登录后回答</button>';
    const liked=d.liked;
    openDialog(q.title,q.author+" · "+stamp(q.created_at)+" · "+q.views+" 次浏览",
      '<div class="detail-content">'+esc(q.content)+'</div><div class="detail-actions"><button class="button '+(liked?"button-primary":"button-light")+'" data-action="vote-question" data-id="'+q.id+'">'+(liked?"♥ 已点赞":"♡ 点赞")+" · "+q.votes+'</button><span class="tag-list">'+(q.tags||[]).map(t=>'<span class="tag"># '+esc(t)+'</span>').join("")+'</span>'+(q.is_solved?'<span class="answer-mark">已解决</span>':"")+'</div>'+
      '<div class="answers-list"><h3>回答 · '+d.answers.length+'</h3>'+(answers||'<p class="post-excerpt">还没有回答，来做第一个分享经验的人吧。</p>')+'</div>'+answerForm);
  } catch(e){toast(e.message,true);}
}
async function openCart() {
  if(!requireLogin()) return;
  try {
    const [cart,addresses]=await Promise.all([api("/api/cart"),api("/api/addresses")]);
    const rows=cart.items.map(i=>'<div class="cart-row"><div class="cart-emoji">'+esc(i.emoji)+'</div><div><b>'+esc(i.name)+'</b><small>¥ '+Number(i.price).toFixed(2)+' · '+esc(i.category)+'</small></div><div class="cart-controls"><button data-action="cart-qty" data-id="'+i.id+'" data-delta="-1">−</button><strong>'+i.quantity+'</strong><button data-action="cart-qty" data-id="'+i.id+'" data-delta="1">+</button><button data-action="cart-remove" data-id="'+i.id+'">×</button></div></div>').join("");
    const opts=addresses.items.map(a=>'<option value="'+a.id+'" '+(a.is_default?"selected":"")+'>'+esc(a.recipient)+' · '+esc(a.province+a.city+a.district+a.detail)+'</option>').join("");
    openDialog("我的购物车","挑选学习工具，模拟一次完整的下单流程。",
      (rows||'<div class="empty-state"><b>购物车还是空的</b>去资源集市挑一份练习资料吧。</div>')+
      (rows?'<div class="cart-total"><span>合计</span><b>¥ '+cart.total.toFixed(2)+'</b></div><div class="field"><label>示例收货地址</label><select id="checkoutAddress">'+opts+'</select></div><div class="form-bottom"><small>演示订单不会发生付款</small><button class="button button-primary" data-action="checkout">创建演示订单</button></div>':""));
  } catch(e){toast(e.message,true);}
}
async function showOrders() {
  if(!requireLogin()) return;
  try {
    const d=await api("/api/orders");
    const rows=d.items.map(o=>'<div class="order-row"><div><b>'+esc(o.order_no)+'</b><small>'+stamp(o.created_at)+' · '+o.items.map(i=>esc(i.product_name)+" × "+i.quantity).join("，")+'</small><small>示例收件人：'+esc(o.recipient)+'</small></div><div style="text-align:right"><span class="status-pill">'+esc(o.status)+'</span><p><b>¥ '+Number(o.total_price).toFixed(2)+'</b></p>'+(o.status==="已创建"?'<button class="inline-action" data-action="cancel-order" data-id="'+o.id+'">取消订单</button>':"")+'</div></div>').join("");
    openDialog("我的订单","订单仅用于本地业务流程练习。",rows||'<div class="empty-state">还没有订单</div>');
  } catch(e){toast(e.message,true);}
}
function showProfile() {
  if(!state.user) return openAuth();
  openDialog("课堂演示账号","演示记录仅保存在当前浏览器。",
    '<div class="form-bottom"><button class="button button-light" data-action="orders">查看我的订单</button><button class="button button-danger" data-action="logout">退出登录</button></div>');
}
document.addEventListener("click",async event=>{
  const tab=event.target.closest("[data-tab]");
  if(tab){setTab(tab.dataset.tab);return;}
  const el=event.target.closest("[data-action]"); if(!el)return;
  const action=el.dataset.action;
  try {
    if(action==="login") openAuth();
    else if(action==="close-dialog") closeDialog();
    else if(action==="compose") {if(!requireLogin())return;if(state.tab==="posts")openDialog("写一篇文章","把刚弄懂的知识留在岛上。",postForm());else if(state.tab==="questions")openDialog("提出一个问题","清楚描述卡点，更容易收到有用的回答。",questionForm());else toast("在资源集市里可以加入购物车");}
    else if(action==="category"){state.category=el.dataset.value||"";loadActive();}
    else if(action==="sort"){state.sort=el.dataset.value;loadActive();}
    else if(action==="post-detail") showPost(el.dataset.id);
    else if(action==="question-detail") showQuestion(el.dataset.id);
    else if(action==="vote-post"){if(!requireLogin())return;await api("/api/posts/"+el.dataset.id+"/vote",{method:"POST"});showPost(el.dataset.id);}
    else if(action==="vote-question"){if(!requireLogin())return;await api("/api/questions/"+el.dataset.id+"/vote",{method:"POST"});showQuestion(el.dataset.id);loadActive();}
    else if(action==="vote-answer"){if(!requireLogin())return;await api("/api/answers/"+el.dataset.id+"/vote",{method:"POST"});showQuestion(el.dataset.question);}
    else if(action==="accept-answer"){if(!requireLogin())return;await api("/api/answers/"+el.dataset.id+"/accept",{method:"POST"});toast("已采纳这个回答");showQuestion(el.dataset.question);loadActive();}
    else if(action==="add-cart"){if(!requireLogin())return;await api("/api/cart",{method:"POST",body:JSON.stringify({product_id:Number(el.dataset.id),quantity:1})});toast("已加入购物车");updateCartCount();}
    else if(action==="cart"||action==="cart-open") openCart();
    else if(action==="cart-qty"){const id=Number(el.dataset.id);const row=el.closest(".cart-row");const quantity=Number(row.querySelector("strong").textContent)+Number(el.dataset.delta);if(quantity<1){await api("/api/cart/"+id,{method:"DELETE"});}else await api("/api/cart/"+id,{method:"PUT",body:JSON.stringify({quantity})});openCart();updateCartCount();}
    else if(action==="cart-remove"){await api("/api/cart/"+el.dataset.id,{method:"DELETE"});openCart();updateCartCount();}
    else if(action==="checkout"){const address_id=Number($("#checkoutAddress")?.value||0);const order=await api("/api/orders",{method:"POST",body:JSON.stringify({address_id})});closeDialog();toast("订单 "+order.order_no+" 已创建");loadActive();}
    else if(action==="orders") showOrders();
    else if(action==="cancel-order"){await api("/api/orders/"+el.dataset.id+"/cancel",{method:"POST"});toast("订单已取消，库存已恢复");showOrders();loadActive();}
    else if(action==="profile") showProfile();
    else if(action==="logout"){closeDialog();logout();}
    else if(action==="learn-more") $("#community").scrollIntoView({behavior:"smooth"});
  } catch(e){toast(e.message,true);}
});
document.addEventListener("submit",async event=>{
  const form=event.target.closest("form[data-form]"); if(!form)return;
  event.preventDefault(); const values=Object.fromEntries(new FormData(form).entries()); const type=form.dataset.form;
  try {
    if(type==="login"){
      setAuth(window.ZhuyingDemo.login(values.username,values.password));closeDialog();await loadActive();
    } else if(type==="post"){
      values.tags=values.tags.split(",").map(x=>x.trim()).filter(Boolean);
      await api("/api/posts",{method:"POST",body:JSON.stringify(values)});closeDialog();toast("文章已发布");setTab("posts");
    } else if(type==="question"){
      values.tags=values.tags.split(",").map(x=>x.trim()).filter(Boolean);
      await api("/api/questions",{method:"POST",body:JSON.stringify(values)});closeDialog();toast("问题已发布");setTab("questions");
    } else if(type==="answer"){
      const id=form.dataset.id;await api("/api/questions/"+id+"/answers",{method:"POST",body:JSON.stringify(values)});toast("回答已提交");showQuestion(id);loadActive();
    }
  } catch(e){toast(e.message,true);}
});
document.addEventListener("input",event=>{
  if(event.target.id==="searchPosts"){
    state.keyword=event.target.value;clearTimeout(state.searchTimer);
    state.searchTimer=setTimeout(()=>{if(state.tab==="posts")loadActive();},260);
  }
});
(async function start(){
  syncAccount();
  await loadActive();
})();
window.addEventListener("storage",()=>{
  const previous=state.token;
  syncAccount();
  if(state.token!==previous){closeDialog();loadActive();}
});
