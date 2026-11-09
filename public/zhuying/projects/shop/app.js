const S = {token:'', user:null, view:'catalog', category:'', keyword:'', page:1, pageSize:12, products:[], cart:[], selected:new Set(), cartLoaded:false, orders:[], orderStatus:'all', orderPage:1};
const $ = (s,r=document)=>r.querySelector(s);
const esc = v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n=>'¥ '+Number(n||0).toFixed(2);
const date = v=>v?new Date(v).toLocaleString('zh-CN',{hour12:false}):'';
const image = v=>/^\/(assets|uploads)\/[\w./-]+$/.test(v||'')?v.replace(/^\/assets\//, './assets/'):'./assets/notebook.svg';
function toast(message,error=false){const el=$('#toast');el.textContent=message;el.classList.toggle('error',error);el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),3300);}
async function api(path,options={}){
 return shopDemoApi(path, options, S.token);
}
function openModal(title,content,kicker='SHIWU / 拾物'){const el=$('#modal');if(el.open)el.close();$('#modalTitle').textContent=title;$('#modalKicker').textContent=kicker;$('#modalContent').innerHTML=content;el.showModal();}
function closeModal(){if($('#modal').open)$('#modal').close();}
function renderHeader(){document.querySelectorAll('nav [data-view]').forEach(el=>el.classList.toggle('active',el.dataset.view===S.view));const el=$('#accountButton');el.dataset.action=S.user?'profile':'login';el.textContent=S.user?S.user.display_name:'演示登录';}
function syncShopSession(){
 const session=window.ZhuyingDemo.getSession();
 const token=session?.token||'';
 if(S.token!==token){S.cartLoaded=false;S.selected.clear();}
 S.token=token;
 S.user=session?.user||null;
 renderHeader();
}
function requireLogin(){syncShopSession();if(S.user)return true;authDialog();return false;}
function empty(title,note,action='catalog',label='去看看好物'){return '<section class="empty"><span class="empty-symbol">拾</span><h2>'+esc(title)+'</h2><p>'+esc(note)+'</p><button class="button primary" '+(action==='catalog'?'data-action="reset-catalog"':'data-view="'+action+'"')+'>'+esc(label)+'</button></section>';}
function pageHeader(kicker,title,note,extra=''){return '<section class="page-header"><div><p class="eyebrow">'+esc(kicker)+'</p><h1>'+esc(title)+'</h1><p>'+esc(note)+'</p></div>'+extra+'</section>';}
function pagination(total,page,size,prefix){const pages=Math.ceil(total/size);if(pages<=1)return '';return '<div class="pagination"><span>共 '+total+' 项 · 第 '+page+' / '+pages+' 页</span><button class="button secondary" data-action="'+prefix+'-page" data-page="'+(page-1)+'" '+(page<=1?'disabled':'')+'>上一页</button><button class="button secondary" data-action="'+prefix+'-page" data-page="'+(page+1)+'" '+(page>=pages?'disabled':'')+'>下一页</button></div>';}
async function cartCount(){if(!S.user){$('#cartCount').textContent='0';return;}try{const d=await api('/api/cart');$('#cartCount').textContent=d.items.reduce((n,i)=>n+i.quantity,0);}catch{}}
async function setView(view){if(view!=='catalog'&&!requireLogin())return;closeModal();S.view=view;renderHeader();$('#content').innerHTML='<div class="loading">正在整理'+({catalog:'好物',cart:'购物袋',orders:'订单',addresses:'地址簿',profile:'个人资料'}[view]||'页面')+'…</div>';try{await ({catalog:loadCatalog,cart:loadCart,orders:loadOrders,addresses:loadAddresses,profile:loadProfile}[view]||loadCatalog)();}catch(e){$('#content').innerHTML=empty('页面暂时无法加载',e.message,'catalog','回到选集');toast(e.message,true);}window.scrollTo({top:0,behavior:'smooth'});}
async function loadCatalog(){
 const d=await api('/api/products?'+new URLSearchParams({page:S.page,pageSize:S.pageSize,keyword:S.keyword,category:S.category}));S.products=d.items;
 const hero='<section class="hero"><div><p class="eyebrow">SMALL THINGS, GOOD DAYS</p><h1>留一些好用的物件，<br>给认真生活的你。</h1><p>纸上的灵感，笔尖的日常。<br>从一件小物开始，找到自己的节奏。</p><button class="button primary" data-action="browse">浏览好物 <span>↘</span></button></div><div class="hero-art"><img src="./assets/hero.svg" alt="笔记本与书写笔的静物插画"><span class="hero-label">THE EVERYDAY<br>COLLECTION / 01</span></div></section>';
 const cats=['全部',...d.categories].map(c=>'<button class="category '+((c==='全部'?!S.category:S.category===c)?'active':'')+'" data-action="category" data-value="'+esc(c==='全部'?'':c)+'">'+esc(c)+'</button>').join('');
 const cards=d.items.map(p=>'<article class="product-card"><button class="product-image" data-action="product" data-id="'+p.id+'"><img src="'+image(p.image)+'" alt="'+esc(p.name)+'" loading="lazy"><span class="product-tag">'+esc(p.category)+'</span></button><div class="product-info"><button class="product-name" data-action="product" data-id="'+p.id+'">'+esc(p.name)+'</button><p>'+esc(p.description)+'</p><div class="product-bottom"><strong>'+money(p.price)+'</strong><button class="add-circle" data-action="add-cart" data-id="'+p.id+'" '+(p.stock<=0?'disabled':'')+' aria-label="将'+esc(p.name)+'加入购物车">'+(p.stock<=0?'售罄':'+')+'</button></div></div></article>').join('');
 $('#content').innerHTML=hero+'<section class="collection" id="collection"><div class="collection-header"><div><p class="eyebrow">CURATED FOR EVERYDAY</p><h2>好物选集 <small>'+d.total+' 件日常之选</small></h2></div><form data-form="search" class="search-form"><label class="sr-only" for="catalogSearch">搜索商品</label><input id="catalogSearch" name="keyword" value="'+esc(S.keyword)+'" placeholder="寻找一件好物…" maxlength="120"><button aria-label="搜索商品">搜索</button></form></div><div class="categories">'+cats+'</div>'+(cards?'<div class="product-grid">'+cards+'</div>':empty('没有找到这件好物','换个关键词或分类再找找。','catalog','重新浏览'))+pagination(d.total,d.page,d.pageSize,'catalog')+'</section><section class="shop-note"><span class="eyebrow">LESS, BUT BETTER.</span><p>不用很多，刚刚好就好。<br>每一个被留下的物件，都有自己的位置。</p><span>本地课程演示商城<br>所有商品均为示例</span></section>';
}
async function productDialog(id){const p=(await api('/api/products/'+id)).item;openModal(p.name,'<div class="product-detail"><img class="detail-image" src="'+image(p.image)+'" alt="'+esc(p.name)+'"><div><span class="pill">'+esc(p.category)+'</span><h3 class="detail-price">'+money(p.price)+'</h3><p class="detail-description">'+esc(p.description)+'</p><p class="stock">现有库存 '+p.stock+' 件</p><form data-form="product-add" data-id="'+p.id+'"><div class="field"><label for="productQty">数量</label><input id="productQty" name="quantity" type="number" min="1" max="'+p.stock+'" step="1" value="1" required '+(!p.stock?'disabled':'')+'></div><button class="button primary full" '+(!p.stock?'disabled':'')+'>'+(!p.stock?'暂时售罄':'加入购物袋')+'</button></form><p class="small-note">商品用于本地流程演示，下单后不发生真实支付。</p></div></div>','THE EVERYDAY COLLECTION');}
function authDialog(){
 const username=esc(window.ZhuyingDemo.USERNAME);
 const password=esc(window.ZhuyingDemo.PASSWORD);
 openModal('课堂演示登录', [
  '<p class="dialog-copy">演示账号 <b>'+username+'</b>，密码 <b>'+password+'</b>。请使用此账号体验下单流程。</p>',
  '<form data-form="login"><div class="field"><label for="demoUsername">演示账号</label><input id="demoUsername" name="username" value="'+username+'" autocomplete="username" required></div>',
  '<div class="field"><label for="demoPassword">演示密码</label><input id="demoPassword" name="password" type="password" autocomplete="current-password" required></div>',
  '<div class="form-actions"><button class="button primary">登录</button></div></form>',
 ].join(''), 'CLASSROOM DEMO');
}
async function loadCart(){
 const d=await api('/api/cart');S.cart=d.items;
 if(!S.cartLoaded){S.selected=new Set(d.items.map(i=>i.id));S.cartLoaded=true;}else S.selected=new Set([...S.selected].filter(id=>d.items.some(i=>i.id===id)));
 const rows=d.items.map(i=>'<div class="cart-row"><input type="checkbox" class="cart-check" data-cart-select="'+i.id+'" '+(S.selected.has(i.id)?'checked':'')+' aria-label="选择'+esc(i.name)+'"><button class="cart-product-image" data-action="product" data-id="'+i.product_id+'"><img src="'+image(i.image)+'" alt="'+esc(i.name)+'"></button><div class="cart-product"><button class="text-button" data-action="product" data-id="'+i.product_id+'">'+esc(i.name)+'</button><small>'+esc(i.category)+' · 库存 '+i.stock+' 件</small><b>'+money(i.price)+'</b>'+(i.quantity>i.stock?'<span class="error-text">库存发生变化，请调整数量</span>':'')+'</div><div class="quantity-control"><button data-action="cart-quantity" data-id="'+i.id+'" data-quantity="'+(i.quantity-1)+'" '+(i.quantity<=1?'disabled':'')+' aria-label="减少数量">−</button><label class="sr-only" for="qty-'+i.id+'">商品数量</label><input id="qty-'+i.id+'" type="number" min="1" max="'+i.stock+'" value="'+i.quantity+'" data-cart-quantity="'+i.id+'"><button data-action="cart-quantity" data-id="'+i.id+'" data-quantity="'+(i.quantity+1)+'" '+(i.quantity>=i.stock?'disabled':'')+' aria-label="增加数量">+</button></div><strong class="row-subtotal">'+money(i.subtotal)+'</strong><button class="icon-button remove" data-action="cart-remove" data-id="'+i.id+'" aria-label="移除'+esc(i.name)+'">×</button></div>').join('');
 $('#content').innerHTML=pageHeader('YOUR SHOPPING BAG','你的购物袋','把喜欢的选出来，让日常多一点期待。','<button class="button secondary" data-view="catalog">继续逛逛 ↗</button>')+(rows?'<section class="cart-layout"><div class="panel"><div class="cart-table-head"><label><input type="checkbox" id="selectAll" '+(S.selected.size===d.items.length?'checked':'')+'> 全选商品</label><span>商品数量 · 小计</span></div>'+rows+'</div><aside class="summary panel"><p class="eyebrow">ORDER SUMMARY</p><h2>结算清单</h2><div class="summary-line"><span>已选商品</span><b id="selectedQuantity"></b></div><div class="summary-line"><span>运费</span><b>¥ 0.00</b></div><div class="summary-total"><span>合计</span><strong id="selectedTotal"></strong></div><button class="button primary full" data-action="checkout" id="checkoutButton">选择地址并结算</button><p class="small-note">只结算勾选的商品。<br>此项目不接入真实支付。</p></aside></section>':empty('购物袋里还很安静','去选集看看，找到陪伴日常的小物。'));
 updateSelection();await cartCount();
}
function updateSelection(){const selected=S.cart.filter(i=>S.selected.has(i.id));if($('#selectedQuantity'))$('#selectedQuantity').textContent=selected.reduce((n,i)=>n+i.quantity,0)+' 件';if($('#selectedTotal'))$('#selectedTotal').textContent=money(selected.reduce((n,i)=>n+Number(i.subtotal),0));if($('#checkoutButton'))$('#checkoutButton').disabled=!selected.length;const all=$('#selectAll');if(all){all.checked=S.cart.length>0&&selected.length===S.cart.length;all.indeterminate=selected.length>0&&selected.length<S.cart.length;}}
const addressText=a=>a.province+a.city+a.district+a.detail;
async function loadAddresses(){
 const { items } = await api('/api/addresses');
 const cards = items.map(address => '<article class="address-card panel"><div class="address-head"><h3>'
  + esc(address.recipient) + '</h3><span class="pill">课堂示例</span></div><p class="address-phone">'
  + esc(address.phone) + '</p><p>' + esc(addressText(address)) + '</p></article>').join('');
 $('#content').innerHTML = pageHeader('YOUR ADDRESS BOOK','地址簿','使用这条虚构地址体验下单，无需填写个人信息。')
  + '<div class="addresses-grid">' + cards + '</div>';
}
async function checkoutDialog(){
 if(!S.selected.size)return toast('请先选择需要结算的商品',true);
 const { items: addresses } = await api('/api/addresses');
 const selected = S.cart.filter(item => S.selected.has(item.id));
 const items = selected.map(item => '<div><span>' + esc(item.name) + ' × ' + item.quantity
  + '</span><b>' + money(item.subtotal) + '</b></div>').join('');
 const addressOptions = addresses.map(address => '<option value="' + address.id + '">'
  + esc(address.recipient + ' · ' + addressText(address)) + '</option>').join('');
 const total = money(selected.reduce((sum, item) => sum + item.subtotal, 0));
 openModal('确认这一次小小的期待', '<div class="checkout-items">' + items + '</div>'
  + '<form data-form="checkout"><div class="field"><label for="checkoutAddress">示例收货地址</label>'
  + '<select id="checkoutAddress" name="address_id" required>' + addressOptions + '</select></div>'
  + '<div class="summary-total"><span>商品合计 · 运费 ¥ 0</span><strong>' + total + '</strong></div>'
  + '<p class="small-note">待支付状态用于展示流程。这里不会扣款或配送，取消订单会恢复演示库存。</p>'
  + '<div class="form-actions"><button class="button secondary" type="button" data-view="addresses">查看示例地址</button>'
  + '<button class="button primary">创建待支付订单</button></div></form>', 'CHECKOUT / 核对订单');
}
async function loadOrders(){
 const d=await api('/api/orders?'+new URLSearchParams({status:S.orderStatus,page:S.orderPage,pageSize:8}));S.orders=d.items;
 const tabs=[['all','全部订单'],['pending','待支付'],['cancelled','已取消']].map(([v,t])=>'<button class="category '+(S.orderStatus===v?'active':'')+'" data-action="order-status" data-status="'+v+'">'+t+'</button>').join('');
 const rows=d.items.map(o=>'<article class="order-card panel"><div class="order-heading"><div><small>'+date(o.created_at)+'</small><b>'+esc(o.order_no)+'</b></div><span class="status '+o.status+'">'+esc(o.status_label)+'</span></div><div class="order-products">'+o.items.map(i=>'<div class="order-product"><img src="'+image(i.product_image)+'" alt="'+esc(i.product_name)+'"><div><b>'+esc(i.product_name)+'</b><small>'+money(i.unit_price)+' × '+i.quantity+'</small></div></div>').join('')+'</div><div class="order-footer"><span>共 '+o.items.reduce((n,i)=>n+i.quantity,0)+' 件 · 合计 <b>'+money(o.total_price)+'</b></span><div><button class="button secondary" data-action="order-detail" data-id="'+o.id+'">查看详情</button>'+(o.status==='pending'?'<button class="button secondary danger" data-action="order-cancel" data-id="'+o.id+'">取消订单</button>':'')+'</div></div></article>').join('');
 $('#content').innerHTML=pageHeader('YOUR ORDERS','每一份期待，都有记录','这里保存商品、价格和收货信息的下单快照。')+'<div class="categories order-tabs">'+tabs+'</div>'+(rows?'<div class="orders-list">'+rows+'</div>':empty('这里暂时没有订单','从购物袋结算后，订单会出现在这里。','catalog','去选集看看'))+pagination(d.total,d.page,d.pageSize,'orders');
}
async function orderDetail(id){const o=(await api('/api/orders/'+id)).item;openModal('订单详情','<div class="order-detail-header"><div><p>'+esc(o.order_no)+'</p><small>'+date(o.created_at)+'</small></div><span class="status '+o.status+'">'+esc(o.status_label)+'</span></div><div class="order-address"><p class="eyebrow">收货信息 · 下单快照</p><b>'+esc(o.address.recipient)+' · '+esc(o.address.phone)+'</b><p>'+esc(addressText(o.address))+'</p></div><div class="order-products">'+o.items.map(i=>'<div class="order-product"><img src="'+image(i.product_image)+'" alt="'+esc(i.product_name)+'"><div><b>'+esc(i.product_name)+'</b><small>'+money(i.unit_price)+' × '+i.quantity+'</small></div><strong>'+money(Number(i.unit_price)*i.quantity)+'</strong></div>').join('')+'</div><div class="summary-total"><span>订单合计</span><strong>'+money(o.total_price)+'</strong></div><p class="small-note">本地课程演示：不接入真实支付。'+(o.status==='pending'?'取消后将恢复商品库存。':'该订单已取消，库存已恢复。')+'</p>'+(o.status==='pending'?'<div class="form-actions"><button class="button secondary danger" data-action="order-cancel" data-id="'+o.id+'">取消订单</button></div>':''),'ORDER / '+o.id);}
function cancelDialog(id){openModal('确定取消这笔订单？','<p class="dialog-copy">只会取消这笔待支付订单；商品库存会恢复，订单记录仍可在“已取消”中查看。</p><div class="form-actions"><button class="button secondary" data-action="close">再想想</button><button class="button primary" data-action="order-cancel-confirm" data-id="'+id+'">确认取消</button></div>');}
async function loadProfile(){
 const { user } = await api('/api/me');
 $('#content').innerHTML = pageHeader('CLASSROOM DEMO','你好，' + user.display_name,'当前使用课堂演示账号。')
  + '<section class="panel address-card"><p>账号：' + esc(user.username)
  + '</p><p>购物袋和订单记录保存在当前浏览器中。</p>'
  + '<div class="form-actions"><button type="button" class="button secondary danger" data-action="logout">退出登录</button></div></section>';
}
async function addToCart(id,quantity=1){if(!requireLogin())return;await api('/api/cart',{method:'POST',body:JSON.stringify({product_id:Number(id),quantity:Number(quantity)})});toast('已放进购物袋');await cartCount();if(S.view==='cart')await loadCart();}
document.addEventListener('click',async e=>{
 const view=e.target.closest('[data-view]');if(view){e.preventDefault();await setView(view.dataset.view);return;}
 const el=e.target.closest('[data-action]');if(!el||el.disabled)return;const action=el.dataset.action;el.disabled=true;
 try{
  if(action==='close')closeModal();
  else if(action==='reset-catalog'){S.keyword='';S.category='';S.page=1;await setView('catalog');}
  else if(action==='login')authDialog();
  else if(action==='profile')await setView('profile');
  else if(action==='logout'){window.ZhuyingDemo.logout();syncShopSession();await cartCount();await setView('catalog');toast('已退出登录');}
  else if(action==='browse')$('#collection').scrollIntoView({behavior:'smooth'});
  else if(action==='category'){S.category=el.dataset.value;S.page=1;await loadCatalog();$('#collection').scrollIntoView({behavior:'smooth'});}
  else if(action==='catalog-page'){S.page=Number(el.dataset.page);await loadCatalog();$('#collection').scrollIntoView({behavior:'smooth'});}
  else if(action==='product')await productDialog(el.dataset.id);
  else if(action==='add-cart')await addToCart(el.dataset.id);
  else if(action==='cart-quantity'){await api('/api/cart/'+el.dataset.id,{method:'PUT',body:JSON.stringify({quantity:Number(el.dataset.quantity)})});await loadCart();}
  else if(action==='cart-remove'){await api('/api/cart/'+el.dataset.id,{method:'DELETE'});await loadCart();toast('已移出购物袋');}
  else if(action==='checkout')await checkoutDialog();
  else if(action==='order-status'){S.orderStatus=el.dataset.status;S.orderPage=1;await loadOrders();}
  else if(action==='orders-page'){S.orderPage=Number(el.dataset.page);await loadOrders();window.scrollTo({top:0,behavior:'smooth'});}
  else if(action==='order-detail')await orderDetail(el.dataset.id);
  else if(action==='order-cancel')cancelDialog(el.dataset.id);
  else if(action==='order-cancel-confirm'){await api('/api/orders/'+el.dataset.id+'/cancel',{method:'PUT',body:'{}'});closeModal();await setView('orders');await cartCount();toast('订单已取消，库存已恢复');}
 }catch(error){toast(error.message,true);}finally{el.disabled=false;}
});
document.addEventListener('submit',async e=>{
 const form=e.target.closest('form[data-form]');if(!form)return;e.preventDefault();const button=form.querySelector('button:not([type="button"])');if(button?.disabled)return;if(button)button.disabled=true;const data=Object.fromEntries(new FormData(form));const type=form.dataset.form;
 try{
  if(type==='login'){const {user}=await api('/api/auth/login',{method:'POST',body:JSON.stringify(data)});syncShopSession();closeModal();await cartCount();toast('欢迎你，'+user.display_name);}
  else if(type==='search'){S.keyword=data.keyword.trim();S.page=1;await loadCatalog();$('#collection').scrollIntoView({behavior:'smooth'});}
  else if(type==='product-add'){await addToCart(form.dataset.id,data.quantity);}
  else if(type==='checkout'){if(!S.selected.size)throw new Error('请选择商品');const d=await api('/api/orders',{method:'POST',body:JSON.stringify({address_id:Number(data.address_id),cart_ids:[...S.selected]})});S.cartLoaded=false;closeModal();S.orderStatus='all';S.orderPage=1;await setView('orders');await cartCount();await orderDetail(d.item.id);toast('待支付订单已创建，未发生扣款');}
 }catch(error){toast(error.message,true);}finally{if(button)button.disabled=false;}
});
document.addEventListener('change',async e=>{
 const el=e.target;
 if(el.matches('[data-cart-select]')){const id=Number(el.dataset.cartSelect);if(el.checked)S.selected.add(id);else S.selected.delete(id);updateSelection();}
 if(el.id==='selectAll'){S.selected=new Set(el.checked?S.cart.map(i=>i.id):[]);document.querySelectorAll('[data-cart-select]').forEach(x=>x.checked=el.checked);updateSelection();}
 if(el.matches('[data-cart-quantity]')){el.disabled=true;try{await api('/api/cart/'+el.dataset.cartQuantity,{method:'PUT',body:JSON.stringify({quantity:Number(el.value)})});await loadCart();}catch(error){toast(error.message,true);await loadCart();}finally{el.disabled=false;}}
});
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal'))closeModal();});
window.addEventListener('storage',()=>{
 const previous = S.token;
 syncShopSession();
 if(previous!==S.token){
  if(!S.user && S.view!=='catalog') void setView('catalog');
  void cartCount();
 }
});
(async()=>{syncShopSession();await setView('catalog');await cartCount();})();
