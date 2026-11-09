'use strict';

const shopDemoKey = 'zhuying-shop-demo-v1';
const shopAddress = {
  id: 1, recipient: '课堂演示收货人', phone: '演示号码', province: '示例省',
  city: '示例市', district: '示例区', detail: '示例路 1 号', is_default: true,
};
let shopMemoryState;
let shopMemoryOnly = false;

function readShopDemo() {
  if (!shopMemoryOnly) {
    try {
      const saved = localStorage.getItem(shopDemoKey);
      if (saved) return JSON.parse(saved);
    } catch {
      shopMemoryOnly = true;
    }
  }
  return shopMemoryState || { cart: {}, orders: [], nextOrder: 1 };
}

function saveShopDemo(state) {
  shopMemoryState = state;
  try {
    localStorage.setItem(shopDemoKey, JSON.stringify(state));
  } catch {
    shopMemoryOnly = true;
  }
}

function shopDemoApi(path, options, token) {
  const url = new URL(path, 'https://shop.invalid');
  const [, , resource, resourceId, action] = url.pathname.split('/');
  const method = options.method || 'GET';
  const read = method === 'GET';
  const body = typeof options.body === 'string' ? JSON.parse(options.body) : {};
  const session = window.ZhuyingDemo;
  const state = readShopDemo();
  const products = shopExamples.products.map(product => ({
    ...product,
    stock: product.stock - state.orders
      .filter(order => order.status === 'pending')
      .flatMap(order => order.items)
      .filter(item => item.product_id === product.id)
      .reduce((total, item) => total + item.quantity, 0),
  }));
  const productById = id => products.find(product => product.id === Number(id));
  const itemResult = item => {
    if (!item) throw new Error('这条演示记录不存在。');
    return { item };
  };
  const paginated = (items, fallback) => {
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get('pageSize')) || fallback));
    const page = Math.max(1, Math.min(Math.ceil(items.length / pageSize), Number(url.searchParams.get('page')) || 1));
    return { items: items.slice((page - 1) * pageSize, page * pageSize), total: items.length, page, pageSize };
  };

  if (read && resource === 'products') {
    if (resourceId) return itemResult(productById(resourceId));
    const category = url.searchParams.get('category');
    const keyword = (url.searchParams.get('keyword') || '').toLowerCase().trim();
    const categories = [...new Set(products.map(product => product.category))];
    const filtered = products.filter(product => (!category || product.category === category)
      && (product.name + product.description).toLowerCase().includes(keyword));
    return { ...paginated(filtered, 12), categories };
  }
  if (resource === 'auth' && resourceId === 'login' && method === 'POST') {
    return session.login(body.username, body.password);
  }
  if (!session?.isAuthorized(token)) throw new Error('请先登录演示账号。');

  const cartItems = () => Object.entries(state.cart).map(([id, quantity]) => {
    const product = productById(id);
    return { ...product, product_id: product.id, quantity, subtotal: Number(product.price) * quantity };
  });

  if (read && resource === 'me') return { user: session.getSession().user };
  if (read && resource === 'addresses') return { items: [shopAddress] };
  if (resource === 'cart') {
    if (read) return { items: cartItems() };
    if (method === 'DELETE' && resourceId) delete state.cart[resourceId];
    else if ((method === 'POST' && !resourceId) || (method === 'PUT' && resourceId)) {
      const product = productById(resourceId || body.product_id);
      if (!product) throw new Error('没有找到这件商品。');
      const requested = Number(body.quantity);
      const quantity = (method === 'POST' ? state.cart[product.id] || 0 : 0) + requested;
      if (!Number.isInteger(requested) || requested < 1 || quantity > product.stock) {
        throw new Error('请选择库存范围内的商品数量。');
      }
      state.cart[product.id] = quantity;
    } else {
      throw new Error('这个操作在课堂演示中不可用。');
    }
    saveShopDemo(state);
    return { items: cartItems() };
  }
  if (resource === 'orders') {
    const order = state.orders.find(entry => entry.id === Number(resourceId));
    if (read && resourceId) return itemResult(order);
    if (read) {
      const status = url.searchParams.get('status');
      return paginated(state.orders.filter(entry => !status || status === 'all' || entry.status === status), 8);
    }
    if (method === 'PUT' && action === 'cancel') {
      if (!order || order.status !== 'pending') throw new Error('这笔订单无法取消。');
      order.status = 'cancelled';
      order.status_label = '已取消';
      saveShopDemo(state);
      return itemResult(order);
    }
    if (method === 'POST' && !resourceId) {
      const selectedIds = new Set(Array.isArray(body.cart_ids) ? body.cart_ids : []);
      const selected = cartItems().filter(item => selectedIds.has(item.id));
      if (Number(body.address_id) !== shopAddress.id || !selected.length || selected.length !== selectedIds.size) {
        throw new Error('请重新选择商品和示例收货地址。');
      }
      if (selected.some(item => item.quantity > item.stock)) throw new Error('商品库存已变化，请调整数量。');
      const id = state.nextOrder++;
      const entry = {
        id, order_no: 'DEMO-' + String(id).padStart(4, '0'), status: 'pending', status_label: '待支付',
        created_at: new Date().toISOString(), address: { ...shopAddress },
        total_price: selected.reduce((total, item) => total + item.subtotal, 0),
        items: selected.map(item => ({
          product_id: item.id, product_name: item.name, product_image: item.image,
          quantity: item.quantity, unit_price: item.price,
        })),
      };
      selected.forEach(item => delete state.cart[item.id]);
      state.orders.unshift(entry);
      saveShopDemo(state);
      return itemResult(entry);
    }
  }
  throw new Error('这个操作在课堂演示中不可用。');
}
