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
  const headers=Object.assign({"Content-Type":"application/json"},options.headers||{});
  if(state.token) headers.Authorization="Bearer "+state.token;
  const response=await fetch(path,Object.assign({},options,{headers}));
  let data={};
  try { data=await response.json(); } catch {}
  if(!response.ok) {
    if(response.status===401 && state.token) { logout(false); }
    throw new Error(data.error || "请求失败，请稍后重试");
  }
  return data;
}
function setAuth(payload) {
  state.token=payload.token; state.user=payload.user;
  localStorage.setItem("studyhub-token",payload.token);
  renderAccount();
  toast("欢迎回来，"+payload.user.username);
}
function logout(show=true) {
  state.token=""; state.user=null; localStorage.removeItem("studyhub-token"); renderAccount();
  if(show) toast("已退出登录");
}
function renderAccount() {
  const area=$("#accountArea");
  area.innerHTML=state.user
    ? '<button class="user-pill" data-action="profile"><span class="avatar">'+initials(state.user.username)+'</span><span>'+esc(state.user.username)+' · '+esc(state.user.points)+' 分</span></button>'
    : '<button class="button button-dark" data-action="login">登录 / 注册</button>';
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
  if(state.user) return true;
  openAuth("login"); toast("登录后即可参与互动");
  return false;
}
function authForm(mode) {
  const isLogin=mode==="login";
  return '<div class="mode-switch"><button type="button" class="'+(isLogin?"active":"")+'" data-action="auth-mode" data-mode="login">登录</button><button type="button" class="'+(!isLogin?"active":"")+'" data-action="auth-mode" data-mode="register">注册账号</button></div>'+
    '<form data-form="'+mode+'">'+
    '<div class="field"><label>用户名'+(!isLogin?"（3-20 个字符）":"或邮箱")+'</label><input name="username" autocomplete="username" required minlength="'+(isLogin?1:3)+'" maxlength="120" placeholder="'+(isLogin?"输入用户名":"给自己起个名字")+'"></div>'+
    (!isLogin?'<div class="field"><label>邮箱</label><input name="email" type="email" autocomplete="email" required placeholder="name@example.com"></div>':"")+
    '<div class="field"><label>密码</label><input name="password" type="password" autocomplete="'+(isLogin?"current-password":"new-password")+'" required minlength="'+(isLogin?1:6)+'" placeholder="'+(isLogin?"输入密码":"至少 6 位")+'"></div>'+
    '<div class="form-bottom"><small>'+(isLogin?"演示账号：demo / Demo123!":"注册即获得 30 个起步积分")+'</small><button class="button button-primary" type="submit">'+(isLogin?"进入知识岛":"创建账号")+'</button></div></form>';
}
function openAuth() { toast("只读预览。登录与互动需启动知识岛原项目。"); }
function postForm() {
  return '<form data-form="post"><div class="field"><label>文章标题</label><input name="title" required maxlength="100" placeholder="这次学会了什么？"></div>'+
    '<div class="form-grid"><div class="field"><label>分类</label><select name="category"><option>学习笔记</option><option>开发工具</option><option>项目方法</option><option>微信小程序</option></select></div>'+
    '<div class="field"><label>标签（逗号分隔）</label><input name="tags" placeholder="全栈, 实践"></div></div>'+
    '<div class="field"><label>正文</label><textarea name="content" required maxlength="12000" placeholder="写下过程、代码思路或你想留给下一个人的提醒…"></textarea></div>'+
    '<div class="form-bottom"><small>支持 Markdown 文本</small><button class="button button-primary">发布文章</button></div></form>';
}
function questionForm() {
  return '<form data-form="question"><div class="field"><label>问题标题</label><input name="title" required maxlength="120" placeholder="你卡在哪一步？"></div>'+
    '<div class="field"><label>问题描述</label><textarea name="content" required maxlength="10000" placeholder="补充你尝试过的办法和看到的现象…"></textarea></div>'+
    '<div class="field"><label>标签（逗号分隔）</label><input name="tags" placeholder="Git, 数据库"></div>'+
    '<div class="form-bottom"><small>发布问题会扣除 5 积分</small><button class="button button-primary">发布问题</button></div></form>';
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
    openDialog(p.title,p.category+" · "+esc(p.author)+" · "+stamp(p.created_at)+" · 阅读 "+p.views,
      '<div class="article-body">'+esc(p.content)+'</div><div class="detail-actions">'+tagsHtml(p.tags)+'</div>');
  } catch(e){toast(e.message,true);}
}
async function showQuestion(id) {
  try {
    const d=await api("/api/questions/"+id); const q=d.item;
    const answers=d.answers.map(a=>'<div class="answer-item"><div class="answer-author">'+esc(a.author)+' · '+stamp(a.created_at)+(a.is_accepted?'<span class="answer-mark">已采纳</span>':"")+'</div><div class="article-body">'+esc(a.content)+'</div><div class="detail-actions"><button class="inline-action" data-action="vote-answer" data-id="'+a.id+'">♡ '+a.votes+'</button>'+(state.user&&state.user.id===q.author_id&&!q.is_solved?'<button class="inline-action" data-action="accept-answer" data-id="'+a.id+'">采纳为最佳答案</button>':"")+'</div></div>').join("");
    const answerForm=state.user?'<form data-form="answer" data-id="'+q.id+'"><div class="field"><label>写下你的回答</label><textarea name="content" required maxlength="8000" placeholder="分享你试过的办法…"></textarea></div><div class="form-bottom"><small>回答可获得 10 积分</small><button class="button button-primary">提交回答</button></div></form>':'<button class="button button-light" data-action="login">登录后回答</button>';
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
      (rows?'<div class="cart-total"><span>合计</span><b>¥ '+cart.total.toFixed(2)+'</b></div><div class="field"><label>收货地址</label><select id="checkoutAddress">'+opts+'</select></div><div class="form-bottom"><small>演示订单不会发生付款</small><button class="button button-primary" data-action="checkout">创建待支付订单</button></div>':""));
  } catch(e){toast(e.message,true);}
}
async function showOrders() {
  if(!requireLogin()) return;
  try {
    const d=await api("/api/orders");
    const rows=d.items.map(o=>'<div class="order-row"><div><b>'+esc(o.order_no)+'</b><small>'+stamp(o.created_at)+' · '+o.items.map(i=>esc(i.product_name)+" × "+i.quantity).join("，")+'</small><small>收件人：'+esc(o.recipient)+' · '+esc(o.phone)+'</small></div><div style="text-align:right"><span class="status-pill">'+esc(o.status)+'</span><p><b>¥ '+Number(o.total_price).toFixed(2)+'</b></p>'+(o.status==="待支付"?'<button class="inline-action" data-action="cancel-order" data-id="'+o.id+'">取消订单</button>':"")+'</div></div>').join("");
    openDialog("我的订单","订单仅用于本地业务流程练习。",rows||'<div class="empty-state">还没有订单</div>');
  } catch(e){toast(e.message,true);}
}
function showProfile() {
  if(!state.user) return openAuth();
  openDialog("你好，"+state.user.username,"在知识岛里，每一步练习都值得记下来。",
    '<div class="goal-row"><div class="goal-icon">✦</div><div><b>'+state.user.points+' 积分</b><small>提问 −5 · 回答 +10 · 被采纳 +30</small></div></div>'+
    '<div class="form-bottom"><button class="button button-light" data-action="orders">查看我的订单</button><button class="button button-danger" data-action="logout">退出登录</button></div>');
}
document.addEventListener("click",async event=>{
  const tab=event.target.closest("[data-tab]");
  if(tab){setTab(tab.dataset.tab);return;}
  const el=event.target.closest("[data-action]"); if(!el)return;
  const action=el.dataset.action;
  try {
    if(action==="login") openAuth("login");
    else if(action==="auth-mode") openAuth(el.dataset.mode);
    else if(action==="close-dialog") closeDialog();
    else if(action==="compose") {if(!requireLogin())return;if(state.tab==="posts")openDialog("写一篇文章","把刚弄懂的知识留在岛上。",postForm());else if(state.tab==="questions")openDialog("提出一个问题","清楚描述卡点，更容易收到有用的回答。",questionForm());else toast("在资源集市里可以加入购物车");}
    else if(action==="category"){state.category=el.dataset.value||"";loadActive();}
    else if(action==="sort"){state.sort=el.dataset.value;loadActive();}
    else if(action==="post-detail") showPost(el.dataset.id);
    else if(action==="question-detail") showQuestion(el.dataset.id);
    else if(action==="vote-question"){if(!requireLogin())return;await api("/api/questions/"+el.dataset.id+"/vote",{method:"POST",body:"{}"});closeDialog();toast("点赞状态已更新");loadActive();}
    else if(action==="vote-answer"){if(!requireLogin())return;const id=el.dataset.id;await api("/api/answers/"+id+"/vote",{method:"POST",body:"{}"});const q=$(".question-title");if(q)showQuestion(q.dataset.id);}
    else if(action==="accept-answer"){await api("/api/answers/"+el.dataset.id+"/accept",{method:"POST",body:"{}"});toast("已采纳这个回答");const q=$(".question-title");if(q)showQuestion(q.dataset.id);if(state.user)state.user=(await api("/api/me")).user;renderAccount();}
    else if(action==="add-cart"){if(!requireLogin())return;await api("/api/cart",{method:"POST",body:JSON.stringify({product_id:Number(el.dataset.id),quantity:1})});toast("已加入购物车");updateCartCount();}
    else if(action==="cart"||action==="cart-open") openCart();
    else if(action==="cart-qty"){const id=Number(el.dataset.id);const row=el.closest(".cart-row");const quantity=Number(row.querySelector("strong").textContent)+Number(el.dataset.delta);if(quantity<1){await api("/api/cart/"+id,{method:"DELETE"});}else await api("/api/cart/"+id,{method:"PUT",body:JSON.stringify({quantity})});openCart();updateCartCount();}
    else if(action==="cart-remove"){await api("/api/cart/"+el.dataset.id,{method:"DELETE"});openCart();updateCartCount();}
    else if(action==="checkout"){const address_id=Number($("#checkoutAddress")?.value||0);const order=await api("/api/orders",{method:"POST",body:JSON.stringify({address_id})});closeDialog();toast("订单 "+order.order_no+" 已创建");updateCartCount();}
    else if(action==="orders") showOrders();
    else if(action==="cancel-order"){await api("/api/orders/"+el.dataset.id+"/cancel",{method:"POST",body:"{}"});toast("订单已取消，库存已恢复");showOrders();}
    else if(action==="profile") showProfile();
    else if(action==="logout"){closeDialog();logout();}
    else if(action==="learn-more") $("#community").scrollIntoView({behavior:"smooth"});
  } catch(e){toast(e.message,true);}
});
document.addEventListener("submit",async event=>{
  const form=event.target.closest("form[data-form]"); if(!form)return;
  event.preventDefault(); const values=Object.fromEntries(new FormData(form).entries()); const type=form.dataset.form;
  try {
    if(type==="login"||type==="register"){
      const data=await api("/api/auth/"+type,{method:"POST",body:JSON.stringify(values)});setAuth(data);closeDialog();await updateCartCount();
    } else if(type==="post"){
      values.tags=values.tags.split(",").map(x=>x.trim()).filter(Boolean);
      await api("/api/posts",{method:"POST",body:JSON.stringify(values)});closeDialog();toast("文章已发布");setTab("posts");
    } else if(type==="question"){
      values.tags=values.tags.split(",").map(x=>x.trim()).filter(Boolean);
      await api("/api/questions",{method:"POST",body:JSON.stringify(values)});closeDialog();toast("问题已发布");setTab("questions");state.user=(await api("/api/me")).user;renderAccount();
    } else if(type==="answer"){
      const id=form.dataset.id;await api("/api/questions/"+id+"/answers",{method:"POST",body:JSON.stringify(values)});toast("回答已提交");showQuestion(id);state.user=(await api("/api/me")).user;renderAccount();
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
  renderAccount();
  if(state.token){try{state.user=(await api("/api/me")).user;renderAccount();}catch{logout(false);}}
  await loadActive();
})();