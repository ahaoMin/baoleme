// ===== 全局状态 =====
let currentRestaurant = null;
let cart = {};
let itemPrices = {};
let dailyGrab = null;
let cartType = 'delivery'; // delivery=美食+超市 | mall | leisure
let viewCartType = 'delivery';
let checkoutCartType = 'delivery';
let deliveryTimer = null;
let mallShipTimer = null;

const CART_KEYS = { delivery: 'blm_cart_delivery', mall: 'blm_cart_mall', leisure: 'blm_cart_leisure' };
const LEGACY_CART_KEY = 'blm_cart';

const cartContexts = {
  delivery: { restId: null, items: {}, itemPrices: {}, dailyGrab: null },
  mall: { stores: {} },
  leisure: { restId: null, items: {}, itemPrices: {} },
};

function toMoney(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.round(v * 100) / 100;
}

function formatMoney(n) {
  return toMoney(n).toFixed(2).replace(/\.?0+$/, '') || '0';
}

function genOrderNo() {
  const num = Math.floor(10000000 + Math.random() * 90000000);
  return `BLM-${num}`;
}

function itemLineTotal(price, count) {
  return toMoney(toMoney(price) * count);
}

function resolveItemPrice(storedPrice, dishPrice) {
  return storedPrice != null ? toMoney(storedPrice) : toMoney(dishPrice);
}

function isFoodStore(store) {
  return store?.homeType === 'food';
}

function dishSalesText(dish, store = currentRestaurant) {
  const base = `月售${dish.sales}`;
  if (isFoodStore(store) && dish.kcal > 0) return `${base} · ${dish.kcal}千卡`;
  return base;
}

function storeCartType(store) {
  if (!store) return 'delivery';
  if (store.homeType === 'mall') return 'mall';
  if (store.homeType === 'leisure') return 'leisure';
  return 'delivery';
}

function isDeliveryStore(store) {
  return store && (store.homeType === 'food' || store.homeType === 'supermarket');
}

function isDeliveryOrder(order) {
  if (!order) return false;
  if (order.orderType === 'mall' || order.orderType === 'leisure') return false;
  const store = findStore(order.restId);
  if (!store) return order.orderType !== 'mall' && order.orderType !== 'leisure';
  return isDeliveryStore(store);
}

function isSupermarketOrder(order) {
  if (!order) return false;
  if (order.orderType === 'supermarket') return true;
  if (order.orderType === 'mall' || order.orderType === 'leisure') return false;
  const store = findStore(order.restId);
  return store?.homeType === 'supermarket';
}

function isFoodDeliveryOrder(order) {
  return isDeliveryOrder(order) && !isSupermarketOrder(order);
}

function getTrackingMeta(entry) {
  const isMarket = isSupermarketOrder(entry?.order);
  return {
    isMarket,
    phases: isMarket ? SUPERMARKET_TRACK_PHASES : TRACK_PHASES,
    steps: isMarket ? SUPERMARKET_TRACK_STEPS : FOOD_TRACK_STEPS,
    agentKey: isMarket ? '{staff}' : '{rider}',
    shorts: isMarket ? ['已接单', '选购中', '打包中', '配送中'] : ['已接单', '制作中', '配送中', '即将送达'],
    statusTexts: isMarket
      ? ['订单已确认', '店员正在帮你选购', '收银台打包封袋', '配送中，即将送达']
      : ['订单已确认', '厨房正在做你的饭菜', '骑手已经取了你的订单', '快到你门口了'],
  };
}

function resolveCheckoutType() {
  const fromCartPage = $('page-cart').classList.contains('active');
  if (fromCartPage) return viewCartType;
  if (currentRestaurant) return storeCartType(currentRestaurant);
  return checkoutCartType || cartType;
}

function syncCheckoutTypeFromStore() {
  const fromCartPage = $('page-cart').classList.contains('active');
  if (fromCartPage) {
    checkoutCartType = viewCartType;
    return checkoutCartType;
  }
  if (currentRestaurant) {
    const expected = storeCartType(currentRestaurant);
    if (cartType !== expected) {
      cartType = expected;
      syncCartFromContext(expected);
    }
    checkoutCartType = expected;
    return expected;
  }
  checkoutCartType = checkoutCartType || cartType;
  return checkoutCartType;
}

function ensureMallStoreSlice(restId) {
  const ctx = cartContexts.mall;
  if (!ctx.stores) ctx.stores = {};
  if (!ctx.stores[restId]) ctx.stores[restId] = { items: {}, itemPrices: {} };
  return ctx.stores[restId];
}

function getMallCartGroups(ctx = cartContexts.mall) {
  const stores = ctx.stores || {};
  return Object.entries(stores)
    .filter(([, s]) => Object.keys(s.items || {}).length > 0)
    .map(([restId, s]) => ({ restId, store: findStore(restId), items: s.items, itemPrices: s.itemPrices }))
    .filter((g) => g.store);
}

function findDishInStore(restId, dishId) {
  const r = findStore(restId);
  if (!r) return null;
  for (const c of r.categories) {
    const d = c.items.find((x) => x.id === dishId);
    if (d) return d;
  }
  return null;
}

function syncCartFromContext(type = cartType) {
  const ctx = cartContexts[type];
  if (type === 'mall') {
    const slice = currentRestaurant ? ensureMallStoreSlice(currentRestaurant.id) : { items: {}, itemPrices: {} };
    cart = slice.items;
    itemPrices = slice.itemPrices;
    dailyGrab = null;
    return;
  }
  currentRestaurant = ctx.restId ? findStore(ctx.restId) : null;
  cart = ctx.items;
  itemPrices = ctx.itemPrices;
  dailyGrab = type === 'delivery' ? (ctx.dailyGrab || null) : null;
}

function syncContextFromCart(type = cartType) {
  const ctx = cartContexts[type];
  if (type === 'mall') {
    if (currentRestaurant) {
      const slice = ensureMallStoreSlice(currentRestaurant.id);
      slice.items = { ...cart };
      slice.itemPrices = { ...itemPrices };
      if (Object.keys(slice.items).length === 0) delete ctx.stores[currentRestaurant.id];
    }
    return;
  }
  ctx.restId = currentRestaurant?.id || null;
  ctx.items = { ...cart };
  ctx.itemPrices = { ...itemPrices };
  if (type === 'delivery') ctx.dailyGrab = dailyGrab;
}

function getContextStore(type) {
  if (type === 'mall') return null;
  const ctx = cartContexts[type];
  return ctx.restId ? findStore(ctx.restId) : null;
}

function getContextCount(type) {
  const ctx = cartContexts[type];
  if (type === 'mall') {
    return Object.values(ctx.stores || {}).reduce(
      (sum, s) => sum + Object.values(s.items || {}).reduce((a, n) => a + n, 0),
      0,
    );
  }
  return Object.values(ctx.items).reduce((s, n) => s + n, 0);
}

function getContextSummary(type) {
  const ctx = cartContexts[type];
  if (type === 'mall') {
    let count = 0, total = 0, kcal = 0;
    for (const g of getMallCartGroups(ctx)) {
      for (const [id, n] of Object.entries(g.items)) {
        const d = findDishInStore(g.restId, id);
        if (!d) continue;
        const price = resolveItemPrice(g.itemPrices[id], d.price);
        count += n;
        total += itemLineTotal(price, n);
        kcal += (d.kcal || 0) * n;
      }
    }
    return { count, total: toMoney(total), kcal };
  }
  const store = getContextStore(type);
  let count = 0, total = 0, kcal = 0;
  if (!store) return { count, total, kcal };
  for (const [id, n] of Object.entries(ctx.items)) {
    let d = null;
    for (const c of store.categories) {
      d = c.items.find((x) => x.id === id);
      if (d) break;
    }
    if (!d) continue;
    const price = resolveItemPrice(ctx.itemPrices[id], d.price);
    count += n;
    total += itemLineTotal(price, n);
    kcal += (d.kcal || 0) * n;
  }
  return { count, total: toMoney(total), kcal };
}

const $ = (id) => document.getElementById(id);

// ===== 用户：游客 ID + 本地登录 =====
const GUEST_KEY = 'blm_guest';
const USER_KEY = 'blm_user';
const USERS_KEY = 'blm_users';
const ORDERS_KEY = 'blm_orders';
const COUPON_KEY = 'blm_coupons';
const REVIEWS_KEY = 'blm_reviews';
const CHECKIN_KEY = 'blm_checkin';
const ADDR_KEY = 'blm_addresses';
const ACTIVE_ADDR_KEY = 'blm_active_addr';
const ADDR_LABELS = ['家', '公司', '学校', '其他'];
const AVATARS = ['😋', '🤤', '🐷', '🐱', '🦊', '🐻', '🍚', '🌚'];
let selectedAvatar = AVATARS[0];
let editingAddressId = null;
let addressReturnPage = 'page-profile';

function genId(prefix) {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function ensureGuest() {
  try {
    const g = JSON.parse(localStorage.getItem(GUEST_KEY));
    if (g && g.guestId) return g;
  } catch { /* ignore */ }
  const guest = { guestId: genId('G'), createdAt: Date.now() };
  localStorage.setItem(GUEST_KEY, JSON.stringify(guest));
  return guest;
}

function getGuest() {
  return ensureGuest();
}

function getUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
}

function isLoggedIn() {
  return !!getUser()?.userId;
}

function getOwnerId() {
  const user = getUser();
  return user ? user.userId : getGuest().guestId;
}

function getUsersRegistry() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { return []; }
}

function saveUsersRegistry(list) {
  localStorage.setItem(USERS_KEY, JSON.stringify(list));
}

function findUserByName(name) {
  return getUsersRegistry().find((u) => u.name === name);
}

function requireLogin(msg) {
  if (!isLoggedIn()) {
    toast(msg || '请先登录');
    openLogin();
    return false;
  }
  return true;
}

function migrateLegacyData() {
  const ownerId = getGuest().guestId;
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  let changed = false;
  orders.forEach((o) => {
    if (!o.ownerId) { o.ownerId = ownerId; changed = true; }
  });
  if (changed) localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

  const coupons = JSON.parse(localStorage.getItem(COUPON_KEY) || '[]');
  changed = false;
  coupons.forEach((c) => {
    if (!c.ownerId) { c.ownerId = ownerId; changed = true; }
  });
  if (changed) localStorage.setItem(COUPON_KEY, JSON.stringify(coupons));
}

function getOrders() {
  const ownerId = getOwnerId();
  try {
    return (JSON.parse(localStorage.getItem(ORDERS_KEY)) || []).filter((o) => o.ownerId === ownerId);
  } catch { return []; }
}

function saveOrder(order) {
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  orders.unshift({ ...order, ownerId: getOwnerId() });
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders.slice(0, 200)));
}

function updateUserChip() {
  const user = getUser();
  $('user-chip').textContent = user ? user.avatar : '👤';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function maskPhone(phone) {
  const p = String(phone || '');
  if (p.length >= 7) return `${p.slice(0, 3)}****${p.slice(-4)}`;
  return p;
}

function shortAddress(detail, max = 14) {
  const t = String(detail || '');
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

// ===== 收货地址 =====
function getAllAddressesRaw() {
  try { return JSON.parse(localStorage.getItem(ADDR_KEY)) || []; } catch { return []; }
}

function saveAllAddressesRaw(list) {
  localStorage.setItem(ADDR_KEY, JSON.stringify(list));
}

function getActiveAddrMap() {
  try { return JSON.parse(localStorage.getItem(ACTIVE_ADDR_KEY)) || {}; } catch { return {}; }
}

function saveActiveAddrMap(map) {
  localStorage.setItem(ACTIVE_ADDR_KEY, JSON.stringify(map));
}

function getAddresses() {
  const ownerId = getOwnerId();
  return getAllAddressesRaw().filter((a) => a.ownerId === ownerId);
}

function ensureDefaultAddresses() {
  const ownerId = getOwnerId();
  const all = getAllAddressesRaw();
  if (all.some((a) => a.ownerId === ownerId)) return;

  const defaults = [
    { label: '家', name: '哈基米', phone: '13888888888', detail: '幸福小区3号楼2单元502', isDefault: true },
    { label: '公司', name: '哈基米', phone: '13888888888', detail: '科技园A座18楼', isDefault: false },
  ];
  const created = defaults.map((d) => ({
    id: genId('A'),
    ownerId,
    ...d,
  }));
  all.push(...created);
  saveAllAddressesRaw(all);

  const map = getActiveAddrMap();
  map[ownerId] = created[0].id;
  saveActiveAddrMap(map);
}

function getActiveAddressId() {
  const ownerId = getOwnerId();
  const map = getActiveAddrMap();
  const addresses = getAddresses();
  if (!addresses.length) return null;
  if (map[ownerId] && addresses.some((a) => a.id === map[ownerId])) return map[ownerId];
  const def = addresses.find((a) => a.isDefault) || addresses[0];
  return def ? def.id : null;
}

function getActiveAddress() {
  const id = getActiveAddressId();
  return getAddresses().find((a) => a.id === id) || null;
}

function setActiveAddress(id) {
  const ownerId = getOwnerId();
  const addresses = getAddresses();
  if (!addresses.some((a) => a.id === id)) return;
  const map = getActiveAddrMap();
  map[ownerId] = id;
  saveActiveAddrMap(map);
  updateHomeLocation();
  renderCheckoutAddress();
  if ($('page-profile').classList.contains('active')) renderProfileAddresses();
  if ($('page-addresses').classList.contains('active')) renderAddressesPage();
}

function saveAddress(addr) {
  const ownerId = getOwnerId();
  const all = getAllAddressesRaw();
  const mine = all.filter((a) => a.ownerId === ownerId);
  let next = { ...addr, ownerId };

  if (addr.id) {
    const idx = all.findIndex((a) => a.id === addr.id && a.ownerId === ownerId);
    if (idx >= 0) all[idx] = { ...all[idx], ...next };
  } else {
    next.id = genId('A');
    if (mine.length === 0) next.isDefault = true;
    all.push(next);
  }

  if (next.isDefault) {
    all.forEach((a) => {
      if (a.ownerId === ownerId) a.isDefault = a.id === (addr.id || next.id);
    });
  }

  saveAllAddressesRaw(all);

  const activeId = getActiveAddressId();
  if (!activeId || next.isDefault) setActiveAddress(addr.id || next.id);
  else updateHomeLocation();

  return addr.id || next.id;
}

function deleteAddress(id) {
  const ownerId = getOwnerId();
  const all = getAllAddressesRaw();
  const target = all.find((a) => a.id === id && a.ownerId === ownerId);
  if (!target) return;

  const remaining = all.filter((a) => !(a.id === id && a.ownerId === ownerId));
  saveAllAddressesRaw(remaining);

  const map = getActiveAddrMap();
  if (map[ownerId] === id) {
    const next = remaining.find((a) => a.ownerId === ownerId && a.isDefault)
      || remaining.find((a) => a.ownerId === ownerId);
    if (next) map[ownerId] = next.id;
    else delete map[ownerId];
    saveActiveAddrMap(map);
  }

  if (remaining.filter((a) => a.ownerId === ownerId).length === 1) {
    remaining.forEach((a) => {
      if (a.ownerId === ownerId) a.isDefault = true;
    });
    saveAllAddressesRaw(remaining);
  }

  updateHomeLocation();
  renderCheckoutAddress();
  if ($('page-profile').classList.contains('active')) renderProfileAddresses();
  if ($('page-addresses').classList.contains('active')) renderAddressesPage();
  toast('地址已删除');
}

function updateHomeLocation() {
  const addr = getActiveAddress();
  const el = $('home-location');
  if (!addr) {
    el.textContent = '📍 添加收货地址 ›';
    return;
  }
  el.textContent = `📍 ${shortAddress(addr.detail)} ›`;
}

function renderCheckoutAddress() {
  const addr = getActiveAddress();
  if (!addr) {
    $('checkout-addr-line1').innerHTML = '📍 请添加收货地址';
    $('checkout-addr-line2').textContent = '点击选择或新增地址';
    return;
  }
  $('checkout-addr-line1').innerHTML = `📍 ${escapeHtml(addr.detail)} <span class="addr-tag">${escapeHtml(addr.label)}</span>`;
  $('checkout-addr-line2').textContent = `${addr.name} ${maskPhone(addr.phone)}`;
}

function addressItemHtml(a, mode) {
  const activeId = getActiveAddressId();
  const isActive = a.id === activeId;
  if (mode === 'picker') {
    return `
      <div class="addr-pick-item ${isActive ? 'active' : ''}" onclick="selectAddress('${a.id}')">
        <div class="addr-pick-main">
          <div class="addr-pick-line1">${escapeHtml(a.detail)} <span class="addr-tag">${escapeHtml(a.label)}</span>${a.isDefault ? '<span class="addr-default-tag">默认</span>' : ''}</div>
          <div class="addr-pick-line2">${escapeHtml(a.name)} ${maskPhone(a.phone)}</div>
        </div>
        ${isActive ? '<span class="addr-pick-check">✓</span>' : ''}
      </div>
    `;
  }
  return `
    <div class="addr-manage-item">
      <div class="addr-manage-main" onclick="selectAddress('${a.id}')">
        <div class="addr-pick-line1">${escapeHtml(a.detail)} <span class="addr-tag">${escapeHtml(a.label)}</span>${a.isDefault ? '<span class="addr-default-tag">默认</span>' : ''}${isActive ? '<span class="addr-using-tag">使用中</span>' : ''}</div>
        <div class="addr-pick-line2">${escapeHtml(a.name)} ${maskPhone(a.phone)}</div>
      </div>
      <div class="addr-manage-actions">
        <button class="addr-action-btn" onclick="openAddressForm('${a.id}')">编辑</button>
        ${!a.isDefault ? `<button class="addr-action-btn" onclick="setDefaultAddress('${a.id}')">设默认</button>` : ''}
        <button class="addr-action-btn danger" onclick="confirmDeleteAddress('${a.id}')">删除</button>
      </div>
    </div>
  `;
}

function renderProfileAddresses() {
  const addresses = getAddresses();
  $('profile-address-count').textContent = `${addresses.length}个`;
  const listEl = $('profile-address-list');
  if (addresses.length === 0) {
    listEl.innerHTML = `
      <div class="profile-coupon-empty" onclick="addressReturnPage='page-profile'; goAddresses()">
        还没有地址，去添加一个 ›
      </div>
    `;
    return;
  }
  listEl.innerHTML = addresses.slice(0, 2).map((a) => `
    <div class="profile-address-item" onclick="goAddresses()">
      <span class="profile-address-label">${escapeHtml(a.label)}</span>
      <span class="profile-address-detail">${escapeHtml(a.detail)}</span>
      <span class="profile-coupon-arrow">›</span>
    </div>
  `).join('');
}

function openAddressPicker() {
  ensureDefaultAddresses();
  const addresses = getAddresses();
  const list = $('address-picker-list');
  if (addresses.length === 0) {
    list.innerHTML = `<div class="addr-empty-tip">还没有收货地址，先去添加一个吧</div>`;
  } else {
    list.innerHTML = addresses.map((a) => addressItemHtml(a, 'picker')).join('');
  }
  $('address-picker-modal').classList.add('open');
}

function closeAddressPicker() {
  $('address-picker-modal').classList.remove('open');
}

function selectAddress(id) {
  setActiveAddress(id);
  closeAddressPicker();
  toast('已切换收货地址');
}

function goAddressesFromPicker() {
  closeAddressPicker();
  addressReturnPage = 'page-home';
  goAddresses();
}

function goAddresses() {
  ensureDefaultAddresses();
  renderAddressesPage();
  showPage('page-addresses');
}

function backFromAddresses() {
  showPage(addressReturnPage);
  addressReturnPage = 'page-profile';
  updateHomeLocation();
}

function renderAddressesPage() {
  const addresses = getAddresses();
  const body = $('address-page-body');
  if (addresses.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-emoji">📍</div>
        <div class="cart-empty-title">还没有收货地址</div>
        <div class="cart-empty-sub">外卖永远不会送达，但地址可以先填好</div>
        <button class="cart-empty-btn" onclick="openAddressForm()">新增地址</button>
      </div>
    `;
    return;
  }
  body.innerHTML = addresses.map((a) => addressItemHtml(a, 'manage')).join('');
}

function openAddressForm(id) {
  editingAddressId = id || null;
  $('address-form-title').textContent = id ? '编辑地址' : '新增地址';

  const addr = id ? getAddresses().find((a) => a.id === id) : null;
  document.querySelectorAll('.addr-label-pill').forEach((el) => {
    el.classList.toggle('active', el.dataset.label === (addr?.label || '家'));
  });
  $('addr-name-input').value = addr?.name || (getUser()?.name || '');
  $('addr-phone-input').value = addr?.phone || '';
  $('addr-detail-input').value = addr?.detail || '';

  $('address-form-modal').classList.add('open');
}

function closeAddressForm() {
  $('address-form-modal').classList.remove('open');
  editingAddressId = null;
}

function pickAddrLabel(el) {
  document.querySelectorAll('.addr-label-pill').forEach((x) => x.classList.remove('active'));
  el.classList.add('active');
}

function saveAddressForm() {
  const label = document.querySelector('.addr-label-pill.active')?.dataset.label || '家';
  const name = $('addr-name-input').value.trim();
  const phone = $('addr-phone-input').value.trim();
  const detail = $('addr-detail-input').value.trim();

  if (!name) { toast('请填写联系人'); return; }
  if (!/^1\d{10}$/.test(phone)) { toast('请填写11位手机号'); return; }
  if (detail.length < 4) { toast('详细地址太短了'); return; }

  const existing = editingAddressId ? getAddresses().find((a) => a.id === editingAddressId) : null;
  const wasEdit = !!editingAddressId;
  saveAddress({
    id: editingAddressId || undefined,
    label,
    name,
    phone,
    detail,
    isDefault: existing ? existing.isDefault : getAddresses().length === 0,
  });

  closeAddressForm();
  renderProfileAddresses();
  if ($('page-addresses').classList.contains('active')) renderAddressesPage();
  toast(wasEdit ? '地址已更新' : '地址已添加');
}

function setDefaultAddress(id) {
  const ownerId = getOwnerId();
  const all = getAllAddressesRaw();
  all.forEach((a) => {
    if (a.ownerId === ownerId) a.isDefault = a.id === id;
  });
  saveAllAddressesRaw(all);
  setActiveAddress(id);
  toast('已设为默认地址');
}

function confirmDeleteAddress(id) {
  const addresses = getAddresses();
  if (addresses.length <= 1) {
    toast('至少保留一个地址');
    return;
  }
  deleteAddress(id);
}

// ===== 购物车持久化（三套独立） =====
function persistAllCarts() {
  syncContextFromCart(cartType);
  Object.entries(CART_KEYS).forEach(([type, key]) => {
    const ctx = cartContexts[type];
    if (type === 'mall') {
      const hasItems = Object.values(ctx.stores || {}).some((s) => Object.keys(s.items || {}).length > 0);
      if (hasItems) {
        localStorage.setItem(key, JSON.stringify({ stores: ctx.stores }));
      } else {
        localStorage.removeItem(key);
      }
      return;
    }
    if (ctx.restId && Object.keys(ctx.items).length > 0) {
      const data = { restId: ctx.restId, items: ctx.items, itemPrices: ctx.itemPrices };
      if (type === 'delivery') data.dailyGrab = ctx.dailyGrab || null;
      localStorage.setItem(key, JSON.stringify(data));
    } else {
      localStorage.removeItem(key);
      if (type === 'delivery') ctx.dailyGrab = null;
    }
  });
  updateTabBadge();
}

function persistCart() {
  persistAllCarts();
}

function loadAllCarts() {
  const legacy = localStorage.getItem(LEGACY_CART_KEY);
  if (legacy && !localStorage.getItem(CART_KEYS.delivery)) {
    localStorage.setItem(CART_KEYS.delivery, legacy);
    localStorage.removeItem(LEGACY_CART_KEY);
  }
  Object.entries(CART_KEYS).forEach(([type, key]) => {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (type === 'mall') {
        if (saved?.stores) {
          cartContexts.mall.stores = saved.stores;
        } else if (saved?.restId && findStore(saved.restId)) {
          cartContexts.mall.stores = {
            [saved.restId]: { items: saved.items || {}, itemPrices: saved.itemPrices || {} },
          };
        }
        return;
      }
      if (saved?.restId && findStore(saved.restId)) {
        cartContexts[type].restId = saved.restId;
        cartContexts[type].items = saved.items || {};
        cartContexts[type].itemPrices = saved.itemPrices || {};
        if (type === 'delivery') {
          cartContexts[type].dailyGrab = saved.dailyGrab || null;
          if (!Object.keys(cartContexts[type].itemPrices).length && cartContexts[type].dailyGrab) {
            cartContexts[type].itemPrices = {
              [cartContexts[type].dailyGrab.dishId]: cartContexts[type].dailyGrab.specialPrice,
            };
          }
        }
      }
    } catch { /* ignore */ }
  });
  syncCartFromContext('delivery');
  updateTabBadge();
}

function loadCart() {
  loadAllCarts();
}

function updateTabBadge() {
  const badge = $('tab-cart-badge');
  const count = getContextCount('delivery') + getContextCount('mall') + getContextCount('leisure');
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

function switchCartTab(type) {
  syncContextFromCart(cartType);
  viewCartType = type;
  document.querySelectorAll('.cart-type-tab').forEach((el) => {
    el.classList.toggle('active', el.dataset.type === type);
  });
  renderCartPage();
}

// ===== 页面切换 =====
// 四个主页面显示常驻底部导航；点餐/结算/配送等沉浸流程隐藏
const TAB_PAGES = { 'page-home': 0, 'page-cart': 1, 'page-orders': 2, 'page-profile': 3 };

function showPage(pageId) {
  document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));
  $(pageId).classList.add('active');

  const tabIdx = TAB_PAGES[pageId];
  $('tabbar').style.display = tabIdx === undefined ? 'none' : 'flex';
  if (tabIdx !== undefined) {
    for (let i = 0; i < 4; i++) {
      $(`tab-${i}`).classList.toggle('active', i === tabIdx);
    }
  }

  if (pageId === 'page-mall-shipping') {
    const entry = getViewingMallEntry();
    if (entry && !entry.order.pendingUnbox) {
      renderMallShippingUI(getMallShipProgressFor(entry), entry.order);
    }
  }
  if (pageId === 'page-tracking') {
    const entry = getViewingDeliveryEntry();
    if (entry) renderDeliveryTrackingUI(entry);
  }

  window.scrollTo(0, 0);
}

function goHome(cat) {
  if (cat) selectHomeCategory(cat);
  showPage('page-home');
}

const CART_HOME_CATEGORY = {
  delivery: 'food',
  mall: 'mall',
  leisure: 'leisure',
};

function backToRestaurant() {
  // 可能是从购物车页直接去的结算，餐厅页尚未渲染过，统一走 openRestaurant
  if (currentRestaurant) {
    openRestaurant(currentRestaurant.id);
  } else {
    goHome();
  }
}

// ===== 首页：分类与店铺列表 =====
let homeCategory = 'food';
let homeOrder = ALL_STORES.filter((s) => s.homeType === 'food').map((s) => s.id);

function findStore(id) {
  return ALL_STORES.find((s) => s.id === id);
}

function getStoresByCategory(cat) {
  return ALL_STORES.filter((s) => s.homeType === cat);
}

function storeMetaLine(s) {
  if (s.homeType === 'leisure') {
    const label = s.deliveryLabel || '到店/线上';
    return `${label} · ${s.distance}`;
  }
  if (s.homeType === 'mall') {
    return `${s.deliveryLabel || '快递配送'} · ${s.distance}`;
  }
  const time = s.deliveryLabel || `${s.deliveryTime}分钟`;
  return `${time} · ${s.distance}`;
}

function storeMinTag(s) {
  if (s.homeType === 'leisure') return '优惠套餐';
  if (s.homeType === 'mall') return s.minOrder > 0 ? `¥${s.minOrder}起购` : '包邮';
  return `¥${s.minOrder}起送`;
}

function storeFeeTag(s) {
  if (s.homeType === 'leisure') return '免预约费';
  if (s.homeType === 'mall') return '包邮';
  return s.deliveryFee === 0 ? '免配送费' : `配送¥${s.deliveryFee}`;
}

function stripPriceLabel(s) {
  if (s.homeType === 'leisure') return '起';
  if (s.homeType === 'mall') return '到手价';
  return '预估价';
}

function updateFilterPills() {
  const filters = HOME_FILTERS[homeCategory] || HOME_FILTERS.food;
  $('filter-row').innerHTML = filters.map((text, i) => `
    <span class="pill${i === 0 ? ' active' : ''}" onclick="${i === 0 ? 'shuffleHomeList()' : 'fakeFilter(this)'}">${text}</span>
  `).join('');
}

function selectHomeCategory(cat) {
  homeCategory = cat;
  homeOrder = getStoresByCategory(cat).map((s) => s.id);
  document.querySelectorAll('.cat2').forEach((el) => {
    el.classList.toggle('active', el.dataset.cat === cat);
  });
  updateFilterPills();
  renderHome();
}

function renderHome() {
  const list = $('restaurant-list');
  list.innerHTML = homeOrder.map((id) => {
    const r = findStore(id);
    if (!r) return '';
    const dishes = r.categories.flatMap((c) => c.items).slice(0, 4);
    return `
      <div class="rest-card" onclick="openRestaurant('${r.id}')">
        <div class="rest-row">
          <div class="rest-logo">${r.emoji}</div>
          <div class="rest-info">
            <div class="rest-name">${r.name}</div>
            <div class="rest-line">
              <span class="rest-rating">${r.rating}分</span>
              <span>月售${r.monthlySales}+</span>
              <span class="rest-line-right">${storeMetaLine(r)}</span>
            </div>
            <div class="rest-tags">
              <span class="rest-tag">${storeMinTag(r)}</span>
              <span class="rest-tag">${storeFeeTag(r)}</span>
              ${r.tags.map((t) => `<span class="rest-tag blue">${t}</span>`).join('')}
            </div>
          </div>
        </div>
        <div class="dish-strip">
          ${dishes.map((d) => `
            <div class="strip-dish">
              <div class="strip-img">${d.emoji}</div>
              <div class="strip-name">${d.name}</div>
              <div class="strip-price">¥${d.price} <small>${stripPriceLabel(r)}</small></div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function shuffleHomeList() {
  homeOrder.sort(() => Math.random() - 0.5);
  renderHome();
  const msgs = {
    food: '已为你换了一批口味 😋',
    supermarket: '已换一批超市，囤货走起 🛒',
    mall: '已换一批好物，随便逛 🛍️',
    leisure: '已换一批玩乐商家，开嗨 🎮',
  };
  toast(msgs[homeCategory] || msgs.food);
}

function shuffleRestaurants() {
  shuffleHomeList();
}

function fakeSearch() {
  toast('搜什么搜，反正都不要钱，随便点 😏');
}

function fakePromo() {
  toast('在线拼单功能装修中，先一个人假装拼～');
}

function resolveSpecial(item) {
  const rest = findStore(item.restId);
  if (!rest) return null;
  for (const c of rest.categories) {
    const dish = c.items.find((d) => d.id === item.dishId);
    if (dish) return { rest, dish, specialPrice: item.specialPrice, sold: item.sold };
  }
  return null;
}

function goDailySpecials() {
  renderDailySpecials();
  showPage('page-daily');
}

function renderDailySpecials() {
  const body = $('daily-body');
  body.innerHTML = DAILY_SPECIALS.map((item) => {
    const s = resolveSpecial(item);
    if (!s) return '';
    const { rest, dish, specialPrice, sold } = s;
    const discount = Math.round((1 - specialPrice / dish.price) * 100);
    const dGrab = cartContexts.delivery.dailyGrab;
    const grabbed = dGrab && dGrab.dishId === item.dishId && dGrab.restId === item.restId;
    const locked = dGrab && !grabbed;
    const btn = grabbed
      ? '<span class="daily-grabbed">已抢</span>'
      : `<button class="daily-add${locked ? ' disabled' : ''}" ${locked ? 'disabled' : ''} onclick="grabDailySpecial('${item.restId}', '${item.dishId}')">+</button>`;
    return `
      <div class="daily-item">
        <div class="daily-img">${dish.emoji}</div>
        <div class="daily-info">
          <div class="daily-name">${dish.name}</div>
          <div class="daily-rest">${rest.emoji} ${rest.name}</div>
          <div class="daily-sales">月售${sold}+ · 限今日 · 点 + 直入购物车</div>
        </div>
        <div class="daily-price-col">
          <div class="daily-price">¥${specialPrice}</div>
          <div class="daily-orig">¥${dish.price}</div>
          <div class="daily-tag">${discount > 0 ? discount + '折' : '特价'}</div>
        </div>
        ${btn}
      </div>
    `;
  }).join('');
}

function grabDailySpecial(restId, dishId) {
  const item = DAILY_SPECIALS.find((x) => x.restId === restId && x.dishId === dishId);
  const s = item ? resolveSpecial(item) : null;
  if (!s) return;

  const dGrab = cartContexts.delivery.dailyGrab;
  if (dGrab) {
    if (dGrab.dishId === dishId && dGrab.restId === restId) {
      toast('已在购物车，每人限抢1份');
      return;
    }
    toast('每次只能抢一个特价，外卖/超市仅限同一家店');
    return;
  }

  const dCtx = cartContexts.delivery;
  if (dCtx.restId && dCtx.restId !== restId && Object.keys(dCtx.items).length > 0) {
    toast('外卖/超市仅限同一家，请先清空购物车');
    return;
  }

  currentRestaurant = s.rest;
  cartType = 'delivery';
  cart = { [dishId]: 1 };
  itemPrices = { [dishId]: s.specialPrice };
  dailyGrab = { restId, dishId, specialPrice: s.specialPrice };
  syncContextFromCart('delivery');
  persistAllCarts();
  renderDailySpecials();
  if ($('page-cart').classList.contains('active')) renderCartPage();
  toast(`已抢 ${s.dish.name}，特价 ¥${s.specialPrice} 已放入购物车`);
}

function updateDailyPromoCard() {
  const min = Math.min(...DAILY_SPECIALS.map((x) => x.specialPrice));
  const first = resolveSpecial(DAILY_SPECIALS[0]);
  $('daily-promo-price').textContent = `${min}元起`;
  if (first) $('daily-promo-emoji').textContent = first.dish.emoji;
}

// ===== 抢券中心 =====
let couponFilter = 'all';
let selectedCouponId = null; // 结算页选中的券，null=自动最优，'none'=不使用

function getGrabbedCoupons() {
  if (!isLoggedIn()) return [];
  const ownerId = getOwnerId();
  try {
    return (JSON.parse(localStorage.getItem(COUPON_KEY)) || []).filter((c) => c.ownerId === ownerId);
  } catch { return []; }
}

function isCouponGrabbed(id) {
  return getGrabbedCoupons().some((c) => c.id === id);
}

function grabCoupon(id) {
  if (!requireLogin('登录后才能抢券哦 🎫')) return;
  const c = COUPONS.find((x) => x.id === id);
  if (!c) return;
  if (c.soldOut) {
    toast('手慢了，这张券早就被抢光了 😿');
    return;
  }
  if (isCouponGrabbed(id)) {
    toast('你已经抢过这张了，贪心！');
    return;
  }
  if (grantCoupon(id)) {
    toast(`抢到 ${c.name}！已收入券包 🎫`);
    renderCouponsPage(couponFilter);
    if ($('page-profile').classList.contains('active')) renderProfile();
    if ($('coupon-modal').classList.contains('open')) openCouponDetail(id);
  }
}

function grantCoupon(id) {
  const c = COUPONS.find((x) => x.id === id);
  if (!c) return false;
  if (c.soldOut) {
    toast('手慢了，这张券早就被抢光了 😿');
    return false;
  }
  if (isCouponGrabbed(id)) {
    return false;
  }
  const list = JSON.parse(localStorage.getItem(COUPON_KEY) || '[]');
  list.unshift({ id, grabTime: Date.now(), ownerId: getOwnerId() });
  localStorage.setItem(COUPON_KEY, JSON.stringify(list));
  return true;
}

function grantSignInCoupon(preferredId) {
  if (grantCoupon(preferredId)) return preferredId;
  const fallback = SIGN_IN_REWARDS.map((r) => r.couponId)
    .concat(['c21', 'c17', 'c22', 'c4'])
    .find((id) => !isCouponGrabbed(id) && !COUPONS.find((x) => x.id === id)?.soldOut);
  if (fallback && grantCoupon(fallback)) return fallback;
  return null;
}

function getBestCoupon(orderTotal) {
  const grabbed = getGrabbedCoupons();
  let best = null;
  for (const g of grabbed) {
    const c = COUPONS.find((x) => x.id === g.id);
    if (!c || orderTotal < c.min) continue;
    if (!best || c.amount > best.amount) best = c;
  }
  return best;
}

function getCheckoutCoupon(orderTotal) {
  if (selectedCouponId === 'none') return null;
  if (selectedCouponId) {
    const c = COUPONS.find((x) => x.id === selectedCouponId);
    if (c && orderTotal >= c.min) return c;
    return null;
  }
  return getBestCoupon(orderTotal);
}

function consumeCoupon(id) {
  if (!id || !isLoggedIn()) return false;
  const ownerId = getOwnerId();
  const list = JSON.parse(localStorage.getItem(COUPON_KEY) || '[]');
  const idx = list.findIndex((c) => c.id === id && c.ownerId === ownerId);
  if (idx === -1) return false;
  list.splice(idx, 1);
  localStorage.setItem(COUPON_KEY, JSON.stringify(list));
  return true;
}

function finalizeCheckoutCoupon(type) {
  const { coupon, couponDiscount } = checkoutNumbers(type);
  if (!coupon || couponDiscount <= 0) return null;
  if (!consumeCoupon(coupon.id)) return null;
  selectedCouponId = null;
  refreshCouponUI();
  return { id: coupon.id, name: coupon.name, amount: coupon.amount, discount: couponDiscount };
}

function refreshCouponUI() {
  if ($('page-profile').classList.contains('active')) renderProfile();
  if ($('page-coupons').classList.contains('active')) renderCouponsPage(couponFilter);
  if ($('page-my-coupons').classList.contains('active')) renderMyCouponsPage();
}

function goMyCoupons() {
  if (!requireLogin('登录后查看券包 🎫')) return;
  renderMyCouponsPage();
  showPage('page-my-coupons');
}

function renderMyCouponsPage() {
  const grabbed = getGrabbedCoupons();
  const body = $('my-coupons-body');
  if (grabbed.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-emoji">🎫</div>
        <div class="cart-empty-title">券包空空如也</div>
        <div class="cart-empty-sub">去抢券中心囤几张，反正不要钱</div>
        <button class="cart-empty-btn" onclick="goCoupons()">去抢券</button>
      </div>
    `;
    return;
  }
  body.innerHTML = grabbed.map((g) => {
    const c = COUPONS.find((x) => x.id === g.id);
    if (!c) return '';
    const minText = c.min === 0 ? '无门槛' : `满${c.min}可用`;
    return `
      <div class="cpn-card is-grabbed" onclick="openCouponDetail('${c.id}')">
        <div class="cpn-left">
          <div class="cpn-amt"><small>¥</small>${c.amount}</div>
          <div class="cpn-min">${minText}</div>
        </div>
        <div class="cpn-right">
          <div class="cpn-name">${c.name}</div>
          <div class="cpn-desc">${c.desc}</div>
          <div class="cpn-scope">${c.scope}</div>
          <div class="cpn-foot">
            <span class="cpn-meta">${formatExpire(g.grabTime, c.expireDays)}</span>
            <span class="cpn-btn grabbed">查看详情 ›</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function goCoupons() {
  couponFilter = 'all';
  document.querySelectorAll('.ctab').forEach((t) => t.classList.toggle('active', t.dataset.cat === 'all'));
  renderCouponsPage('all');
  showPage('page-coupons');
  if (!isLoggedIn()) toast('浏览可以，抢券需要登录 🎫');
}

function filterCoupons(cat, el) {
  couponFilter = cat;
  document.querySelectorAll('.ctab').forEach((t) => t.classList.remove('active'));
  el.classList.add('active');
  renderCouponsPage(cat);
}

function renderCouponsPage(cat) {
  const grabbed = getGrabbedCoupons();
  $('coupons-owned').textContent = grabbed.length ? ` · 已囤 ${grabbed.length} 张` : '';

  const myStrip = $('coupons-my');
  if (grabbed.length > 0) {
    myStrip.style.display = 'block';
    myStrip.innerHTML = `
      <div class="coupons-my-title">我的券包</div>
      <div class="coupons-my-scroll">
        ${grabbed.map((g) => {
          const c = COUPONS.find((x) => x.id === g.id);
          if (!c) return '';
          return `
            <div class="cpn-mini" onclick="openCouponDetail('${c.id}')">
              <div class="cpn-mini-amt">¥${c.amount}</div>
              <div class="cpn-mini-name">${c.name}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } else {
    myStrip.style.display = 'none';
  }

  const list = COUPONS.filter((c) => cat === 'all' || c.category === cat);
  $('coupons-body').innerHTML = list.map((c) => couponCardHtml(c)).join('');
}

function couponCardHtml(c) {
  const grabbed = isCouponGrabbed(c.id);
  const soldOut = c.soldOut;
  const minText = c.min === 0 ? '无门槛' : `满${c.min}可用`;

  let btnHtml;
  if (soldOut) {
    btnHtml = '<span class="cpn-btn soldout">已抢光</span>';
  } else if (grabbed) {
    btnHtml = `<span class="cpn-btn grabbed" onclick="event.stopPropagation(); openCouponDetail('${c.id}')">已领取</span>`;
  } else {
    btnHtml = `<button class="cpn-btn" onclick="event.stopPropagation(); grabCoupon('${c.id}')">立即抢</button>`;
  }

  return `
    <div class="cpn-card ${grabbed ? 'is-grabbed' : ''} ${soldOut ? 'is-soldout' : ''}" onclick="openCouponDetail('${c.id}')">
      <div class="cpn-left">
        <div class="cpn-amt"><small>¥</small>${c.amount}</div>
        <div class="cpn-min">${minText}</div>
      </div>
      <div class="cpn-right">
        <div class="cpn-name">${c.name}</div>
        <div class="cpn-desc">${c.desc}</div>
        <div class="cpn-scope">${c.scope}</div>
        <div class="cpn-bar"><div class="cpn-bar-fill" style="width:${c.grabbedPct}%"></div></div>
        <div class="cpn-foot">
          <span class="cpn-meta">已抢 ${c.grabbedPct}%</span>
          ${btnHtml}
        </div>
      </div>
    </div>
  `;
}

function openCouponDetail(id) {
  const c = COUPONS.find((x) => x.id === id);
  if (!c) return;
  const grabbed = isCouponGrabbed(id);
  const g = getGrabbedCoupons().find((x) => x.id === id);
  const expireText = grabbed && g
    ? formatExpire(g.grabTime, c.expireDays)
    : `领取后 ${c.expireDays} 天内有效`;

  let actionBtn;
  if (c.soldOut) {
    actionBtn = '<button class="cpn-modal-btn disabled" disabled>已抢光</button>';
  } else if (grabbed) {
    actionBtn = '<button class="cpn-modal-btn disabled" disabled>已在券包中</button>';
  } else {
    actionBtn = `<button class="cpn-modal-btn" onclick="grabCoupon('${c.id}')">立即抢券</button>`;
  }

  $('coupon-modal-body').innerHTML = `
    <div class="cpn-detail-ticket">
      <div class="cpn-detail-amt"><small>¥</small>${c.amount}</div>
      <div class="cpn-detail-name">${c.name}</div>
      <div class="cpn-detail-min">${c.min === 0 ? '无门槛' : '满' + c.min + '元可用'}</div>
    </div>
    <div class="cpn-detail-info">
      <div class="cpn-detail-row"><span>适用范围</span><span>${c.scope}</span></div>
      <div class="cpn-detail-row"><span>有效期</span><span>${expireText}</span></div>
      <div class="cpn-detail-row"><span>券说明</span><span>${c.desc}</span></div>
      <div class="cpn-detail-row"><span>使用规则</span><span>每单限用1张；不可提现；反正也不花钱</span></div>
      <div class="cpn-detail-row"><span>热度</span><span>已抢 ${c.grabbedPct}%${c.soldOut ? '（已抢光）' : ''}</span></div>
    </div>
    ${actionBtn}
  `;
  $('coupon-modal').classList.add('open');
}

function closeCouponModal() {
  $('coupon-modal').classList.remove('open');
}

function formatExpire(grabTime, days) {
  const end = new Date(grabTime + days * 86400000);
  return `${end.getFullYear()}.${end.getMonth() + 1}.${end.getDate()} 前有效`;
}

function fakeFilter(el) {
  el.classList.toggle('active');
  toast('筛了个寂寞（每一家都值得点）');
}

// ===== 餐厅页 =====
function openRestaurant(id) {
  const store = findStore(id);
  if (!store) return;
  const nextType = storeCartType(store);

  syncContextFromCart(cartType);

  if (cartType !== nextType) {
    cartType = nextType;
    syncCartFromContext(nextType);
  }

  if (nextType === 'mall') {
    if (!currentRestaurant || currentRestaurant.id !== id) {
      currentRestaurant = store;
      syncCartFromContext('mall');
    }
  } else if (!currentRestaurant || currentRestaurant.id !== id) {
    if (currentRestaurant && Object.keys(cart).length > 0) {
      const tip = nextType === 'delivery'
        ? '换了家店，当前购物车已清空（外卖/超市仅限同一家）'
        : '换了家店，休闲购物车已清空（仅限同一家）';
      toast(tip);
    }
    currentRestaurant = store;
    cart = {};
    itemPrices = {};
    if (nextType === 'delivery') dailyGrab = null;
    syncContextFromCart(cartType);
    persistAllCarts();
  }

  $('rest-name').textContent = currentRestaurant.name;
  const metaSuffix = currentRestaurant.homeType === 'food'
    ? `约${currentRestaurant.deliveryTime}分钟送达`
    : storeMetaLine(currentRestaurant);
  $('rest-meta').textContent = `⭐ ${currentRestaurant.rating} · 月售${currentRestaurant.monthlySales} · ${metaSuffix}`;
  $('rest-notice').textContent = `公告：${currentRestaurant.notice}`;
  $('rest-logo').textContent = currentRestaurant.emoji;

  renderMenu();
  renderRestReviews();
  showRestTab('menu');
  updateCartBar();
  closeCartPanel();
  showPage('page-restaurant');
}

function showRestTab(tab) {
  $('rest-tab-menu').classList.toggle('active', tab === 'menu');
  $('rest-tab-reviews').classList.toggle('active', tab === 'reviews');
  $('rest-menu-panel').style.display = tab === 'menu' ? 'flex' : 'none';
  $('rest-reviews-panel').style.display = tab === 'reviews' ? 'block' : 'none';
}

function getRestReviews(restId) {
  const userOnes = getOrders()
    .filter((o) => o.restId === restId)
    .map((o) => {
      const r = getOrderReview(o.time);
      if (!r) return null;
      const user = getUser();
      return {
        user: user ? user.name : '我',
        avatar: user ? user.avatar : '😋',
        stars: r.stars,
        text: r.text || '用户什么也没说，但星星会说话',
        ago: formatReviewAgo(r.time),
        merchantReply: r.merchantReply,
        isMe: true,
      };
    })
    .filter(Boolean);

  return [...userOnes, ...REST_REVIEWS.filter((s) => s.restId === restId)];
}

function formatReviewAgo(ts) {
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  return `${Math.floor(days / 30)}个月前`;
}

function renderRestReviews() {
  const reviews = getRestReviews(currentRestaurant.id);
  $('rest-review-count').textContent = reviews.length ? `(${reviews.length})` : '';

  if (reviews.length === 0) {
    $('rest-reviews-panel').innerHTML = `
      <div class="rest-review-empty">还没有评价，点一单试试（反正不要钱）</div>
    `;
    return;
  }

  const avg = reviews.reduce((s, r) => s + r.stars, 0) / reviews.length;
  const goodRate = Math.round(reviews.filter((r) => r.stars >= 4).length / reviews.length * 100);

  $('rest-reviews-panel').innerHTML = `
    <div class="rest-review-summary">
      <div class="rest-review-score">
        <div class="rest-review-num">${avg.toFixed(1)}</div>
        <div class="rest-review-stars">${renderStars(Math.round(avg), false)}</div>
      </div>
      <div class="rest-review-meta">
        <div>好评率 <b>${goodRate}%</b></div>
        <div>共 ${reviews.length} 条评价</div>
      </div>
    </div>
    ${reviews.map((r) => `
      <div class="rest-review-item">
        <div class="rest-review-head">
          <span class="rest-review-avatar">${r.avatar || '🙂'}</span>
          <span class="rest-review-user">${r.user}${r.isMe ? '（我）' : ''}</span>
          <span class="rest-review-stars-sm">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</span>
        </div>
        <div class="rest-review-text">${r.text}</div>
        <div class="rest-review-ago">${r.ago}</div>
        ${r.merchantReply ? `
          <div class="rest-review-reply">
            <span class="rest-review-reply-tag">商家回复</span>${r.merchantReply}
          </div>
        ` : ''}
      </div>
    `).join('')}
  `;
}

function renderMenu() {
  const nav = $('menu-nav');
  const items = $('menu-items');

  nav.innerHTML = currentRestaurant.categories.map((c, i) => `
    <div class="menu-nav-item ${i === 0 ? 'active' : ''}" data-idx="${i}" onclick="scrollToCategory(${i})">${c.name}</div>
  `).join('');

  items.innerHTML = currentRestaurant.categories.map((c, i) => `
    <div class="menu-cat-title" id="cat-${i}">${c.name}</div>
    ${c.items.map((d) => renderDish(d)).join('')}
  `).join('');
}

function renderDish(d) {
  return `
    <div class="dish">
      <div class="dish-img">${d.emoji}</div>
      <div class="dish-info">
        <div class="dish-name">${d.name}</div>
        <div class="dish-desc">${d.desc}</div>
        <div class="dish-sales">${dishSalesText(d)}</div>
        <div class="dish-bottom">
          <span class="dish-price">${d.price}</span>
          ${d.origPrice ? `<span class="dish-orig">¥${d.origPrice}</span>` : ''}
          <div class="stepper" id="stepper-${d.id}">${stepperHtml(d.id)}</div>
        </div>
      </div>
    </div>
  `;
}

function stepperHtml(dishId) {
  const count = cart[dishId] || 0;
  if (count === 0) {
    return `<button class="step-btn step-add" onclick="changeCount('${dishId}', 1)">+</button>`;
  }
  return `
    <button class="step-btn step-minus" onclick="changeCount('${dishId}', -1)">−</button>
    <span class="step-count">${count}</span>
    <button class="step-btn step-add" onclick="changeCount('${dishId}', 1)">+</button>
  `;
}

function findDish(dishId) {
  for (const c of currentRestaurant.categories) {
    const d = c.items.find((x) => x.id === dishId);
    if (d) return d;
  }
  return null;
}

function getDishPrice(dishId) {
  if (itemPrices[dishId] != null) return toMoney(itemPrices[dishId]);
  const d = findDish(dishId);
  return d ? toMoney(d.price) : 0;
}

function changeCount(dishId, delta) {
  if (dailyGrab) {
    if (dishId !== dailyGrab.dishId) {
      toast('特价单仅限1份商品，不能再加购');
      return;
    }
    if (delta > 0) {
      toast('每人限抢1份特价');
      return;
    }
  }

  if (delta > 0 && cartType !== 'mall') {
    const ctx = cartContexts[cartType];
    if (ctx.restId && currentRestaurant && ctx.restId !== currentRestaurant.id) {
      toast(cartType === 'leisure' ? '休闲订单仅限同一家，请先清空购物车' : '外卖/超市仅限同一家，请先清空购物车');
      return;
    }
  }

  cart[dishId] = (cart[dishId] || 0) + delta;
  if (cart[dishId] <= 0) {
    delete cart[dishId];
    delete itemPrices[dishId];
    if (dailyGrab && dailyGrab.dishId === dishId) dailyGrab = null;
  }

  const stepper = $(`stepper-${dishId}`);
  if (stepper) stepper.innerHTML = stepperHtml(dishId);

  if (delta > 0) {
    const wrap = document.querySelector('.cart-icon-wrap');
    wrap.classList.remove('bump');
    void wrap.offsetWidth; // 重新触发动画
    wrap.classList.add('bump');
  }

  updateCartBar();
  renderCartPanel();
  syncContextFromCart();
  persistAllCarts();
  if ($('page-cart').classList.contains('active')) renderCartPage();
  if ($('page-daily').classList.contains('active')) renderDailySpecials();
}

function scrollToCategory(idx) {
  document.querySelectorAll('.menu-nav-item').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
  });
  $(`cat-${idx}`).scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== 购物车 =====
function cartSummary() {
  let count = 0, total = 0, kcal = 0;
  for (const [id, n] of Object.entries(cart)) {
    const d = findDish(id);
    if (!d) continue;
    count += n;
    total += itemLineTotal(getDishPrice(id), n);
    kcal += (d.kcal || 0) * n;
  }
  return { count, total: toMoney(total), kcal };
}

function updateCartBar() {
  const { count, total } = cartSummary();
  const r = currentRestaurant;

  $('cart-badge').textContent = count;
  $('cart-badge').style.display = count > 0 ? 'flex' : 'none';
  $('cart-price').textContent = `¥${formatMoney(total)}`;
  $('cart-fee').textContent = cartType === 'mall' ? '快递包邮' : cartType === 'leisure' ? '无需配送' : r.deliveryFee === 0 ? '免配送费' : `另需配送费 ¥${r.deliveryFee}`;

  const btn = $('checkout-btn');
  if (count === 0) {
    btn.textContent = r.minOrder > 0 ? `¥${r.minOrder}起送` : '去选购';
    btn.classList.add('disabled');
  } else if (!dailyGrab && currentRestaurant.minOrder > 0 && total < currentRestaurant.minOrder) {
    btn.textContent = `差¥${formatMoney(currentRestaurant.minOrder - total)}起送`;
    btn.classList.add('disabled');
  } else {
    btn.textContent = '去结算';
    btn.classList.remove('disabled');
  }
}

function toggleCartPanel() {
  if (cartSummary().count === 0) return;
  $('cart-panel').classList.toggle('open');
  $('cart-panel-mask').classList.toggle('open');
  renderCartPanel();
}

function closeCartPanel() {
  $('cart-panel').classList.remove('open');
  $('cart-panel-mask').classList.remove('open');
}

function renderCartPanel() {
  const list = $('cart-panel-list');
  const entries = Object.entries(cart);
  if (entries.length === 0) {
    closeCartPanel();
    return;
  }
  list.innerHTML = entries.map(([id, n]) => {
    const d = findDish(id);
    const price = getDishPrice(id);
    const isSpecial = itemPrices[id] != null;
    const lockAdd = dailyGrab && dailyGrab.dishId === id;
    return `
      <div class="cart-row">
        <span class="cart-row-emoji">${d.emoji}</span>
        <span class="cart-row-name">${d.name}${lockAdd ? ' <span class="daily-cart-tag">特价</span>' : ''}</span>
        <span class="cart-row-price">${isSpecial ? `<s>¥${formatMoney(d.price)}</s> ` : ''}¥${formatMoney(itemLineTotal(price, n))}</span>
        <div class="stepper">
          <button class="step-btn step-minus" onclick="changeCount('${id}', -1)">−</button>
          <span class="step-count">${n}</span>
          ${lockAdd ? '' : `<button class="step-btn step-add" onclick="changeCount('${id}', 1)">+</button>`}
        </div>
      </div>
    `;
  }).join('');
}

function clearCart() {
  cart = {};
  itemPrices = {};
  if (cartType === 'delivery') dailyGrab = null;
  syncContextFromCart();
  renderMenu();
  updateCartBar();
  closeCartPanel();
  persistAllCarts();
  toast('购物车已清空，胃也跟着空了');
  if ($('page-daily').classList.contains('active')) renderDailySpecials();
  if ($('page-cart').classList.contains('active')) renderCartPage();
}

// ===== 购物车页面 =====
function goCartPage() {
  syncContextFromCart(cartType);
  if (getContextCount('delivery') > 0) viewCartType = 'delivery';
  else if (getContextCount('mall') > 0) viewCartType = 'mall';
  else if (getContextCount('leisure') > 0) viewCartType = 'leisure';
  document.querySelectorAll('.cart-type-tab').forEach((el) => {
    el.classList.toggle('active', el.dataset.type === viewCartType);
  });
  renderCartPage();
  showPage('page-cart');
}

function renderCartPage() {
  const body = $('cart-page-body');
  const footer = $('cart-page-footer');
  const type = viewCartType;
  const ctx = cartContexts[type];
  const count = getContextCount(type);

  if (count === 0) {
    const emptyMsgs = {
      delivery: { sub: '美食外卖和超市便利共用一个购物车，仅限同一家店', btn: '去点外卖' },
      mall: { sub: '可同时选购多家店铺，合并下单快递发货', btn: '去逛商城' },
      leisure: { sub: '电影KTV密室，下单生成核销码，仅限同一家', btn: '去找乐子' },
    };
    const m = emptyMsgs[type];
    body.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-emoji">🛒</div>
        <div class="cart-empty-title">这个购物车空空如也</div>
        <div class="cart-empty-sub">${m.sub}</div>
        <button class="cart-empty-btn" onclick="goHome('${CART_HOME_CATEGORY[type]}')">${m.btn}</button>
      </div>
    `;
    footer.style.display = 'none';
    return;
  }

  const { total } = getContextSummary(type);
  const lockAdd = (id) => type === 'delivery' && ctx.dailyGrab && ctx.dailyGrab.dishId === id;
  const tips = {
    delivery: ctx.dailyGrab ? '💡 今日特价每人限抢1份，外卖/超市仅限同一家店' : '💡 美食外卖与超市便利共用购物车，仅限同一家店',
    mall: '💡 可同时选购多家店铺，合并下单快递发货，预计1-2天送达',
    leisure: '💡 休闲订单仅限同一家，无需配送，下单后在「我的订单」查看核销二维码',
  };

  if (type === 'mall') {
    const groups = getMallCartGroups(ctx);
    body.innerHTML = groups.map((g) => `
      <div class="card">
        <div class="checkout-rest-name cart-rest-link" onclick="openRestaurant('${g.restId}')">
          ${g.store.emoji} ${g.store.name}
          <span class="cart-rest-more">继续加购 ›</span>
        </div>
        ${Object.entries(g.items).map(([id, n]) => {
          const d = findDishInStore(g.restId, id);
          const price = resolveItemPrice(g.itemPrices[id], d.price);
          return `
            <div class="cart-row">
              <span class="cart-row-emoji">${d.emoji}</span>
              <span class="cart-row-name">${d.name}</span>
              <span class="cart-row-price">¥${formatMoney(itemLineTotal(price, n))}</span>
              <div class="stepper">
                <button class="step-btn step-minus" onclick="changeCountInCart('mall', '${id}', -1, '${g.restId}')">−</button>
                <span class="step-count">${n}</span>
                <button class="step-btn step-add" onclick="changeCountInCart('mall', '${id}', 1, '${g.restId}')">+</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `).join('') + `<div class="card cart-tips">${tips.mall}</div>`;
    footer.style.display = 'flex';
    $('cart-page-total').textContent = `¥${formatMoney(total)}`;
    return;
  }

  const store = getContextStore(type);
  const entries = Object.entries(ctx.items);
  body.innerHTML = `
    <div class="card">
      <div class="checkout-rest-name cart-rest-link" onclick="openRestaurant('${store.id}')">
        ${store.emoji} ${store.name}
        ${lockAdd(entries[0]?.[0]) ? '' : '<span class="cart-rest-more">继续加购 ›</span>'}
      </div>
      ${entries.map(([id, n]) => {
        let d = null;
        for (const c of store.categories) {
          d = c.items.find((x) => x.id === id);
          if (d) break;
        }
        const price = resolveItemPrice(ctx.itemPrices[id], d.price);
        const isSpecial = ctx.itemPrices[id] != null && type === 'delivery';
        return `
          <div class="cart-row">
            <span class="cart-row-emoji">${d.emoji}</span>
            <span class="cart-row-name">${d.name}${isSpecial ? ' <span class="daily-cart-tag">特价</span>' : ''}</span>
            <span class="cart-row-price">${isSpecial ? `<s>¥${formatMoney(d.price)}</s> ` : ''}¥${formatMoney(itemLineTotal(price, n))}</span>
            <div class="stepper">
              <button class="step-btn step-minus" onclick="changeCountInCart('${type}', '${id}', -1)">−</button>
              <span class="step-count">${n}</span>
              ${lockAdd(id) ? '' : `<button class="step-btn step-add" onclick="changeCountInCart('${type}', '${id}', 1)">+</button>`}
            </div>
          </div>
        `;
      }).join('')}
    </div>
    <div class="card cart-tips">${tips[type]}</div>
  `;
  footer.style.display = 'flex';
  $('cart-page-total').textContent = `¥${formatMoney(total)}`;
}

function changeCountInCart(type, dishId, delta, restId) {
  const prevType = cartType;
  const prevRest = currentRestaurant;
  syncContextFromCart(cartType);
  cartType = type;
  if (type === 'mall' && restId) {
    currentRestaurant = findStore(restId);
  }
  syncCartFromContext(type);
  changeCount(dishId, delta);
  cartType = prevType;
  currentRestaurant = prevRest;
  syncCartFromContext(cartType);
  renderCartPage();
}

// ===== 结算 =====
const PACKING_FEE = 2;

function checkoutNumbers(type = checkoutCartType) {
  const useLiveCart = type === checkoutCartType && currentRestaurant && type !== 'mall';
  const { total: rawTotal, kcal } = useLiveCart ? cartSummary() : getContextSummary(type);
  const total = toMoney(rawTotal);
  const store = useLiveCart ? currentRestaurant : getContextStore(type);
  if (type === 'mall') {
    if (total <= 0) return { total: 0, kcal: 0, fee: 0, discount: 0, pay: 0, full: 0, coupon: null, baseDiscount: 0, couponDiscount: 0, packing: PACKING_FEE };
    const packing = PACKING_FEE;
    const full = toMoney(total + packing);
    const coupon = getCheckoutCoupon(total);
    const baseDiscount = Math.min(full, Math.floor(total * 0.3) + 5);
    const couponDiscount = coupon ? Math.min(full - baseDiscount, coupon.amount) : 0;
    const discount = toMoney(Math.min(full, baseDiscount + couponDiscount));
    const pay = toMoney(Math.max(0, full - discount));
    return { total, kcal, fee: 0, packing, discount, pay, full, coupon, baseDiscount, couponDiscount };
  }
  if (!store) return { total: 0, kcal: 0, fee: 0, discount: 0, pay: 0, full: 0, coupon: null, baseDiscount: 0, couponDiscount: 0, packing: 0 };

  const fee = toMoney(type === 'leisure' ? 0 : store.deliveryFee);
  const packing = toMoney(type === 'leisure' ? 0 : PACKING_FEE);
  const full = toMoney(total + fee + packing);
  const coupon = type === 'leisure' ? null : getCheckoutCoupon(total);
  const baseDiscount = type === 'leisure' ? 0 : Math.min(full, Math.floor(total * 0.3) + 5);
  const couponDiscount = coupon ? Math.min(full - baseDiscount, coupon.amount) : 0;
  const discount = toMoney(Math.min(full, baseDiscount + couponDiscount));
  const pay = toMoney(Math.max(0, full - discount));
  return { total, kcal, fee, packing, discount, pay, full, coupon, baseDiscount, couponDiscount };
}

function buildOrderSnapshot(type = checkoutCartType) {
  const { pay, kcal } = checkoutNumbers(type);
  const addr = getActiveAddress();

  if (type === 'mall') {
    const groups = getMallCartGroups(cartContexts.mall);
    const items = [];
    const mallStores = groups.map((g) => {
      const storeItems = Object.entries(g.items).map(([id, n]) => {
        const d = findDishInStore(g.restId, id);
        const price = resolveItemPrice(g.itemPrices[id], d.price);
        const it = { id, name: d.name, emoji: d.emoji, count: n, price, storeId: g.restId };
        items.push(it);
        return it;
      });
      return { restId: g.restId, restName: g.store.name, restEmoji: g.store.emoji, items: storeItems };
    });
    const multi = groups.length > 1;
    return {
      orderType: 'mall',
      restId: multi ? null : groups[0]?.restId,
      restName: multi ? `${groups.length}家店铺` : groups[0]?.store.name,
      restEmoji: multi ? '🛍️' : groups[0]?.store.emoji,
      mallStores,
      address: addr ? { detail: addr.detail, label: addr.label, name: addr.name, phone: addr.phone } : null,
      summary: items.map((it) => `${it.name}x${it.count}`).join('、'),
      items,
      pay,
      kcal,
    };
  }

  const store = type === checkoutCartType && currentRestaurant ? currentRestaurant : getContextStore(type);
  const ctx = cartContexts[type];
  const items = Object.entries(ctx.items).map(([id, n]) => {
    let d = null;
    for (const c of store.categories) {
      d = c.items.find((x) => x.id === id);
      if (d) break;
    }
    const price = resolveItemPrice(ctx.itemPrices[id], d.price);
    return { id, name: d.name, emoji: d.emoji, count: n, price };
  });
  return {
    orderType: store ? storeCartType(store) : type,
    restId: store.id,
    restName: store.name,
    restEmoji: store.emoji,
    address: type === 'leisure' ? null : addr ? { detail: addr.detail, label: addr.label, name: addr.name, phone: addr.phone } : null,
    summary: items.map((it) => `${it.name}x${it.count}`).join('、'),
    items,
    pay,
    kcal,
  };
}

function clearCartByType(type) {
  if (type === 'mall') {
    cartContexts.mall = { stores: {} };
  } else {
    cartContexts[type] = {
      restId: null,
      items: {},
      itemPrices: {},
      ...(type === 'delivery' ? { dailyGrab: null } : {}),
    };
  }
  if (cartType === type) {
    cart = {};
    itemPrices = {};
    if (type === 'delivery') dailyGrab = null;
    if (type !== 'mall') currentRestaurant = null;
  }
  persistAllCarts();
}

function updateCheckoutUI() {
  const type = checkoutCartType;
  const { fee, pay, coupon, baseDiscount, couponDiscount, packing } = checkoutNumbers(type);

  $('checkout-address-card').style.display = type === 'leisure' ? 'none' : 'block';
  $('checkout-leisure-hint').style.display = type === 'leisure' ? 'block' : 'none';
  $('checkout-fee-packing').style.display = type === 'leisure' ? 'none' : 'flex';
  $('checkout-fee-delivery').style.display = type === 'delivery' ? 'flex' : 'none';
  $('checkout-fee-shipping').style.display = type === 'mall' ? 'flex' : 'none';
  $('checkout-coupon-card').style.display = type === 'leisure' ? 'none' : 'block';

  if (type === 'delivery') {
    $('checkout-delivery-fee').textContent = fee === 0 ? '免费' : `¥${formatMoney(fee)}`;
  }
  $('checkout-discount').textContent = `-¥${formatMoney(baseDiscount)}`;
  if (coupon && couponDiscount > 0) {
    $('coupon-row').style.display = 'flex';
    $('coupon-row-label').textContent = `🎫 ${coupon.name}`;
    $('coupon-row-amt').textContent = `-¥${formatMoney(couponDiscount)}`;
  } else {
    $('coupon-row').style.display = 'none';
  }
  $('checkout-total').textContent = `¥${formatMoney(pay)}`;
  $('footer-total').textContent = `¥${formatMoney(pay)}`;
  if (type !== 'leisure') renderCheckoutCoupons();
}

function renderCheckoutCoupons() {
  const { total } = checkoutNumbers(checkoutCartType);
  const grabbed = getGrabbedCoupons();
  const list = $('checkout-coupon-list');

  if (grabbed.length === 0) {
    $('checkout-coupon-card').style.display = 'none';
    return;
  }
  $('checkout-coupon-card').style.display = 'block';

  const currentId = selectedCouponId === 'none' ? 'none' : (getCheckoutCoupon(total)?.id || selectedCouponId);

  let html = `
    <label class="coupon-pick ${currentId === 'none' || !currentId ? 'selected' : ''}" onclick="selectCheckoutCoupon('none')">
      <span>不使用优惠券</span>
      <input type="radio" name="checkout-coupon" ${!currentId || currentId === 'none' ? 'checked' : ''} />
    </label>
  `;

  grabbed.forEach((g) => {
    const c = COUPONS.find((x) => x.id === g.id);
    if (!c) return;
    const ok = total >= c.min;
    const minText = c.min === 0 ? '无门槛' : `满${c.min}可用`;
    html += `
      <label class="coupon-pick ${!ok ? 'disabled' : ''} ${currentId === c.id ? 'selected' : ''}"
        onclick="${ok ? `selectCheckoutCoupon('${c.id}')` : `toast('还差 ¥${formatMoney(c.min - total)} 才能用这张券')`}">
        <span class="coupon-pick-left">
          <b class="coupon-pick-amt">¥${c.amount}</b>
          <span class="coupon-pick-meta">
            <span class="coupon-pick-name">${c.name}</span>
            <span class="coupon-pick-min">${minText}</span>
          </span>
        </span>
        <input type="radio" name="checkout-coupon" ${currentId === c.id ? 'checked' : ''} ${ok ? '' : 'disabled'} />
      </label>
    `;
  });

  list.innerHTML = html;
}

function selectCheckoutCoupon(id) {
  selectedCouponId = id;
  updateCheckoutUI();
}

function goCheckout() {
  syncContextFromCart(cartType);
  syncCheckoutTypeFromStore();
  if (checkoutCartType !== cartType) syncCartFromContext(checkoutCartType);

  const { count, total } = getContextSummary(checkoutCartType);
  const store = getContextStore(checkoutCartType);
  if (count === 0 || (checkoutCartType !== 'mall' && !store)) {
    toast('先选点什么吧，反正不要钱 😏');
    return;
  }
  const ctx = cartContexts[checkoutCartType];
  if (checkoutCartType === 'delivery' && !ctx.dailyGrab && store.minOrder > 0 && total < store.minOrder) {
    toast(`还差 ¥${formatMoney(store.minOrder - total)} 起送哦`);
    return;
  }

  const best = checkoutCartType === 'leisure' ? null : getBestCoupon(total);
  selectedCouponId = best ? best.id : 'none';

  if (checkoutCartType === 'mall') {
    const groups = getMallCartGroups(ctx);
    $('checkout-rest-name').textContent = groups.length === 1
      ? `${groups[0].store.emoji} ${groups[0].store.name}`
      : `🛍️ ${groups.length}家店铺`;
    $('checkout-items').innerHTML = groups.map((g) => `
      <div class="checkout-store-group">
        <div class="checkout-store-label">${g.store.emoji} ${g.store.name}</div>
        ${Object.entries(g.items).map(([id, n]) => {
          const d = findDishInStore(g.restId, id);
          const price = resolveItemPrice(g.itemPrices[id], d.price);
          return `
            <div class="co-item">
              <span class="co-item-emoji">${d.emoji}</span>
              <span class="co-item-name">${d.name}</span>
              <span class="co-item-count">x${n}</span>
              <span class="co-item-price">¥${formatMoney(itemLineTotal(price, n))}</span>
            </div>
          `;
        }).join('')}
      </div>
    `).join('');
  } else {
    $('checkout-rest-name').textContent = `${store.emoji} ${store.name}`;
    $('checkout-items').innerHTML = Object.entries(ctx.items).map(([id, n]) => {
      let d = null;
      for (const c of store.categories) {
        d = c.items.find((x) => x.id === id);
        if (d) break;
      }
      const price = resolveItemPrice(ctx.itemPrices[id], d.price);
      const isSpecial = ctx.itemPrices[id] != null && checkoutCartType === 'delivery';
      return `
        <div class="co-item">
          <span class="co-item-emoji">${d.emoji}</span>
          <span class="co-item-name">${d.name}${isSpecial ? '（特价）' : ''}</span>
          <span class="co-item-count">x${n}</span>
          <span class="co-item-price">${isSpecial ? `<s>¥${formatMoney(d.price)}</s> ` : ''}¥${formatMoney(itemLineTotal(price, n))}</span>
        </div>
      `;
    }).join('');
  }

  updateCheckoutUI();
  if (checkoutCartType !== 'leisure') renderCheckoutAddress();
  closeCartPanel();
  showPage('page-checkout');
}

// ===== 下单与配送 =====
function placeOrder() {
  const type = syncCheckoutTypeFromStore();
  if (type !== 'leisure') {
    ensureDefaultAddresses();
    if (!getActiveAddress()) {
      toast('请先添加收货地址');
      openAddressPicker();
      return;
    }
  }

  const payMethod = document.querySelector('input[name="pay"]:checked')?.value || 'baole';
  const payMsgs = {
    baole: '饱了么支付成功！余额 ∞ 纹丝不动',
    wechat: '微信支付成功！微信：你谁？',
    alipay: '支付宝支付成功！花呗额度毫无波动',
  };
  toast(payMsgs[payMethod] || '支付成功！（当然，一分钱都没扣）');

  if (type === 'leisure') {
    setTimeout(placeLeisureOrder, 600);
  } else if (type === 'mall') {
    setTimeout(startMallShipping, 800);
  } else if (currentRestaurant?.homeType === 'supermarket'
    || findStore(buildOrderSnapshot('delivery').restId)?.homeType === 'supermarket') {
    setTimeout(startSupermarketDelivery, 800);
  } else {
    setTimeout(startDelivery, 800);
  }
}

function qrImgUrl(text) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
}

function placeLeisureOrder() {
  const orderNo = genOrderNo();
  const snap = buildOrderSnapshot('leisure');
  const qrCode = `BLM|${orderNo}|${Date.now()}|${getOwnerId()}`;
  const order = {
    ...snap,
    orderNo,
    qrCode,
    time: Date.now(),
    status: '待使用',
  };
  saveOrder(order);
  clearCartByType('leisure');
  if (cartType === 'leisure') {
    currentRestaurant = null;
    cart = {};
    itemPrices = {};
  }
  toast('下单成功！到「我的订单」查看核销二维码 🎫');
  goOrders();
}

let activeDeliveries = []; // { order, rider, deliveryState }
let activeMallShipments = []; // { order, shipState }
let viewingDeliveryOrderNo = null;
let viewingMallOrderNo = null;
let unboxSteps = {};

const UNBOX_HINTS = [
  '👆 点击包裹，先撕开封箱胶带',
  '✂️ 再点一次，掀开箱盖',
  '📦 最后一次，取出你的宝贝',
];

const MALL_SHIP_PHASES = [
  { minPct: 0, banner: '📦 订单已确认，等待商家发货' },
  { minPct: 15, banner: '📦 商家正在打包你的宝贝' },
  { minPct: 35, banner: '🚚 快递已揽收' },
  { minPct: 60, banner: '🛣️ 包裹运输中' },
  { minPct: 85, banner: '🏠 即将送达' },
];

// 打赏加速：金额 → 缩短的真实毫秒数
const TIP_SPEED = { 2: 120000, 3: 150000, 5: 180000, 8: 240000, 66: 300000 };

function findDeliveryEntry(orderNo) {
  return activeDeliveries.find((e) => e.order.orderNo === orderNo);
}

function findMallEntry(orderNo) {
  return activeMallShipments.find((e) => e.order.orderNo === orderNo);
}

function getViewingDeliveryEntry() {
  return viewingDeliveryOrderNo ? findDeliveryEntry(viewingDeliveryOrderNo) : null;
}

function getViewingMallEntry() {
  return viewingMallOrderNo ? findMallEntry(viewingMallOrderNo) : null;
}

function hasActiveOrders() {
  return activeDeliveries.some((e) => isDeliveryOrder(e.order)) || activeMallShipments.length > 0;
}

function calcDeliveryPct(entry) {
  if (!entry?.deliveryState) return 0;
  const { startTime, endTime } = entry.deliveryState;
  return Math.min(100, ((Date.now() - startTime) / (endTime - startTime)) * 100);
}

function getDeliveryProgressFor(entry) {
  if (!entry?.deliveryState) return null;
  const { startTime, endTime, rider } = entry.deliveryState;
  const meta = getTrackingMeta(entry);
  const now = Date.now();
  const pct = Math.min(100, ((now - startTime) / (endTime - startTime)) * 100);
  let phaseIdx = 0;
  meta.phases.forEach((p, i) => { if (pct >= p.minPct) phaseIdx = i; });

  const remainMs = Math.max(0, endTime - now);
  const remainSec = Math.ceil(remainMs / 1000);
  const remainMin = remainSec <= 0 ? 0 : Math.ceil(remainSec / 60);
  const mm = String(Math.floor(remainSec / 60)).padStart(2, '0');
  const ss = String(remainSec % 60).padStart(2, '0');

  return {
    phaseIdx,
    statusText: meta.statusTexts[phaseIdx],
    statusShort: meta.shorts[phaseIdx],
    banner: meta.phases[phaseIdx].banner.replace(meta.agentKey, rider.name),
    remainMin,
    remainClock: `${mm}:${ss}`,
    pct,
    riderName: rider.name,
    riderEmoji: rider.emoji,
    isMarket: meta.isMarket,
  };
}

function getMallShipProgressFor(entry) {
  if (!entry?.shipState) return null;
  const { startTime, endTime } = entry.shipState;
  const now = Date.now();
  const pct = Math.min(100, ((now - startTime) / (endTime - startTime)) * 100);
  let phaseIdx = 0;
  MALL_SHIP_PHASES.forEach((p, i) => { if (pct >= p.minPct) phaseIdx = i; });
  const remainSec = Math.max(0, Math.ceil((endTime - now) / 1000));
  const mm = String(Math.floor(remainSec / 60)).padStart(2, '0');
  const ss = String(remainSec % 60).padStart(2, '0');
  return { pct, phaseIdx, banner: MALL_SHIP_PHASES[phaseIdx].banner, remainClock: `${mm}:${ss}` };
}

function setRiderVisual(gifPath) {
  const src = encodeURI(gifPath);
  const imgHtml = `<img src="${src}" alt="配送员" />`;
  $('rider-avatar').innerHTML = imgHtml;
  $('rider-avatar2').innerHTML = imgHtml;
  $('map-rider').innerHTML = imgHtml;
}

function setAgentVisual(agent, isStaff) {
  const html = isStaff
    ? `<span class="staff-emoji">${agent.emoji}</span>`
    : `<img src="${encodeURI(agent.gif)}" alt="配送员" />`;
  $('rider-avatar').innerHTML = html;
  $('rider-avatar2').innerHTML = html;
  $('map-rider').innerHTML = html;
}

function getTipPhaseRules(entry) {
  const progress = getDeliveryProgressFor(entry);
  const phaseIdx = progress?.phaseIdx ?? 0;
  const isMarket = isSupermarketOrder(entry?.order);
  if (isMarket) {
    return {
      canMerchantTip: phaseIdx >= 1 && phaseIdx < 3,
      canRiderTip: phaseIdx >= 3,
    };
  }
  return {
    canMerchantTip: phaseIdx === 1,
    canRiderTip: phaseIdx >= 2,
  };
}

function renderDeliveryTrackingUI(entry, pct) {
  if (!entry) return;
  const { order, rider, deliveryState } = entry;
  if (pct == null) pct = calcDeliveryPct(entry);
  const meta = getTrackingMeta(entry);
  const isMarket = meta.isMarket;
  const progress = getDeliveryProgressFor(entry);
  const phaseIdx = progress?.phaseIdx ?? 0;

  setAgentVisual(rider, isMarket);
  const titleEl = $('track-title');
  if (titleEl) {
    titleEl.textContent = isMarket
      ? (phaseIdx >= 3 ? '配送中！' : '拣货打包中！')
      : '马上来！';
  }
  $('rider-name').textContent = isMarket
    ? (phaseIdx >= 3 ? '配送小哥正在路上' : `${rider.name}正在帮你拣货`)
    : `${rider.name}正在路上`;
  $('rider-tag').textContent = `${rider.tag} ${rider.emoji}`;
  $('track-order-no').textContent = `订单 ${order.orderNo} · 「付费」¥${formatMoney(order.pay)}`;

  const path = $('route-path');
  const pathLen = path.getTotalLength();
  deliveryState.path = path;
  deliveryState.pathLen = pathLen;

  if (isMarket && pct < deliveryState.moveStartPct) {
    $('map-rider').style.left = '12%';
    $('map-rider').style.top = '82%';
  } else {
    const movePct = pct <= deliveryState.moveStartPct
      ? 0
      : (pct - deliveryState.moveStartPct) / (100 - deliveryState.moveStartPct) * 100;
    const pt = path.getPointAtLength((movePct / 100) * pathLen);
    $('map-rider').style.left = pt.x + '%';
    $('map-rider').style.top = pt.y + '%';
  }
  $('progress-fill').style.width = pct + '%';

  const remainMs = Math.max(0, deliveryState.endTime - Date.now());
  const remainSec = Math.ceil(remainMs / 1000);
  const mm = String(Math.floor(remainSec / 60)).padStart(2, '0');
  const ss = String(remainSec % 60).padStart(2, '0');
  const remainMin = Math.max(1, Math.ceil(remainSec / 60));
  $('eta-countdown').textContent = `${mm}:${ss}`;
  $('eta-min-num').textContent = remainMin;
  if (isMarket) {
    $('eta-arrive-text').textContent = pct >= 100
      ? '商品已送达！'
      : (phaseIdx >= 3 ? `预计约${remainMin}分钟后送达` : `预计约${remainMin}分钟后拣货完成`);
  } else {
    $('eta-arrive-text').textContent = pct >= 100 ? '骑手已到达！' : `预计约${remainMin}分钟后到达`;
  }

  $('track-banner').textContent = progress?.banner || meta.phases[0].banner.replace(meta.agentKey, rider.name);

  const tipRules = getTipPhaseRules(entry);
  const showMerchantCard = deliveryState.merchantTipped || tipRules.canMerchantTip;
  const showRiderCard = deliveryState.riderTipped || tipRules.canRiderTip;

  $('tip-section').style.display = (pct >= 15 && (showMerchantCard || showRiderCard)) ? 'block' : 'none';
  $('merchant-tip-card').style.display = showMerchantCard ? 'block' : 'none';
  $('rider-tip-card').style.display = showRiderCard ? 'block' : 'none';
  $('merchant-tip-btns').style.display = tipRules.canMerchantTip && !deliveryState.merchantTipped ? 'flex' : 'none';
  $('tip-btns').style.display = tipRules.canRiderTip && !deliveryState.riderTipped ? 'flex' : 'none';
  $('merchant-tip-total').style.display = deliveryState.merchantTipped ? 'block' : 'none';
  $('tip-total').style.display = deliveryState.riderTipped ? 'block' : 'none';
  if (deliveryState.merchantTipped) {
    $('merchant-tip-total').textContent = isMarket
      ? `已打赏拣货员 ¥${deliveryState.merchantTipTotal}，店员加急选购中`
      : `已打赏商家 ¥${deliveryState.merchantTipTotal}，厨房加急中`;
  }
  if (deliveryState.riderTipped) {
    $('tip-total').textContent = isMarket
      ? `已打赏配送小哥 ¥${deliveryState.riderTipTotal}，袋子绑得更紧了`
      : `已打赏骑手 ¥${deliveryState.riderTipTotal}，${rider.name}的快乐是真的`;
  }
  updateTipSpeedBar(entry);

  meta.steps.forEach((step, i) => {
    const el = $(`tstep-${i}`);
    if (!el) return;
    el.classList.toggle('done', i < phaseIdx);
    el.classList.toggle('now', i === phaseIdx);
    el.innerHTML = `<span class="tstep-icon i${i}">${step.icon}</span><span class="tstep-text">${step.text}</span>`;
  });
}

function startDelivery() {
  const snap = buildOrderSnapshot('delivery');
  const store = findStore(snap.restId);
  if (store?.homeType === 'supermarket') {
    startSupermarketDelivery();
    return;
  }
  if (!isDeliveryOrder(snap)) {
    if (store?.homeType === 'leisure') {
      checkoutCartType = 'leisure';
      placeLeisureOrder();
      return;
    }
    if (store?.homeType === 'mall') {
      checkoutCartType = 'mall';
      startMallShipping();
      return;
    }
  }

  const rider = RIDERS[Math.floor(Math.random() * RIDERS.length)];
  const gif = RIDER_GIFS[Math.floor(Math.random() * RIDER_GIFS.length)];

  const orderNo = genOrderNo();
  const usedCoupon = finalizeCheckoutCoupon('delivery');

  const order = { ...snap, orderType: 'delivery', orderNo, ...(usedCoupon ? { coupon: usedCoupon } : {}) };
  const durationMs = Math.round((25 + Math.random() * 10) * 60 * 1000);
  const startTime = Date.now();

  const entry = {
    order,
    rider: { ...rider, gif },
    deliveryState: {
      startTime,
      endTime: startTime + durationMs,
      savedMs: 0,
      moveStartPct: 40,
      trackingMode: 'food',
      rider,
      merchantTipped: false,
      riderTipped: false,
      merchantTipTotal: 0,
      riderTipTotal: 0,
    },
  };

  activeDeliveries.push(entry);
  viewingDeliveryOrderNo = orderNo;
  clearCartByType('delivery');
  if (cartType === 'delivery') {
    cart = {};
    itemPrices = {};
    dailyGrab = null;
    currentRestaurant = null;
  }

  resetTipSection(entry);
  renderDeliveryTrackingUI(entry, 0);
  showPage('page-tracking');
  saveActiveDeliveries();
  ensureDeliveryTimer();
}

function startSupermarketDelivery() {
  const snap = buildOrderSnapshot('delivery');
  const store = findStore(snap.restId);
  if (!store || store.homeType !== 'supermarket') {
    startDelivery();
    return;
  }

  const staff = SUPERMARKET_STAFF[Math.floor(Math.random() * SUPERMARKET_STAFF.length)];
  const orderNo = genOrderNo();
  const usedCoupon = finalizeCheckoutCoupon('delivery');

  const order = { ...snap, orderType: 'supermarket', orderNo, ...(usedCoupon ? { coupon: usedCoupon } : {}) };
  const durationMs = Math.round((20 + Math.random() * 15) * 60 * 1000);
  const startTime = Date.now();

  const entry = {
    order,
    rider: { ...staff, isStaff: true },
    deliveryState: {
      startTime,
      endTime: startTime + durationMs,
      savedMs: 0,
      moveStartPct: 60,
      trackingMode: 'supermarket',
      rider: staff,
      merchantTipped: false,
      riderTipped: false,
      merchantTipTotal: 0,
      riderTipTotal: 0,
    },
  };

  activeDeliveries.push(entry);
  viewingDeliveryOrderNo = orderNo;
  clearCartByType('delivery');
  if (cartType === 'delivery') {
    cart = {};
    itemPrices = {};
    dailyGrab = null;
    currentRestaurant = null;
  }

  resetTipSection(entry);
  renderDeliveryTrackingUI(entry, 0);
  showPage('page-tracking');
  saveActiveDeliveries();
  ensureDeliveryTimer();
}

function startMallShipping() {
  const orderNo = genOrderNo();
  const snap = buildOrderSnapshot('mall');
  const usedCoupon = finalizeCheckoutCoupon('mall');
  const order = { ...snap, orderNo, ...(usedCoupon ? { coupon: usedCoupon } : {}) };

  const durationMs = Math.round((90 + Math.random() * 60) * 1000);
  const startTime = Date.now();
  const entry = { order, shipState: { startTime, endTime: startTime + durationMs } };

  activeMallShipments.push(entry);
  viewingMallOrderNo = orderNo;
  clearCartByType('mall');
  if (cartType === 'mall') {
    cart = {};
    itemPrices = {};
    currentRestaurant = null;
  }

  renderMallShippingUI(getMallShipProgressFor(entry), entry.order);
  showPage('page-mall-shipping');
  saveMallShipState();
  ensureMallShipTimer();
}

function renderMallShippingUI(p, order) {
  if (!order) {
    const entry = getViewingMallEntry();
    if (!entry) return;
    order = entry.order;
    if (!p) p = getMallShipProgressFor(entry);
  }
  if (!p || !order) return;

  const fill = $('mall-ship-fill');
  const pctEl = $('mall-ship-pct');
  const banner = $('mall-ship-banner');
  const countdown = $('mall-ship-countdown');
  const title = $('mall-ship-title');
  if (!fill) return;

  fill.style.width = `${p.pct}%`;
  pctEl.textContent = Math.floor(p.pct);
  banner.textContent = p.banner;
  countdown.textContent = p.remainClock;
  title.textContent = p.pct >= 100 ? '包裹已送达' : '预计1-2天送达';

  $('mall-ship-order-no').textContent = `订单 ${order.orderNo} · ¥${formatMoney(order.pay)}`;
  const addr = order.address;
  $('mall-ship-addr').textContent = addr
    ? `送至 ${addr.detail}（${addr.name} ${maskPhone(addr.phone)}）`
    : '';

  for (let i = 0; i < MALL_SHIP_PHASES.length; i++) {
    const el = $(`mstep-${i}`);
    if (!el) continue;
    el.classList.toggle('done', i < p.phaseIdx);
    el.classList.toggle('now', i === p.phaseIdx);
  }
}

function goMallShipping(orderNo) {
  const entry = orderNo ? findMallEntry(orderNo) : getViewingMallEntry() || activeMallShipments[0];
  if (!entry) {
    goOrders();
    return;
  }
  viewingMallOrderNo = entry.order.orderNo;
  if (entry.order.pendingUnbox) {
    openUnboxingPage(entry.order.orderNo);
    return;
  }
  renderMallShippingUI(getMallShipProgressFor(entry), entry.order);
  showPage('page-mall-shipping');
  ensureMallShipTimer();
}

function ensureMallShipTimer() {
  const hasShipping = activeMallShipments.some((e) => e.shipState && !e.order.pendingUnbox);
  if (!hasShipping) {
    clearInterval(mallShipTimer);
    mallShipTimer = null;
    return;
  }
  if (!mallShipTimer) {
    mallShipTimer = setInterval(mallShippingTickAll, 1000);
  }
  mallShippingTickAll();
}

const MALL_SHIP_KEY = 'blm_mall_ship';
const DELIVERY_ACTIVE_KEY = 'blm_active_deliveries';

function saveMallShipState() {
  const shipments = activeMallShipments.map((e) => ({ order: e.order, shipState: e.shipState }));
  if (shipments.length) {
    localStorage.setItem(MALL_SHIP_KEY, JSON.stringify({ shipments }));
  } else {
    localStorage.removeItem(MALL_SHIP_KEY);
  }
}

function restoreMallShipState() {
  try {
    const saved = JSON.parse(localStorage.getItem(MALL_SHIP_KEY));
    if (!saved) return;
    if (saved.shipments) {
      activeMallShipments = saved.shipments;
    } else if (saved.activeMallOrder) {
      activeMallShipments = [{ order: saved.activeMallOrder, shipState: saved.mallShipState || null }];
    }
    activeMallShipments.forEach((e) => {
      if (e.order.pendingUnbox) return;
      if (e.shipState && Date.now() >= e.shipState.endTime) {
        e.order.pendingUnbox = true;
        e.shipState = null;
      }
    });
    saveMallShipState();
    ensureMallShipTimer();
  } catch { /* ignore */ }
}

function saveActiveDeliveries() {
  const data = activeDeliveries.map((e) => ({
    order: e.order,
    rider: e.rider,
    deliveryState: {
      startTime: e.deliveryState.startTime,
      endTime: e.deliveryState.endTime,
      savedMs: e.deliveryState.savedMs,
      moveStartPct: e.deliveryState.moveStartPct,
      trackingMode: e.deliveryState.trackingMode,
      rider: e.deliveryState.rider,
      merchantTipped: e.deliveryState.merchantTipped,
      riderTipped: e.deliveryState.riderTipped,
      merchantTipTotal: e.deliveryState.merchantTipTotal,
      riderTipTotal: e.deliveryState.riderTipTotal,
    },
  }));
  if (data.length) localStorage.setItem(DELIVERY_ACTIVE_KEY, JSON.stringify(data));
  else localStorage.removeItem(DELIVERY_ACTIVE_KEY);
}

function sanitizeActiveDeliveries() {
  const removed = [];
  activeDeliveries = activeDeliveries.filter((e) => {
    if (isDeliveryOrder(e.order)) return true;
    removed.push(e);
    return false;
  });
  removed.forEach((e) => {
    const o = e.order;
    const store = findStore(o.restId);
    if (store?.homeType === 'leisure') {
      if (!getOrders().some((x) => x.orderNo === o.orderNo)) {
        saveOrder({
          ...o,
          orderType: 'leisure',
          time: Date.now(),
          status: '待使用',
          qrCode: `BLM|${o.orderNo}|${Date.now()}|${getOwnerId()}`,
        });
      }
    } else if (store?.homeType === 'mall' && !activeMallShipments.some((m) => m.order.orderNo === o.orderNo)) {
      const durationMs = Math.round((90 + Math.random() * 60) * 1000);
      const startTime = Date.now();
      activeMallShipments.push({
        order: { ...o, orderType: 'mall' },
        shipState: { startTime, endTime: startTime + durationMs },
      });
    }
  });
  if (removed.length) {
    saveActiveDeliveries();
    saveMallShipState();
    ensureMallShipTimer();
    refreshOrdersPageIfVisible();
  }
}

function restoreActiveDeliveries() {
  try {
    const saved = JSON.parse(localStorage.getItem(DELIVERY_ACTIVE_KEY));
    if (!Array.isArray(saved) || !saved.length) return;
    activeDeliveries = saved.map((e) => ({
      order: e.order,
      rider: e.rider,
      deliveryState: {
        ...e.deliveryState,
        moveStartPct: e.deliveryState.moveStartPct ?? (isSupermarketOrder(e.order) ? 60 : 40),
        trackingMode: e.deliveryState.trackingMode ?? (isSupermarketOrder(e.order) ? 'supermarket' : 'food'),
      },
    }));
    sanitizeActiveDeliveries();
    ensureDeliveryTimer();
  } catch { /* ignore */ }
}

function openUnboxingPage(orderNo) {
  const entry = findMallEntry(orderNo);
  if (!entry) return;
  viewingMallOrderNo = orderNo;
  entry.shipState = null;
  unboxSteps[orderNo] = unboxSteps[orderNo] || 0;
  entry.order.pendingUnbox = true;
  $('mall-ship-title').textContent = '包裹已送达';
  $('mall-ship-banner').textContent = '🏠 快递已放在门口，待开箱';
  saveMallShipState();
  renderUnboxingScene(entry.order);
  showPage('page-mall-unbox');
}

function renderUnboxingScene(order) {
  if (!order) return;
  const step = unboxSteps[order.orderNo] || 0;
  const box = $('unbox-box');
  const stage = $('unbox-stage');
  const reveal = $('unbox-reveal');
  const hint = $('unbox-hint');

  box.className = 'unbox-box';
  stage.style.display = 'flex';
  reveal.style.display = 'none';

  if (step === 0) {
    $('unbox-title').textContent = '快递到了！';
    $('unbox-sub').textContent = `订单 ${order.orderNo} · 共 ${order.items.length} 件宝贝在等你`;
    hint.textContent = UNBOX_HINTS[0];
    hint.className = 'unbox-hint';
    $('box-tape').style.display = 'flex';
    $('box-inner').innerHTML = '';
  } else if (step === 1) {
    box.classList.add('tape-off', 'shake');
    $('unbox-title').textContent = '嘶——胶带撕开了';
    $('unbox-sub').textContent = '接下来，掀开箱盖';
    hint.textContent = UNBOX_HINTS[1];
    hint.className = 'unbox-hint step2';
  } else if (step === 2) {
    box.classList.add('tape-off', 'opening', 'peek');
    $('box-tape').style.display = 'none';
    $('unbox-title').textContent = '箱盖掀开了！';
    $('unbox-sub').textContent = '里面好像有东西在发光（心理作用）';
    hint.textContent = UNBOX_HINTS[2];
    hint.className = 'unbox-hint step3';
    $('box-inner').innerHTML = order.items.map((it, i) => `
      <span class="peek-item" style="animation-delay:${i * 0.1}s">${it.emoji}</span>
    `).join('');
  }
}

function unboxTap() {
  const entry = getViewingMallEntry();
  if (!entry) return;
  const orderNo = entry.order.orderNo;
  const step = unboxSteps[orderNo] || 0;
  if (step >= 3) return;
  unboxSteps[orderNo] = step + 1;
  if (unboxSteps[orderNo] < 3) {
    renderUnboxingScene(entry.order);
    return;
  }
  showUnboxReveal(entry.order);
}

function showUnboxReveal(order) {
  if (!order) return;
  const box = $('unbox-box');
  box.classList.add('tape-off', 'opened', 'peek');
  $('box-tape').style.display = 'none';
  $('unbox-stage').style.display = 'none';
  $('unbox-reveal').style.display = 'block';
  $('unbox-title').textContent = '开箱完成！';
  $('unbox-sub').textContent = '虽然实物不存在，但快乐是真实的';

  $('unbox-items').innerHTML = order.items.map((it) => `
    <div class="unbox-item-card">
      <div class="unbox-item-emoji">${it.emoji}</div>
      <div class="unbox-item-name">${it.name}</div>
      <div class="unbox-item-count">x${it.count}</div>
    </div>
  `).join('');
}

function finishUnboxing() {
  const entry = getViewingMallEntry();
  if (!entry) return;
  const o = entry.order;
  saveOrder({ ...o, time: Date.now(), status: '已签收', unboxed: true });
  activeMallShipments = activeMallShipments.filter((e) => e.order.orderNo !== o.orderNo);
  delete unboxSteps[o.orderNo];
  if (viewingMallOrderNo === o.orderNo) viewingMallOrderNo = null;
  saveMallShipState();
  toast('签收完成！宝贝已收入想象的仓库 📦✨');
  goOrders();
}

function showMallDelivered() {
  const entry = getViewingMallEntry();
  if (entry) openUnboxingPage(entry.order.orderNo);
}

function closeMallShipping() {
  const entry = getViewingMallEntry();
  if (entry?.order.pendingUnbox) {
    openUnboxingPage(entry.order.orderNo);
  } else {
    goOrders();
  }
}

function goDeliveryTracking(orderNo) {
  const entry = findDeliveryEntry(orderNo);
  if (!entry) {
    goOrders();
    return;
  }
  viewingDeliveryOrderNo = orderNo;
  resetTipSection(entry);
  renderDeliveryTrackingUI(entry);
  showPage('page-tracking');
}

function completeDelivery(entry) {
  const orderNo = entry.order.orderNo;
  activeDeliveries = activeDeliveries.filter((e) => e.order.orderNo !== orderNo);
  saveActiveDeliveries();

  if (viewingDeliveryOrderNo === orderNo && $('page-tracking').classList.contains('active')) {
    viewingDeliveryOrderNo = null;
    setTimeout(() => showDone(entry.order), 600);
  } else {
    saveOrder({ ...entry.order, time: Date.now(), status: '已送达' });
    toast(isSupermarketOrder(entry.order)
      ? `${entry.order.restEmoji} ${entry.order.restName} 已送达，商品在想象中冰箱 🛒`
      : `${entry.order.restEmoji} ${entry.order.restName} 已送达 🎉`);
  }
  refreshOrdersPageIfVisible();
}

function mallShippingTickAll() {
  const viewing = getViewingMallEntry();
  let needsTimer = false;

  activeMallShipments.forEach((entry) => {
    if (entry.order.pendingUnbox) return;
    if (!entry.shipState) return;
    needsTimer = true;

    const p = getMallShipProgressFor(entry);
    if (p.pct >= 100) {
      entry.shipState = null;
      entry.order.pendingUnbox = true;
      if (viewingMallOrderNo === entry.order.orderNo && $('page-mall-shipping').classList.contains('active')) {
        setTimeout(() => openUnboxingPage(entry.order.orderNo), 600);
      } else {
        toast(`📦 订单 ${entry.order.orderNo} 已送达，待开箱`);
      }
    }
  });

  if (viewing && !viewing.order.pendingUnbox && viewing.shipState) {
    renderMallShippingUI(getMallShipProgressFor(viewing), viewing.order);
  }

  if (!needsTimer) {
    clearInterval(mallShipTimer);
    mallShipTimer = null;
  }
  saveMallShipState();
  refreshOrdersPageIfVisible();
}

function activeOrderHtml(filterTab = 'all') {
  const allDeliveries = activeDeliveries
    .filter((e) => isDeliveryOrder(e.order))
    .filter((e) => filterTab === 'all' || getOrderCategory(e.order) === filterTab);
  const foodEntries = allDeliveries.filter((e) => isFoodDeliveryOrder(e.order));
  const marketEntries = allDeliveries.filter((e) => isSupermarketOrder(e.order));

  let html = '';
  if (foodEntries.length === 1) {
    html += activeDeliveryOrderHtml(foodEntries[0]);
  } else if (foodEntries.length > 1) {
    html += activeDeliveryGroupHtml(foodEntries, 'food');
  }
  if (marketEntries.length === 1) {
    html += activeDeliveryOrderHtml(marketEntries[0]);
  } else if (marketEntries.length > 1) {
    html += activeDeliveryGroupHtml(marketEntries, 'supermarket');
  }
  if (filterTab === 'all' || filterTab === 'mall') {
    if (activeMallShipments.length === 1) {
      html += activeMallOrderHtml(activeMallShipments[0]);
    } else if (activeMallShipments.length > 1) {
      html += activeMallGroupHtml(activeMallShipments);
    }
  }
  return html;
}

function pickPrimaryDeliveryEntry(entries) {
  let primary = entries[0];
  let minRemain = Infinity;
  entries.forEach((e) => {
    if (!e.deliveryState) return;
    const remain = e.deliveryState.endTime - Date.now();
    if (remain < minRemain) {
      minRemain = remain;
      primary = e;
    }
  });
  return primary;
}

function pickPrimaryMallEntry(entries) {
  const shipping = entries.filter((e) => !e.order.pendingUnbox && e.shipState);
  if (!shipping.length) return entries[0];
  let primary = shipping[0];
  let minRemain = Infinity;
  shipping.forEach((e) => {
    const remain = e.shipState.endTime - Date.now();
    if (remain < minRemain) {
      minRemain = remain;
      primary = e;
    }
  });
  return primary;
}

function activeDeliveryGroupHtml(entries, kind = 'food') {
  const count = entries.length;
  const totalPay = toMoney(entries.reduce((s, e) => s + toMoney(e.order.pay), 0));
  const primary = pickPrimaryDeliveryEntry(entries);
  const p = getDeliveryProgressFor(primary);
  const isMarket = kind === 'supermarket';
  const emoji = isMarket ? '🛒' : '🛵';
  const label = isMarket ? '超市配送中' : '外卖配送中';
  const desc = p
    ? `${count}单${isMarket ? '拣货配送' : '配送'}中 · 最快一单剩余 ${p.remainClock}`
    : `${count}单${isMarket ? '拣货配送' : '配送'}中`;

  return `
    <div class="card active-order active-order-group" onclick="openActiveOrderList('${kind}')">
      <div class="order-item">
        <div class="order-emoji">${emoji}</div>
        <div class="order-info">
          <div class="order-rest">${label}<span class="active-order-group-badge">${count}单</span></div>
          <div class="order-desc">${desc}</div>
          ${p ? `<div class="active-order-bar"><div class="active-order-fill${isMarket ? ' market-fill' : ''}" style="width:${p.pct}%"></div></div>` : ''}
        </div>
        <div class="order-right">
          <div class="order-price">¥${formatMoney(totalPay)}</div>
          <div class="order-status delivering">${count}单 ›</div>
        </div>
      </div>
    </div>
  `;
}

function activeMallGroupHtml(entries) {
  const count = entries.length;
  const totalPay = toMoney(entries.reduce((s, e) => s + toMoney(e.order.pay), 0));
  const shipping = entries.filter((e) => !e.order.pendingUnbox && e.shipState);
  const unbox = entries.filter((e) => e.order.pendingUnbox);
  let desc = '';
  if (shipping.length && unbox.length) desc = `${shipping.length}单运输中 · ${unbox.length}单待开箱`;
  else if (unbox.length) desc = `${unbox.length}单待开箱签收`;
  else desc = `${shipping.length}单运输中`;

  const primary = pickPrimaryMallEntry(entries);
  const p = primary && !primary.order.pendingUnbox ? getMallShipProgressFor(primary) : null;
  if (p && shipping.length) {
    desc += ` · 最快 ${p.remainClock}`;
  }

  return `
    <div class="card active-order mall-active-order active-order-group" onclick="openActiveOrderList('mall')">
      <div class="order-item">
        <div class="order-emoji">📦</div>
        <div class="order-info">
          <div class="order-rest">商城快递中<span class="active-order-group-badge">${count}单</span></div>
          <div class="order-desc">${desc}</div>
          ${p ? `<div class="active-order-bar"><div class="active-order-fill mall-fill" style="width:${p.pct}%"></div></div>` : ''}
        </div>
        <div class="order-right">
          <div class="order-price">¥${formatMoney(totalPay)}</div>
          <div class="order-status delivering">${count}单 ›</div>
        </div>
      </div>
    </div>
  `;
}

function openActiveOrderList(type) {
  activeOrderListType = type;
  renderActiveOrderListPage();
  showPage('page-active-orders');
}

let activeOrderListType = 'food';

function renderActiveOrderListPage() {
  const foodEntries = activeDeliveries.filter((e) => isFoodDeliveryOrder(e.order));
  const marketEntries = activeDeliveries.filter((e) => isSupermarketOrder(e.order));
  const body = $('active-orders-body');

  if (activeOrderListType === 'food') {
    $('active-orders-title').textContent = '🛵 外卖配送中';
    if (!foodEntries.length) {
      body.innerHTML = '<div class="cart-empty-sub" style="padding:24px;text-align:center">暂无进行中的外卖订单</div>';
      return;
    }
    body.innerHTML = `<div class="active-orders-list">${foodEntries.map((e) => activeDeliveryOrderHtml(e)).join('')}</div>`;
    return;
  }

  if (activeOrderListType === 'supermarket') {
    $('active-orders-title').textContent = '🛒 超市配送中';
    if (!marketEntries.length) {
      body.innerHTML = '<div class="cart-empty-sub" style="padding:24px;text-align:center">暂无进行中的超市订单</div>';
      return;
    }
    body.innerHTML = `<div class="active-orders-list">${marketEntries.map((e) => activeDeliveryOrderHtml(e)).join('')}</div>`;
    return;
  }

  $('active-orders-title').textContent = '📦 商城快递中';
  if (!activeMallShipments.length) {
    body.innerHTML = '<div class="cart-empty-sub" style="padding:24px;text-align:center">暂无进行中的商城订单</div>';
    return;
  }
  body.innerHTML = `<div class="active-orders-list">${activeMallShipments.map((e) => activeMallOrderHtml(e)).join('')}</div>`;
}

function activeDeliveryOrderHtml(entry) {
  const order = entry.order;
  const p = getDeliveryProgressFor(entry);
  const isMarket = isSupermarketOrder(order);
  const desc = p
    ? `${p.statusText} · 剩余 ${p.remainClock}`
    : (isMarket ? `${entry.rider.name}正在拣货` : `${entry.rider.name}正在配送`);
  const status = p ? `${p.statusShort} ›` : (isMarket ? '拣货中 ›' : '配送中 ›');

  return `
    <div class="card active-order${isMarket ? ' market-active-order' : ''}" onclick="goDeliveryTracking('${order.orderNo}')">
      <div class="order-item">
        <div class="order-emoji">${order.restEmoji}</div>
        <div class="order-info">
          <div class="order-rest">${order.restName}</div>
          <div class="order-desc">${desc}</div>
          ${p ? `<div class="active-order-bar"><div class="active-order-fill" style="width:${p.pct}%"></div></div>` : ''}
        </div>
        <div class="order-right">
          <div class="order-price">¥${formatMoney(order.pay)}</div>
          <div class="order-status delivering">${status}</div>
        </div>
      </div>
    </div>
  `;
}

function activeMallOrderHtml(entry) {
  const order = entry.order;
  if (order.pendingUnbox) {
    return `
      <div class="card active-order mall-active-order unbox-pending" onclick="openUnboxingPage('${order.orderNo}')">
        <div class="order-item">
          <div class="order-emoji">📦</div>
          <div class="order-info">
            <div class="order-rest">${order.restName}</div>
            <div class="order-desc">快递已到门口 · 点击开箱签收</div>
          </div>
          <div class="order-right">
            <div class="order-price">¥${formatMoney(order.pay)}</div>
            <div class="order-status delivering">待开箱 ›</div>
          </div>
        </div>
      </div>
    `;
  }
  const p = getMallShipProgressFor(entry);
  const desc = p ? `${p.banner.replace(/^[^\s]+ /, '')} · ${p.remainClock}` : '物流运输中';
  const status = p ? `运输中 ${Math.floor(p.pct)}% ›` : '发货中 ›';
  return `
    <div class="card active-order mall-active-order" onclick="goMallShipping('${order.orderNo}')">
      <div class="order-item">
        <div class="order-emoji">📦</div>
        <div class="order-info">
          <div class="order-rest">${order.restName}</div>
          <div class="order-desc">${desc}</div>
          ${p ? `<div class="active-order-bar"><div class="active-order-fill mall-fill" style="width:${p.pct}%"></div></div>` : ''}
        </div>
        <div class="order-right">
          <div class="order-price">¥${formatMoney(order.pay)}</div>
          <div class="order-status delivering">${status}</div>
        </div>
      </div>
    </div>
  `;
}

function refreshOrdersPageIfVisible() {
  if ($('page-orders').classList.contains('active')) {
    renderOrdersPage();
  }
  if ($('page-active-orders').classList.contains('active')) {
    renderActiveOrderListPage();
  }
}

function ensureDeliveryTimer() {
  const hasDelivery = activeDeliveries.some((e) => isDeliveryOrder(e.order));
  if (!hasDelivery) {
    clearInterval(deliveryTimer);
    deliveryTimer = null;
    return;
  }
  if (!deliveryTimer) {
    deliveryTimer = setInterval(deliveryTickAll, 1000);
  }
  deliveryTickAll();
}

function deliveryTickAll() {
  const viewing = getViewingDeliveryEntry();
  const completed = [];

  activeDeliveries.forEach((entry) => {
    if (!isDeliveryOrder(entry.order)) return;
    const pct = calcDeliveryPct(entry);
    if (viewing && viewing.order.orderNo === entry.order.orderNo
      && $('page-tracking').classList.contains('active')) {
      renderDeliveryTrackingUI(entry, pct);
    }
    if (pct >= 100) completed.push(entry);
  });

  completed.forEach(completeDelivery);

  if (!activeDeliveries.some((e) => isDeliveryOrder(e.order))) {
    clearInterval(deliveryTimer);
    deliveryTimer = null;
  } else {
    saveActiveDeliveries();
    refreshOrdersPageIfVisible();
  }
}

function accelerateDelivery(ms, entry) {
  if (!entry?.deliveryState) return 0;
  const before = entry.deliveryState.endTime;
  entry.deliveryState.endTime -= ms;
  entry.deliveryState.endTime = Math.max(Date.now() + 15000, entry.deliveryState.endTime);
  const actual = before - entry.deliveryState.endTime;
  entry.deliveryState.savedMs += actual;
  updateTipSpeedBar(entry);
  if (getViewingDeliveryEntry()?.order.orderNo === entry.order.orderNo) {
    renderDeliveryTrackingUI(entry);
  }
  saveActiveDeliveries();
  return Math.round(actual / 60000);
}

function updateTipSpeedBar(entry) {
  entry = entry || getViewingDeliveryEntry();
  if (!entry?.deliveryState || entry.deliveryState.savedMs <= 0) return;
  const savedMin = Math.round(entry.deliveryState.savedMs / 60000);
  $('tip-speed').style.display = 'block';
  $('tip-speed').textContent = `⚡ 打赏加速中，已缩短约 ${savedMin} 分钟送达时间`;
}

function resetTipSection(entry) {
  entry = entry || getViewingDeliveryEntry();
  const isMarket = entry && isSupermarketOrder(entry.order);
  tipTotal = 0;
  $('tip-section').style.display = 'none';
  $('merchant-tip-btns').style.display = 'flex';
  $('tip-btns').style.display = 'flex';
  $('merchant-tip-total').style.display = 'none';
  $('tip-total').style.display = 'none';
  $('tip-speed').style.display = 'none';
  $('support-card').style.display = 'none';
  const merchantTitle = $('merchant-tip-card')?.querySelector('.tip-title');
  const riderTitle = $('rider-tip-card')?.querySelector('.tip-title');
  if (merchantTitle) merchantTitle.textContent = isMarket ? '给拣货员加个油 🛒' : '给商家加个油 🍳';
  if (riderTitle) riderTitle.textContent = isMarket ? '给配送小哥加鸡腿 🍗' : '给猫猫骑手加个鸡腿 🍗';
  $('merchant-tip-sub').textContent = isMarket
    ? '店员收到红包，推车轮子转得更快'
    : '老板收到红包，锅铲抡得更快';
  $('tip-sub').textContent = isMarket
    ? '配送小哥收到鸡腿，袋子绑得更紧了'
    : '猫猫跑得飞快，赏点什么吧（假装的）';
}

function closeTracking() {
  const entry = getViewingDeliveryEntry();
  const isMarket = entry && isSupermarketOrder(entry.order);
  const name = entry?.rider?.name || (isMarket ? '店员' : '骑手');
  toast(isMarket
    ? `${name}：你不看着我，我也会把货"送到"的 🛒`
    : `${name}：你不看着我，我也会"送到"的 🐾`);
  goOrders();
}

// ===== 打赏 =====
let tipTotal = 0;

const MERCHANT_THANKS = [
  '老板：收到！锅铲已经抡出火星子了 🔥',
  '厨房：加急制作中，虽然菜还是不会来',
  '店长：这红包比真订单还让人感动',
  '后厨：催单成功，颠勺频率提升200%',
];

// 收款码图片，放在项目根目录
const SUPPORT_ALIPAY_QR = '支付宝.jpg';
const SUPPORT_WECHAT_QR = '微信.png';

const TIP_THANKS = [
  '喵呜——尾巴摇成了螺旋桨！',
  '猫猫感动得原地打了个滚（外卖没洒）',
  '骑手切换到「猫粮驱动」模式，速度飙升！',
  '喵：这份恩情，本猫记在猫粮罐上了',
  '猫猫回头对你眨了眨眼 😽',
];

const STAFF_THANKS = [
  '店员：收到！推车已经跑出火星子了 🛒',
  '拣货员：加急选购中，虽然货还是不会来',
  '小美：这红包比真订单还让人感动',
  '超市：催单成功，扫码枪频率提升200%',
];

function tipMerchant(amount) {
  const entry = getViewingDeliveryEntry();
  if (!entry?.deliveryState || entry.deliveryState.merchantTipped) return;
  const tipRules = getTipPhaseRules(entry);
  const isMarket = isSupermarketOrder(entry.order);
  if (!tipRules.canMerchantTip) {
    toast(isMarket ? '拣货打包已完成，现在打赏店员来不及了 📦' : '厨房已经出完餐了，现在打赏商家来不及了 🍳');
    return;
  }
  entry.deliveryState.merchantTipped = true;
  entry.deliveryState.merchantTipTotal = amount;
  tipTotal += amount;

  const savedMin = accelerateDelivery(TIP_SPEED[amount] || 120000, entry);
  $('merchant-tip-sub').textContent = (isMarket ? STAFF_THANKS : MERCHANT_THANKS)[Math.floor(Math.random() * 4)];
  $('merchant-tip-btns').style.display = 'none';
  $('merchant-tip-total').style.display = 'block';
  $('merchant-tip-total').textContent = isMarket
    ? `已打赏拣货员 ¥${amount}，店员加急选购中`
    : `已打赏商家 ¥${amount}，厨房加急中`;
  $('support-card').style.display = 'block';
  toast(isMarket
    ? `打赏拣货员 ¥${amount}，预计提前约 ${savedMin} 分钟（假的但很快）`
    : `打赏商家 ¥${amount}，预计提前约 ${savedMin} 分钟（假的但很快）`);
  renderDeliveryTrackingUI(entry);
}

const COURIER_THANKS = [
  '配送小哥：收到！袋子又多缠了两圈胶带',
  '小哥感动得差点把推车骑上路沿',
  '配送员切换到「鸡腿驱动」模式，速度飙升！',
  '小哥回头对你比了个 OK 👌',
];

function tipRider(amount) {
  const entry = getViewingDeliveryEntry();
  if (!entry?.deliveryState || entry.deliveryState.riderTipped) return;
  const tipRules = getTipPhaseRules(entry);
  const isMarket = isSupermarketOrder(entry.order);
  if (!tipRules.canRiderTip) {
    toast(isMarket ? '配送员还没出发，稍后再打赏小哥吧 🛵' : '骑手还没取餐，稍后再打赏吧 🛵');
    return;
  }
  entry.deliveryState.riderTipped = true;
  entry.deliveryState.riderTipTotal = amount;
  tipTotal += amount;

  const savedMin = accelerateDelivery(TIP_SPEED[amount] || 120000, entry);
  const name = entry.rider?.name || (isMarket ? '小哥' : '猫猫');
  $('tip-sub').textContent = (isMarket ? COURIER_THANKS : TIP_THANKS)[Math.floor(Math.random() * 4)];
  $('tip-btns').style.display = 'none';
  $('tip-total').style.display = 'block';
  $('tip-total').textContent = isMarket
    ? `已打赏配送小哥 ¥${amount}，袋子绑得更紧了`
    : `已打赏骑手 ¥${amount}，${name}的快乐是真的`;
  $('support-card').style.display = 'block';
  toast(isMarket
    ? `打赏配送小哥 ¥${amount}，预计提前约 ${savedMin} 分钟 🛵`
    : `打赏骑手 ¥${amount}，预计提前约 ${savedMin} 分钟 🛵`);
  renderDeliveryTrackingUI(entry);
}

function supportSite() {
  const alipayImg = $('support-alipay-img');
  const wechatImg = $('support-wechat-img');
  if (alipayImg) alipayImg.src = SUPPORT_ALIPAY_QR;
  if (wechatImg) wechatImg.src = SUPPORT_WECHAT_QR;
  document.body.style.overflow = 'hidden';
  $('support-modal').classList.add('open');
}

function closeSupportModal() {
  $('support-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function callRider() {
  const entry = getViewingDeliveryEntry();
  const isMarket = entry && isSupermarketOrder(entry.order);
  const phaseIdx = entry ? (getDeliveryProgressFor(entry)?.phaseIdx ?? 0) : 0;
  if (isMarket && phaseIdx < 3) {
    const lines = [
      '店员：缺货的给您换了同款更好的～',
      '小美：冻品我多裹了两层冰袋，放心',
      '拣货员：推车已满，正在往收银台赶',
      '超市：别催了，货架上真没货了（假装有）',
    ];
    toast(lines[Math.floor(Math.random() * lines.length)]);
    return;
  }
  if (isMarket) {
    const lines = [
      '配送小哥：袋子绑好了，马上到！',
      '小哥：生鲜和日用品分袋装了，放心',
      '配送员正飞奔中，请稍后再拨 📞',
      '小哥：别催了，电梯里挤着呢……',
    ];
    toast(lines[Math.floor(Math.random() * lines.length)]);
    return;
  }
  const lines = [
    '喵？喵喵喵——（翻译：马上就到）',
    '骑手正忙着舔毛，请稍后再拨 🐾',
    '喵：外卖在精神世界里马上送达！',
    '喵：别催了，猫在元宇宙的晚高峰堵着呢……',
  ];
  toast(lines[Math.floor(Math.random() * lines.length)]);
}

const DONE_QUOTES = [
  '刚才那顿的快乐是真的，\n钱包的完整也是真的。',
  '你已经体验了点外卖的全部乐趣，\n除了吃——但那本来就是最不重要的部分（吗？）',
  '深夜的馋，就这样被温柔地骗过去了。',
  '恭喜完成一次零成本、零卡路里的消费体验。',
];

function showDone(order) {
  if (!order) return;

  $('saved-money').textContent = `¥${formatMoney(order.pay)}`;
  const kcalStat = $('saved-kcal').closest('.stat');
  const kcalLabel = kcalStat?.querySelector('.stat-label');
  if (getOrderCategory(order) === 'food' && order.kcal > 0) {
    $('saved-kcal').textContent = order.kcal;
    if (kcalLabel) kcalLabel.textContent = '千卡没吃进去';
    if (kcalStat) kcalStat.style.display = '';
  } else {
    $('saved-kcal').textContent = orderItemCount(order);
    if (kcalLabel) kcalLabel.textContent = '件商品';
    if (kcalStat) kcalStat.style.display = '';
  }
  $('done-quote').textContent = DONE_QUOTES[Math.floor(Math.random() * DONE_QUOTES.length)];

  saveOrder({ ...order, time: Date.now(), status: '已送达' });
  showPage('page-done');
}

function restart() {
  cart = {};
  itemPrices = {};
  dailyGrab = null;
  currentRestaurant = null;
  activeDeliveries = [];
  activeMallShipments = [];
  viewingDeliveryOrderNo = null;
  viewingMallOrderNo = null;
  unboxSteps = {};
  clearInterval(deliveryTimer);
  clearInterval(mallShipTimer);
  localStorage.removeItem(MALL_SHIP_KEY);
  localStorage.removeItem(DELIVERY_ACTIVE_KEY);
  Object.keys(cartContexts).forEach((k) => {
    cartContexts[k] = k === 'mall'
      ? { stores: {} }
      : { restId: null, items: {}, itemPrices: {}, ...(k === 'delivery' ? { dailyGrab: null } : {}) };
  });
  persistAllCarts();
  goHome();
}

// ===== 战绩分析 =====
const TIME_PERIODS = [
  { id: 'morning',   label: '上午', emoji: '🌅', hours: [6, 7, 8, 9, 10, 11] },
  { id: 'afternoon', label: '下午', emoji: '☀️', hours: [12, 13, 14, 15, 16, 17] },
  { id: 'evening',   label: '晚上', emoji: '🌆', hours: [18, 19, 20, 21] },
  { id: 'night',     label: '深夜', emoji: '🌙', hours: [22, 23, 0, 1, 2, 3, 4, 5] },
];

function getTimePeriod(hour) {
  return TIME_PERIODS.find((p) => p.hours.includes(hour)) || TIME_PERIODS[3];
}

function formatOrderTime(ts) {
  const d = new Date(ts);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const period = getTimePeriod(h);
  return {
    period,
    clock: `${String(h).padStart(2, '0')}:${m}`,
    date: `${d.getMonth() + 1}月${d.getDate()}日`,
    full: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(h).padStart(2, '0')}:${m}`,
  };
}

function splitOrdersByCategory(orders) {
  const dining = orders.filter((o) => {
    const cat = getOrderCategory(o);
    return cat === 'food' || cat === 'supermarket';
  });
  const shopping = orders.filter((o) => {
    const cat = getOrderCategory(o);
    return cat === 'mall' || cat === 'leisure';
  });
  return { dining, shopping };
}

function analyzeOrders(orders) {
  const periods = TIME_PERIODS.map((p) => ({
    ...p, count: 0, money: 0, kcal: 0, items: 0, orders: [],
  }));
  let totalMoney = 0, totalKcal = 0, totalItems = 0;
  orders.forEach((o) => {
    const t = formatOrderTime(o.time);
    const bucket = periods.find((p) => p.id === t.period.id);
    const itemCount = o.items ? o.items.reduce((s, it) => s + it.count, 0) : 0;
    const foodKcal = getOrderCategory(o) === 'food' ? (o.kcal || 0) : 0;
    bucket.count++;
    bucket.money += toMoney(o.pay);
    bucket.kcal += foodKcal;
    bucket.items += itemCount;
    bucket.orders.push({ ...o, timeInfo: t, itemCount });
    totalMoney += toMoney(o.pay);
    totalKcal += foodKcal;
    totalItems += itemCount;
  });
  periods.forEach((p) => { p.money = toMoney(p.money); });
  const top = [...periods].sort((a, b) => b.count - a.count)[0];
  return { periods, totalMoney: toMoney(totalMoney), totalKcal, totalItems, totalCount: orders.length, top };
}

const PERIOD_INSIGHTS = {
  dining: {
    morning: '你是早起型干饭人，空腹点单，精神饱足。',
    afternoon: '下午摸鱼点单党，奶茶炸鸡是续命神器。',
    evening: '晚饭黄金档常客，烟火气全在购物车里了。',
    night: '深夜党实锤，饿意总在关灯后准时敲门。',
  },
  shopping: {
    morning: '早晨逛商城或订休闲，清醒消费不踩坑。',
    afternoon: '下午剁手或约玩，快递和票根都还没到。',
    evening: '晚饭后刷商城、订娱乐，钱包在精神世界里瘦身。',
    night: '深夜加购或抢票，购物车比梦还精彩。',
  },
};

let statsTab = 'dining';

function switchStatsTab(tab) {
  statsTab = tab;
  renderStatsPage();
}

function goStats() {
  renderStatsPage();
  showPage('page-stats');
}

function renderStatsPage() {
  const orders = getOrders();
  const body = $('stats-page-body');
  const { dining, shopping } = splitOrdersByCategory(orders);

  if (orders.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-emoji">📊</div>
        <div class="cart-empty-title">还没有战绩数据</div>
        <div class="cart-empty-sub">先点几单寂寞外卖，再来复盘你的干饭生物钟</div>
        <button class="cart-empty-btn" onclick="goHome()">去点一单</button>
      </div>
    `;
    return;
  }

  const activeOrders = statsTab === 'shopping' ? shopping : dining;
  const isDining = statsTab === 'dining';

  const tabsHtml = `
    <div class="stats-type-tabs">
      <div class="stats-type-tab${isDining ? ' active' : ''}" onclick="switchStatsTab('dining')">
        🛵 外卖超市 <span class="stats-tab-count">${dining.length}</span>
      </div>
      <div class="stats-type-tab${!isDining ? ' active' : ''}" onclick="switchStatsTab('shopping')">
        🛍️ 购物娱乐 <span class="stats-tab-count">${shopping.length}</span>
      </div>
    </div>
  `;

  if (activeOrders.length === 0) {
    body.innerHTML = tabsHtml + `
      <div class="cart-empty" style="margin-top:12px">
        <div class="cart-empty-emoji">${isDining ? '🛵' : '🛍️'}</div>
        <div class="cart-empty-title">${isDining ? '还没有外卖超市记录' : '还没有购物娱乐记录'}</div>
        <div class="cart-empty-sub">${isDining ? '美食外卖、超市便利订单会统计在这里' : '购物商城、休闲娱乐订单会统计在这里'}</div>
        <button class="cart-empty-btn" onclick="goHome('${isDining ? 'food' : 'mall'}')">去${isDining ? '点一单' : '逛一逛'}</button>
      </div>
    `;
    return;
  }

  const { periods, totalMoney, totalKcal, totalItems, totalCount, top } = analyzeOrders(activeOrders);
  const maxCount = Math.max(...periods.map((p) => p.count), 1);
  const insights = PERIOD_INSIGHTS[statsTab];
  const insightLabel = isDining ? '最爱下单时段' : '最爱消费时段';

  const overviewHtml = isDining ? `
    <div class="stats-grid">
      <div class="pstat"><div class="pstat-num">¥${formatMoney(totalMoney)}</div><div class="pstat-label">累计省下</div></div>
      <div class="pstat"><div class="pstat-num">${totalKcal > 0 ? totalKcal : totalItems}</div><div class="pstat-label">${totalKcal > 0 ? '千卡没吃' : '件商品'}</div></div>
      <div class="pstat"><div class="pstat-num">${totalCount}</div><div class="pstat-label">外卖超市订单</div></div>
    </div>
  ` : `
    <div class="stats-grid">
      <div class="pstat"><div class="pstat-num">¥${formatMoney(totalMoney)}</div><div class="pstat-label">累计消费</div></div>
      <div class="pstat"><div class="pstat-num">${totalItems}</div><div class="pstat-label">买到宝贝</div></div>
      <div class="pstat"><div class="pstat-num">${totalCount}</div><div class="pstat-label">购物娱乐订单</div></div>
    </div>
  `;

  body.innerHTML = tabsHtml + `
    <div class="card stats-overview">
      ${overviewHtml}
    </div>

    <div class="card">
      <div class="stats-card-title">⏰ 时段分析</div>
      <div class="stats-insight">
        ${insightLabel}：<b>${top.emoji} ${top.label}</b>（${top.count}单，占 ${Math.round(top.count / totalCount * 100)}%）
        <div class="stats-insight-sub">${insights[top.id]}</div>
      </div>
      ${periods.map((p) => `
        <div class="period-row">
          <div class="period-head">
            <span class="period-label">${p.emoji} ${p.label}</span>
            <span class="period-meta">${p.count}单 · ¥${formatMoney(p.money)}${isDining ? (p.kcal > 0 ? ` · ${p.kcal}千卡` : ` · ${p.items}件`) : ` · ${p.items}件`}</span>
          </div>
          <div class="period-bar"><div class="period-fill" style="width:${p.count / maxCount * 100}%"></div></div>
          <div class="period-pct">${totalCount ? Math.round(p.count / totalCount * 100) : 0}%</div>
        </div>
      `).join('')}
    </div>

    ${periods.filter((p) => p.count > 0).map((p) => `
      <div class="card stats-period-block">
        <div class="stats-card-title">${p.emoji} ${p.label}（${p.count}单）</div>
        ${p.orders.map((o) => `
          <div class="stats-order-item" onclick="openOrderDetail(${o.time})">
            <div class="stats-order-time">
              <span class="stats-order-clock">${o.timeInfo.clock}</span>
              <span class="stats-order-date">${o.timeInfo.date}</span>
            </div>
            <div class="stats-order-info">
              <div class="stats-order-rest">${o.restEmoji} ${o.restName}</div>
              <div class="stats-order-desc">${o.summary || (isDining ? '外卖超市一单' : '购物娱乐一单')}</div>
            </div>
            <div class="stats-order-right">
              <div class="stats-order-pay">¥${formatMoney(o.pay)}</div>
              <div class="stats-order-kcal">${isDining ? orderSubMeta(o) : `共${o.itemCount}件`}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `).join('')}
  `;
}

// ===== 每日签到 =====
function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getYesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getCheckinData() {
  if (!isLoggedIn()) return { lastDate: '', streak: 0 };
  const ownerId = getOwnerId();
  try {
    const all = JSON.parse(localStorage.getItem(CHECKIN_KEY)) || {};
    return all[ownerId] || { lastDate: '', streak: 0 };
  } catch { return { lastDate: '', streak: 0 }; }
}

function saveCheckinData(data) {
  const ownerId = getOwnerId();
  const all = JSON.parse(localStorage.getItem(CHECKIN_KEY) || '{}');
  all[ownerId] = data;
  localStorage.setItem(CHECKIN_KEY, JSON.stringify(all));
}

function renderCheckin() {
  const today = getTodayStr();
  const data = getCheckinData();
  const checkedToday = data.lastDate === today;
  const chainAlive = checkedToday || data.lastDate === getYesterdayStr();
  const streak = checkedToday ? data.streak : (data.lastDate === getYesterdayStr() ? data.streak : 0);
  const doneInCycle = streak === 0 ? 0 : (streak % 7 === 0 ? 7 : streak % 7);
  const nextIndex = streak % 7;

  $('checkin-streak').textContent = `已连续 ${streak} 天`;

  $('checkin-days').innerHTML = SIGN_IN_REWARDS.map((r, i) => {
    const c = COUPONS.find((x) => x.id === r.couponId);
    const done = i < doneInCycle;
    const isToday = !checkedToday && chainAlive && i === nextIndex;
    const justDone = checkedToday && i === (data.streak - 1) % 7;
    return `
      <div class="checkin-day ${done ? 'done' : ''} ${isToday ? 'today' : ''} ${justDone ? 'just' : ''}">
        <div class="checkin-day-tag">${r.tag}</div>
        <div class="checkin-day-amt">¥${c ? c.amount : '?'}</div>
        <div class="checkin-day-mark">${done ? '✓' : isToday ? '今' : ''}</div>
      </div>
    `;
  }).join('');

  const btn = $('checkin-btn');
  const reward = SIGN_IN_REWARDS[nextIndex];
  const c = COUPONS.find((x) => x.id === reward.couponId);
  if (!isLoggedIn()) {
    btn.textContent = '登录后签到领券';
    btn.classList.remove('done');
    btn.disabled = false;
    btn.onclick = () => requireLogin('登录后才能签到领券 📅');
    return;
  }
  btn.onclick = () => doCheckin();
  if (checkedToday) {
    btn.textContent = '今日已签到 ✓';
    btn.classList.add('done');
    btn.disabled = true;
  } else {
    btn.textContent = chainAlive ? `签到领 ¥${c ? c.amount : ''} 券` : `签到领 ¥${c ? c.amount : ''} 券`;
    btn.classList.remove('done');
    btn.disabled = false;
  }
}

function doCheckin() {
  if (!requireLogin('登录后才能签到领券 📅')) return;
  const today = getTodayStr();
  const data = getCheckinData();
  if (data.lastDate === today) {
    toast('今天已经签过到了，明天再来～');
    return;
  }

  let streak = 1;
  if (data.lastDate === getYesterdayStr()) streak = data.streak + 1;
  const rewardIndex = (streak - 1) % 7;
  const reward = SIGN_IN_REWARDS[rewardIndex];
  const grantedId = grantSignInCoupon(reward.couponId);

  saveCheckinData({ lastDate: today, streak });
  renderCheckin();
  renderProfile();

  if (grantedId) {
    const c = COUPONS.find((x) => x.id === grantedId);
    toast(`签到成功！连续${streak}天，获得 ${c.name} 🎫`);
  } else {
    toast(`签到成功！连续${streak}天，券包已满但心意到了 🐷`);
  }
}

// ===== 我的页面 =====
function goProfile() {
  renderProfile();
  showPage('page-profile');
}

function renderProfile() {
  const user = getUser();
  const guest = getGuest();
  $('login-card').style.display = user ? 'none' : 'flex';
  $('user-card').style.display = user ? 'flex' : 'none';
  if (user) {
    $('profile-avatar').textContent = user.avatar;
    $('profile-name').textContent = user.name;
    $('profile-userid').textContent = `用户 ID：${user.userId}`;
  } else {
    $('guest-id-display').textContent = guest.guestId;
  }

  const orders = getOrders();
  const { dining, shopping } = splitOrdersByCategory(orders);
  const diningMoney = toMoney(dining.reduce((s, o) => s + toMoney(o.pay), 0));
  const diningKcal = dining.filter((o) => getOrderCategory(o) === 'food').reduce((s, o) => s + (o.kcal || 0), 0);
  const diningItems = dining.reduce((s, o) => s + orderItemCount(o), 0);
  const shoppingMoney = toMoney(shopping.reduce((s, o) => s + toMoney(o.pay), 0));
  $('stat-money').textContent = `¥${formatMoney(diningMoney + shoppingMoney)}`;
  const kcalEl = $('stat-kcal');
  const kcalLabel = kcalEl?.closest('.pstat')?.querySelector('.pstat-label');
  if (diningKcal > 0) {
    kcalEl.textContent = diningKcal;
    if (kcalLabel) kcalLabel.textContent = '千卡没吃';
  } else {
    kcalEl.textContent = diningItems;
    if (kcalLabel) kcalLabel.textContent = '件商品';
  }
  $('stat-count').textContent = orders.length;
  const diningEl = $('stat-dining-count');
  const shoppingEl = $('stat-shopping-count');
  if (diningEl) diningEl.textContent = `${dining.length}单`;
  if (shoppingEl) shoppingEl.textContent = `${shopping.length}单`;

  renderCheckin();
  renderProfileAddresses();
  const inviteEl = $('profile-invite-code');
  if (inviteEl) inviteEl.textContent = getInviteCode();

  const grabbed = getGrabbedCoupons();
  $('profile-coupon-count').textContent = `${grabbed.length}张`;
  const listEl = $('profile-coupon-list');
  if (grabbed.length === 0) {
    listEl.innerHTML = `
      <div class="profile-coupon-empty" onclick="${isLoggedIn() ? 'goCoupons()' : 'openLogin()'}">
        ${isLoggedIn() ? '还没有券，去抢券中心逛逛 ›' : '登录后可领券，去登录 ›'}
      </div>
    `;
    return;
  }
  listEl.innerHTML = grabbed.slice(0, 4).map((g) => {
    const c = COUPONS.find((x) => x.id === g.id);
    if (!c) return '';
    const minText = c.min === 0 ? '无门槛' : `满${c.min}`;
    return `
      <div class="profile-coupon-item" onclick="event.stopPropagation(); openCouponDetail('${c.id}')">
        <span class="profile-coupon-amt">¥${c.amount}</span>
        <span class="profile-coupon-info">
          <span class="profile-coupon-name">${c.name}</span>
          <span class="profile-coupon-min">${minText} · ${c.scope}</span>
        </span>
        <span class="profile-coupon-arrow">›</span>
      </div>
    `;
  }).join('');
}

// ===== 订单页面 =====
let orderFilterTab = 'all';

const ORDER_TAB_LABELS = {
  all: '全部',
  food: '美食外卖',
  supermarket: '超市便利',
  mall: '购物商城',
  leisure: '休闲娱乐',
};

function getOrderCategory(o) {
  if (o.orderType === 'mall') return 'mall';
  if (o.orderType === 'leisure') return 'leisure';
  if (o.orderType === 'supermarket') return 'supermarket';
  const store = findStore(o.restId);
  if (store?.homeType === 'supermarket') return 'supermarket';
  return 'food';
}

function orderItemCount(o) {
  return o.items ? o.items.reduce((s, it) => s + it.count, 0) : 0;
}

function orderSubMeta(o) {
  const cat = getOrderCategory(o);
  if (cat === 'food' && o.kcal > 0) return `${o.kcal}千卡没吃`;
  return `共${orderItemCount(o)}件`;
}

function orderKcalDetailHtml(o) {
  const cat = getOrderCategory(o);
  if (cat === 'leisure') return '';
  if (cat === 'food' && o.kcal > 0) {
    return `<div class="od-kcal">这一单共 ${o.kcal} 千卡，一口都没吃进去 🎉</div>`;
  }
  if (cat === 'supermarket') {
    return `<div class="od-kcal">共 ${orderItemCount(o)} 件商品，已全部放进想象中冰箱 🛒</div>`;
  }
  return '';
}

function orderMatchesFilter(o, tab = orderFilterTab) {
  if (tab === 'all') return true;
  return getOrderCategory(o) === tab;
}

function switchOrderTab(tab) {
  orderFilterTab = tab;
  renderOrdersPage();
}

// ===== 订单页分享推广 =====
const ORDER_SHARE_CARDS = [
  {
    id: 'invite',
    featured: true,
    theme: 'warm',
    emoji: '🐷',
    deco: '🎁',
    title: '邀请好友来「饱了么」',
    sub: '好友来玩你得 <b>¥8</b> 假象红包',
    tag: '推广有礼',
    btn: '立即分享',
  },
  {
    id: 'stats',
    theme: 'blue',
    emoji: '📊',
    title: '晒战绩',
    sub: '炫耀寂寞订单数',
    btn: '分享战绩',
  },
  {
    id: 'delivery',
    theme: 'orange',
    emoji: '🛵',
    title: '晒配送',
    sub: '骑手在路上（假的）',
    btn: '分享进度',
  },
  {
    id: 'coupon',
    theme: 'pink',
    emoji: '🎫',
    title: '晒抢券',
    sub: '天天秒大牌',
    btn: '分享好券',
  },
  {
    id: 'lonely',
    theme: 'green',
    emoji: '🍜',
    title: '安利寂寞',
    sub: '点了不吃更快乐',
    btn: '分享安利',
  },
  {
    id: 'order',
    theme: 'purple',
    emoji: '📋',
    title: '晒一单',
    sub: '分享最近一单',
    btn: '分享订单',
  },
];

function getInviteCode() {
  return getOwnerId().slice(-6).toUpperCase();
}

function getShareUrl() {
  const base = window.location.href.split('?')[0].split('#')[0];
  return `${base}?ref=${encodeURIComponent(getInviteCode())}`;
}

function getLatestShareableOrder() {
  const orders = getOrders();
  return orders.length ? orders[0] : null;
}

function buildShareContent(id) {
  const url = getShareUrl();
  const code = getInviteCode();
  const name = getUser()?.name || '匿名干饭人';
  const orders = getOrders();
  const stats = analyzeOrders(orders);
  const latest = getLatestShareableOrder();
  const deliveryEntry = activeDeliveries[0];
  const deliveryOrder = deliveryEntry?.order;
  const deliveryProgress = deliveryEntry ? getDeliveryProgressFor(deliveryEntry) : null;
  const riderName = deliveryEntry?.rider?.name || '神秘骑手';

  const contents = {
    invite: {
      title: '饱了么 - 点了个寂寞',
      text: `【饱了么】点了个寂寞，饱了个心情！\n${name} 邀请你来假装点餐，一分钱不用花，骑手也不会真的来 😂\n\n👉 ${url}\n邀请码：${code}`,
    },
    stats: {
      title: '我的饱了么战绩',
      text: stats.totalCount > 0
        ? `我在「饱了么」下了 ${stats.totalCount} 单寂寞外卖，${stats.totalKcal > 0 ? `${stats.totalKcal} 千卡一口没吃` : `共 ${stats.totalItems} 件商品全在想象中`}，省下了 ¥${formatMoney(stats.totalMoney)}（当然没真花钱）\n\n最常在${stats.top.label}点单 · 一起来玩 → ${url}`
        : `我在「饱了么」准备开始点寂寞了！饿了就点，点了不吃，吃了不长胖 🍜\n\n一起来玩 → ${url}`,
    },
    delivery: {
      title: '我的外卖正在路上',
      text: deliveryOrder
        ? `我的订单 ${deliveryOrder.orderNo} 正在配送中！${riderName} ${deliveryProgress?.statusText || '正在飞奔'}（但不会真的敲门 🚪）\n${deliveryOrder.restEmoji} ${deliveryOrder.restName} · ¥${formatMoney(deliveryOrder.pay)}\n\n来「饱了么」一起假装等外卖 → ${url}`
        : `在「饱了么」下单后，骑手会在地图上飞奔——但永远不会真的到你家门口 🛵\n\n来一起假装等外卖 → ${url}`,
    },
    coupon: {
      title: '饱小宝抢券中心',
      text: `饱小宝抢券中心天天秒大牌！券是假的，快乐是真的 🎫\n${name} 喊你来抢券，反正不要钱\n\n👉 ${url}`,
    },
    lonely: {
      title: '饱了么 - 点了个寂寞',
      text: `饿了就点，点了不吃，吃了不长胖。\n欢迎来「饱了么」点一单寂寞，外卖永远不会送达，钱包永远安全 😌\n\n👉 ${url}`,
    },
    order: {
      title: '我在饱了么下了一单',
      text: latest
        ? `刚在「饱了么」下了单：${latest.restEmoji} ${latest.restName}\n${latest.items?.slice(0, 3).map((it) => `${it.emoji}${it.name}×${it.count}`).join('、') || latest.summary} · ¥${formatMoney(latest.pay)}\n一口都没吃进去，但心情饱了 🎉\n\n👉 ${url}`
        : `「饱了么」——点了个寂寞，饱了个心情。先下一单假装满足胃吧 🍜\n\n👉 ${url}`,
    },
  };

  return contents[id] || contents.invite;
}

let currentShareCardId = null;

function buildShareCardVisual(id) {
  const meta = ORDER_SHARE_CARDS.find((c) => c.id === id) || ORDER_SHARE_CARDS[0];
  const content = buildShareContent(id);
  const name = getUser()?.name || '匿名干饭人';
  const code = getInviteCode();
  const orders = getOrders();
  const stats = analyzeOrders(orders);
  const latest = getLatestShareableOrder();
  const deliveryEntry = activeDeliveries[0];
  const deliveryOrder = deliveryEntry?.order;
  const deliveryProgress = deliveryEntry ? getDeliveryProgressFor(deliveryEntry) : null;
  const riderName = deliveryEntry?.rider?.name || '神秘骑手';

  const visual = {
    id,
    meta,
    content,
    theme: meta.theme,
    emoji: meta.emoji,
    deco: meta.deco || '',
    tag: meta.tag || '分享卡片',
    title: meta.title,
    desc: meta.sub.replace(/<[^>]+>/g, ''),
    highlight: '',
    stats: [],
    items: [],
    progress: null,
    code,
    slogan: '点了个寂寞，饱了个心情',
  };

  switch (id) {
    case 'invite':
      visual.highlight = `${name} 邀请你来假装点餐`;
      visual.stats = [
        { val: '¥8', lbl: '假象红包' },
        { val: '0元', lbl: '真实花费' },
        { val: '∞', lbl: '快乐值' },
      ];
      break;
    case 'stats':
      visual.highlight = stats.totalCount > 0 ? `${name} 的寂寞战绩` : `${name} 即将开启寂寞之旅`;
      visual.stats = stats.totalCount > 0
        ? [
            { val: String(stats.totalCount), lbl: '寂寞订单' },
            { val: stats.totalKcal > 0 ? String(stats.totalKcal) : String(stats.totalItems), lbl: stats.totalKcal > 0 ? '千卡没吃' : '件商品' },
            { val: `¥${formatMoney(stats.totalMoney)}`, lbl: '省下假象钱' },
          ]
        : [
            { val: '0', lbl: '寂寞订单' },
            { val: '0', lbl: '千卡没吃' },
            { val: '¥0', lbl: '省下假象钱' },
          ];
      visual.desc = stats.totalCount > 0 ? `最爱在${stats.top.emoji}${stats.top.label}点单` : '饿了就点，点了不吃';
      break;
    case 'delivery':
      if (deliveryOrder) {
        visual.highlight = `${riderName} 正在配送（假的）`;
        visual.desc = `${deliveryOrder.restEmoji} ${deliveryOrder.restName} · ¥${formatMoney(deliveryOrder.pay)}`;
        visual.progress = {
          pct: deliveryProgress?.pct || 35,
          text: `${deliveryProgress?.statusText || '配送中'} · 订单 ${deliveryOrder.orderNo}`,
        };
      } else {
        visual.highlight = '下单后骑手会在地图上飞奔';
        visual.desc = '但不会真的到你家门口';
        visual.progress = { pct: 20, text: '等待下一单配送中…' };
      }
      break;
    case 'coupon':
      visual.highlight = `${name} 喊你来抢券`;
      visual.stats = [
        { val: '天天', lbl: '秒杀大牌' },
        { val: '0元', lbl: '抢券花费' },
        { val: '100%', lbl: '快乐真的' },
      ];
      break;
    case 'lonely':
      visual.highlight = '饿了就点，点了不吃，吃了不长胖';
      visual.stats = [
        { val: '0卡', lbl: '真实摄入' },
        { val: '100%', lbl: '心情满足' },
        { val: '0元', lbl: '钱包伤害' },
      ];
      break;
    case 'order':
      if (latest) {
        visual.highlight = `${latest.restEmoji} ${latest.restName}`;
        visual.desc = `订单 ${latest.orderNo} · ¥${formatMoney(latest.pay)}`;
        visual.items = (latest.items || []).slice(0, 4).map((it) => ({
          emoji: it.emoji,
          name: it.name,
          count: it.count,
        }));
      } else {
        visual.highlight = '先下一单假装满足胃吧';
        visual.desc = '外卖永远不会送达，但心情会饱';
      }
      break;
    default:
      visual.highlight = `${name} 分享给你`;
  }

  return visual;
}

function renderSharePosterHtml(visual) {
  const statsHtml = visual.stats.length
    ? `<div class="share-poster-stats">${visual.stats.map((s) => `
        <div class="share-poster-stat">
          <div class="share-poster-stat-val">${escapeHtml(s.val)}</div>
          <div class="share-poster-stat-lbl">${escapeHtml(s.lbl)}</div>
        </div>
      `).join('')}</div>`
    : '';

  const itemsHtml = visual.items.length
    ? `<div class="share-poster-items">${visual.items.map((it) => `
        <div class="share-poster-item">
          <span class="share-poster-item-emoji">${it.emoji}</span>
          <span>${escapeHtml(it.name)}×${it.count}</span>
        </div>
      `).join('')}</div>`
    : '';

  const progressHtml = visual.progress
    ? `<div class="share-poster-progress"><div class="share-poster-progress-fill" style="width:${visual.progress.pct}%"></div></div>
       <div class="share-poster-progress-text">${escapeHtml(visual.progress.text)}</div>`
    : '';

  return `
    <div class="share-poster-top">
      <div class="share-poster-brand">饱了么</div>
      <div class="share-poster-tag">${escapeHtml(visual.tag)}</div>
    </div>
    <div class="share-poster-hero">
      <div class="share-poster-emoji">${visual.emoji}</div>
      <div class="share-poster-title">${escapeHtml(visual.title)}</div>
      <div class="share-poster-desc">${escapeHtml(visual.desc)}</div>
    </div>
    <div class="share-poster-body">
      <div class="share-poster-highlight">${escapeHtml(visual.highlight)}</div>
      ${statsHtml}
      ${itemsHtml}
      ${progressHtml}
    </div>
    <div class="share-poster-foot">
      <div class="share-poster-code">邀请码 ${escapeHtml(visual.code)}</div>
      <div class="share-poster-slogan">${escapeHtml(visual.slogan)} · 长按保存发给好友</div>
    </div>
    ${visual.deco ? `<div class="share-poster-deco">${visual.deco}</div>` : ''}
  `;
}

function openShareCardModal(id) {
  currentShareCardId = id;
  const visual = buildShareCardVisual(id);
  const poster = $('share-poster');
  poster.className = `share-poster theme-${visual.theme}`;
  poster.innerHTML = renderSharePosterHtml(visual);
  $('share-card-modal').classList.add('open');
}

function closeShareCardModal() {
  $('share-card-modal').classList.remove('open');
  currentShareCardId = null;
}

async function captureSharePoster() {
  const el = $('share-poster');
  if (!el || !window.html2canvas) {
    toast('图片生成组件未加载，请刷新页面重试');
    return null;
  }
  try {
    return await html2canvas(el, {
      scale: 2,
      backgroundColor: null,
      useCORS: true,
      logging: false,
    });
  } catch {
    toast('卡片生成失败，请稍后再试');
    return null;
  }
}

async function saveShareCardImage() {
  const canvas = await captureSharePoster();
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = `饱了么-${currentShareCardId || 'share'}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  toast('分享卡片已保存 📸');
}

async function shareShareCardImage() {
  const canvas = await captureSharePoster();
  if (!canvas) return;
  const content = buildShareContent(currentShareCardId || 'invite');

  const shareBlob = () => new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });

  const blob = await shareBlob();
  if (!blob) {
    toast('图片生成失败');
    return;
  }

  const file = new File([blob], `饱了么-${currentShareCardId || 'share'}.png`, { type: 'image/png' });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: content.title,
        text: content.text,
      });
      toast('卡片已分享！');
      return;
    } catch (e) {
      if (e.name === 'AbortError') return;
    }
  }

  await saveShareCardImage();
}

async function copyShareCardText() {
  const content = buildShareContent(currentShareCardId || 'invite');
  const copied = await copyShareText(content.text);
  toast(copied ? '文案已复制，可搭配卡片一起发 📋' : '复制失败，请手动复制');
}

async function copyShareText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.appendChild(ta);
    ta.select();
    try {
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      document.body.removeChild(ta);
      return false;
    }
  }
}

async function sharePromoCard(id) {
  openShareCardModal(id);
}

function renderShareOptionItem(card) {
  const sub = card.sub.replace(/<[^>]+>/g, '');
  return `
    <div class="share-option-item theme-${card.theme}" onclick="pickShareOption('${card.id}')">
      <div class="share-option-emoji">${card.emoji}</div>
      <div class="share-option-info">
        <div class="share-option-title">${card.title}</div>
        <div class="share-option-sub">${sub}</div>
      </div>
      <span class="share-option-arrow">›</span>
    </div>
  `;
}

function renderShareOptionsList() {
  return ORDER_SHARE_CARDS.map(renderShareOptionItem).join('');
}

function openShareOptionsModal() {
  $('share-options-body').innerHTML = renderShareOptionsList();
  $('share-options-modal').classList.add('open');
}

function closeShareOptionsModal() {
  $('share-options-modal').classList.remove('open');
}

function pickShareOption(id) {
  closeShareOptionsModal();
  openShareCardModal(id);
}

function goOrders() {
  renderOrdersPage();
  showPage('page-orders');
}

function renderOrdersPage() {
  const body = $('orders-body');
  const allOrders = getOrders();
  const orders = allOrders.filter((o) => orderMatchesFilter(o));
  const activeHtml = activeOrderHtml(orderFilterTab);

  document.querySelectorAll('#orders-tabs .cart-type-tab').forEach((el) => {
    el.classList.toggle('active', el.dataset.tab === orderFilterTab);
  });

  if (!activeHtml && orders.length === 0) {
    if (!hasActiveOrders() && allOrders.length === 0) {
      body.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-emoji">📋</div>
          <div class="cart-empty-title">还没有订单</div>
          <div class="cart-empty-sub">去点一单寂寞吧，反正不要钱</div>
          <button class="cart-empty-btn" onclick="goHome()">去逛逛</button>
        </div>
      `;
      return;
    }
    const label = ORDER_TAB_LABELS[orderFilterTab] || '该类型';
    body.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-emoji">📋</div>
        <div class="cart-empty-title">暂无${label}订单</div>
        <div class="cart-empty-sub">切换其他分类看看，或者去下一单</div>
        <button class="cart-empty-btn" onclick="goHome('${orderFilterTab === 'mall' ? 'mall' : orderFilterTab === 'leisure' ? 'leisure' : orderFilterTab === 'supermarket' ? 'supermarket' : 'food'}')">去逛逛</button>
      </div>
    `;
    return;
  }

  const historyHtml = orders.map((o) => orderCardHtml(o)).join('');
  body.innerHTML = activeHtml + historyHtml;
}

function orderStatusText(o) {
  if (o.orderType === 'leisure') return o.status || '待使用';
  if (o.orderType === 'mall') return o.unboxed ? '已签收' : (o.status || '已签收');
  return '已送达';
}

function orderCardHtml(o) {
  const totalCount = o.items ? o.items.reduce((s, it) => s + it.count, 0) : 0;
  const thumbs = o.items ? o.items.slice(0, 4).map((it) => `
    <div class="ohd-thumb">
      <div class="ohd-thumb-img">${it.emoji}</div>
      <div class="ohd-thumb-name">${it.name}</div>
    </div>
  `).join('') : `<div class="ohd-summary">${o.summary}</div>`;

  const reviewBtn = o.orderType === 'leisure'
    ? `<span class="ohd-hint" onclick="event.stopPropagation(); openOrderDetail(${o.time})">🎫 查看二维码</span>`
    : getOrderReview(o.time)
      ? `<span class="ohd-hint reviewed" onclick="event.stopPropagation(); openOrderDetail(${o.time})">${'★'.repeat(getOrderReview(o.time).stars)}${'☆'.repeat(5 - getOrderReview(o.time).stars)} 已评价</span>`
      : `<span class="ohd-hint" onclick="event.stopPropagation(); openReviewModal(${o.time})">⭐ 评价订单</span>`;

  return `
    <div class="ohd-card" onclick="openOrderDetail(${o.time})">
      <div class="ohd-head" onclick="${o.restId ? `event.stopPropagation(); openRestaurant('${o.restId}')` : ''}">
        <span class="ohd-logo">${o.restEmoji}</span>
        <span class="ohd-name">${o.restName} ›</span>
        <span class="ohd-status">${orderStatusText(o)}</span>
      </div>
      <div class="ohd-promo">${o.orderType === 'mall' ? '快递包裹也不会真的敲门' : o.orderType === 'leisure' ? '到店出示二维码（假装核销）' : getOrderCategory(o) === 'supermarket' ? '店员帮你挑好货，袋子也不会真的送到' : '本店下5单得¥8红包（红包也是假的）'}</div>
      <div class="ohd-body">
        <div class="ohd-thumbs">${thumbs}</div>
        <div class="ohd-right">
          <div class="ohd-price">¥${formatMoney(o.pay)}</div>
          ${totalCount ? `<div class="ohd-count">共${totalCount}件</div>` : ''}
        </div>
      </div>
      <div class="ohd-foot">
        ${reviewBtn}
        ${(o.orderType === 'mall' || (o.restId && o.orderType !== 'leisure')) ? `<button class="ohd-again" onclick="event.stopPropagation(); reorder(${o.time})">再来一单</button>` : ''}
      </div>
    </div>
  `;
}

// ===== 订单详情 =====
function dishById(restId, dishId) {
  const r = findStore(restId);
  if (!r) return null;
  for (const c of r.categories) {
    const d = c.items.find((x) => x.id === dishId);
    if (d) return d;
  }
  return null;
}

function openOrderDetail(time) {
  const o = getOrders().find((x) => x.time === time);
  if (!o) {
    toast('这单找不到了，可能被猫叼走了 🐾');
    return;
  }

  const d = new Date(o.time);
  const timeStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  const itemsHtml = o.items ? o.items.map((it) => {
    const dish = dishById(it.storeId || o.restId, it.id);
    return `
      <div class="co-item">
        <span class="co-item-emoji">${it.emoji}</span>
        <span class="co-item-name">${it.name}</span>
        <span class="co-item-count">x${it.count}</span>
        <span class="co-item-price">${dish ? `¥${formatMoney(itemLineTotal(it.price != null ? it.price : dish.price, it.count))}` : ''}</span>
      </div>
    `;
  }).join('') : `<div class="od-summary">${o.summary}</div>`;

  const type = o.orderType || 'delivery';
  const statusCards = {
    delivery: { title: '✅ 已送达', sub: '外卖已送达你的精神世界，胃没有收到任何东西' },
    supermarket: { title: '✅ 已送达', sub: '超市订单已送达，商品在想象中冰箱整整齐齐' },
    mall: { title: '📦 已签收', sub: '快递显示已签收，但门口连快递单影子都没有' },
    leisure: { title: '🎫 待使用', sub: '到店出示下方二维码核销（商家也会假装扫一下）' },
  };
  const st = statusCards[type] || statusCards.delivery;
  const shipInfo = type === 'mall'
    ? '快递配送（1-2天）'
    : type === 'leisure'
      ? '无需配送 · 到店核销'
      : type === 'supermarket'
        ? '店员拣货打包 · 极速配送'
        : '猫猫骑手（精神直达）';
  const kcalLine = orderKcalDetailHtml(o);
  const qrBlock = type === 'leisure' && o.qrCode ? `
    <div class="card od-qr-card">
      <div class="pay-title">核销二维码</div>
      <div class="od-qr-wrap">
        <img class="od-qr-img" src="${qrImgUrl(o.qrCode)}" alt="核销码" />
      </div>
      <div class="od-qr-tip">向店员出示此码，假装享受服务</div>
    </div>
  ` : '';
  const addrBlock = o.address ? `
    <div class="od-info-row"><span>收货地址</span><span>${o.address.detail}</span></div>
  ` : '';

  $('od-body').innerHTML = `
    <div class="card od-status-card">
      <div class="od-status-title">${st.title}</div>
      <div class="od-status-sub">${st.sub}</div>
    </div>
    ${qrBlock}
    <div class="card">
      <div class="checkout-rest-name cart-rest-link" ${o.restId ? `onclick="openRestaurant('${o.restId}')"` : ''}>
        ${o.restEmoji} ${o.restName} ${o.restId ? '<span class="cart-rest-more">进店 ›</span>' : ''}
      </div>
      ${itemsHtml}
      <div class="total-row">实付 <b>¥${formatMoney(o.pay)}</b></div>
      ${kcalLine}
    </div>

    <div class="card">
      <div class="pay-title">订单信息</div>
      <div class="od-info-row"><span>订单号</span><span>${o.orderNo || 'BLM-········'}</span></div>
      <div class="od-info-row"><span>下单时间</span><span>${timeStr}</span></div>
      <div class="od-info-row"><span>配送方式</span><span>${shipInfo}</span></div>
      ${addrBlock}
      <div class="od-info-row"><span>支付方式</span><span>幻想银行卡（0元实扣）</span></div>
    </div>

    <div class="od-actions">
      <button class="od-refund" onclick="fakeRefund()">申请退款</button>
      ${o.restId && type !== 'leisure' ? `<button class="od-reorder" onclick="reorder(${o.time})">再来一单</button>` : ''}
    </div>

    ${type === 'leisure' ? '' : reviewBlockHtml(o)}
  `;

  showPage('page-order-detail');
}

function fakeRefund() {
  toast('退款失败：一分钱都没花，退无可退 😌');
}

// ===== 订单评价 =====
let reviewingOrderTime = null;
let reviewStars = 0;

const STAR_HINTS = ['', '很差', '较差', '一般', '满意', '非常满意'];

function getReviews() {
  try { return JSON.parse(localStorage.getItem(REVIEWS_KEY)) || {}; } catch { return {}; }
}

function getOrderReview(orderTime) {
  return getReviews()[orderTime] || null;
}

function saveReview(orderTime, data) {
  const all = getReviews();
  all[orderTime] = data;
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(all));
}

function pickMerchantReply(stars) {
  const pool = MERCHANT_REPLIES[stars] || MERCHANT_REPLIES[3];
  return pool[Math.floor(Math.random() * pool.length)];
}

function renderStars(n, clickable) {
  return [1, 2, 3, 4, 5].map((i) =>
    `<span class="star ${i <= n ? 'on' : ''} ${clickable ? 'clickable' : ''}" ${clickable ? `onclick="setReviewStar(${i})"` : ''}>${i <= n ? '★' : '☆'}</span>`
  ).join('');
}

function reviewBlockHtml(o) {
  const r = getOrderReview(o.time);
  if (!r) {
    return `
      <div class="card review-pending-card">
        <div class="pay-title">订单评价</div>
        <div class="review-pending-sub">这单还没评价，说说假装点餐的体验吧</div>
        <button class="review-open-btn" onclick="openReviewModal(${o.time})">⭐ 去打分评论</button>
      </div>
    `;
  }
  return `
    <div class="card review-done-card">
      <div class="pay-title">我的评价</div>
      <div class="review-stars-display">${renderStars(r.stars, false)}</div>
      <div class="review-user-text">${r.text || '用户什么也没说，但星星会说话'}</div>
      <div class="review-time">${formatReviewTime(r.time)}</div>
      ${r.merchantReply ? `
        <div class="merchant-reply">
          <div class="merchant-reply-head">${o.restEmoji} ${o.restName} <span>商家回复</span></div>
          <div class="merchant-reply-text">${r.merchantReply}</div>
          <div class="review-time">${formatReviewTime(r.replyTime)}</div>
        </div>
      ` : ''}
    </div>
  `;
}

function formatReviewTime(ts) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function openReviewModal(orderTime) {
  const o = getOrders().find((x) => x.time === orderTime);
  if (!o) return;
  if (getOrderReview(orderTime)) {
    toast('这单已经评价过了');
    openOrderDetail(orderTime);
    return;
  }
  reviewingOrderTime = orderTime;
  reviewStars = 5;
  $('review-rest').textContent = `${o.restEmoji} ${o.restName}`;
  $('review-text').value = '';
  updateReviewStarsUI();
  document.body.style.overflow = 'hidden';
  $('review-modal').classList.add('open');
}

function closeReviewModal() {
  $('review-modal').classList.remove('open');
  document.body.style.overflow = '';
  reviewingOrderTime = null;
  reviewStars = 0;
}

function setReviewStar(n) {
  reviewStars = n;
  updateReviewStarsUI();
}

function updateReviewStarsUI() {
  $('review-stars').innerHTML = renderStars(reviewStars, true);
  $('review-star-hint').textContent = reviewStars ? STAR_HINTS[reviewStars] : '点击星星打分';
}

function submitReview() {
  if (!reviewingOrderTime) return;
  if (!reviewStars) {
    toast('先打个分吧 ⭐');
    return;
  }
  const text = $('review-text').value.trim();
  const now = Date.now();
  const reply = pickMerchantReply(reviewStars);
  const orderTime = reviewingOrderTime;
  saveReview(orderTime, {
    stars: reviewStars,
    text,
    time: now,
    merchantReply: reply,
    replyTime: now + 1200,
  });
  closeReviewModal();
  toast('评价成功！商家回复了您的评价 🏪');
  if ($('page-order-detail').classList.contains('active')) {
    openOrderDetail(orderTime);
  } else if ($('page-orders').classList.contains('active')) {
    renderOrdersPage();
  }
  if ($('page-restaurant').classList.contains('active') && currentRestaurant) {
    renderRestReviews();
  }
}

function reorder(time) {
  const o = getOrders().find((x) => x.time === time);
  if (!o) {
    toast('这单太古老了，商家已经找不到了 😿');
    return;
  }
  const type = o.orderType || 'delivery';
  if (type === 'leisure') {
    if (!o.restId) {
      toast('这单太古老了，商家已经找不到了 😿');
      return;
    }
    toast('休闲订单请重新下单选套餐 🎫');
    openRestaurant(o.restId);
    return;
  }
  if (type === 'mall') {
    cartType = 'mall';
    cartContexts.mall = { stores: {} };
    const sources = o.mallStores || (o.restId ? [{ restId: o.restId, items: o.items || [] }] : []);
    if (!sources.length) {
      toast('这单太古老了，商品已经找不到了 😿');
      return;
    }
    sources.forEach((s) => {
      if (!s.restId || !findStore(s.restId)) return;
      cartContexts.mall.stores[s.restId] = {
        items: Object.fromEntries((s.items || []).map((it) => [it.id, it.count])),
        itemPrices: Object.fromEntries((s.items || []).filter((it) => it.price != null).map((it) => [it.id, it.price])),
      };
    });
    openRestaurant(sources[0].restId);
    syncCartFromContext('mall');
    renderMenu();
    updateCartBar();
    persistAllCarts();
    toast('已按上次的口味帮你加好购物车 😋');
    return;
  }
  if (!o.restId) {
    toast('这单太古老了，商家已经找不到了 😿');
    return;
  }
  openRestaurant(o.restId);
  if (o.items) {
    cart = {};
    itemPrices = {};
    if (type === 'delivery') dailyGrab = null;
    o.items.forEach((it) => {
      if (findDish(it.id)) cart[it.id] = it.count;
    });
    syncContextFromCart();
    renderMenu();
    updateCartBar();
    persistAllCarts();
  }
  toast('已按上次的口味帮你加好购物车 😋');
}

function fakeOrderSearch() {
  toast('搜什么搜，每一单都是寂寞 🔍');
}

// ===== 登录 =====
function openLogin() {
  const picker = $('avatar-picker');
  picker.innerHTML = AVATARS.map((a) => `
    <div class="avatar-opt ${a === selectedAvatar ? 'selected' : ''}" onclick="pickAvatar('${a}', this)">${a}</div>
  `).join('');
  $('nick-input').value = '';
  $('pwd-input').value = '';
  $('login-modal').classList.add('open');
}

function pickAvatar(avatar, el) {
  selectedAvatar = avatar;
  document.querySelectorAll('.avatar-opt').forEach((o) => o.classList.remove('selected'));
  el.classList.add('selected');
}

function closeLogin() {
  $('login-modal').classList.remove('open');
}

function doLogin() {
  const name = $('nick-input').value.trim();
  const password = $('pwd-input').value;

  if (!name) {
    toast('请输入昵称');
    return;
  }
  if (password.length < 4) {
    toast('密码至少4位');
    return;
  }

  const registry = getUsersRegistry();
  const existing = findUserByName(name);

  if (existing) {
    if (existing.password !== password) {
      toast('密码不对，再想想？');
      return;
    }
    localStorage.setItem(USER_KEY, JSON.stringify({
      userId: existing.userId,
      name: existing.name,
      avatar: existing.avatar,
    }));
    closeLogin();
    updateUserChip();
    ensureDefaultAddresses();
    updateHomeLocation();
    renderProfile();
    toast(`欢迎回来，${name}！`);
    return;
  }

  const userId = genId('U');
  const newUser = { userId, name, password, avatar: selectedAvatar, createdAt: Date.now() };
  registry.push(newUser);
  saveUsersRegistry(registry);
  localStorage.setItem(USER_KEY, JSON.stringify({ userId, name, avatar: selectedAvatar }));
  closeLogin();
  updateUserChip();
  ensureDefaultAddresses();
  updateHomeLocation();
  renderProfile();
  toast(`注册成功！你的用户 ID：${userId}`);
}

function logout() {
  localStorage.removeItem(USER_KEY);
  updateUserChip();
  ensureDefaultAddresses();
  updateHomeLocation();
  renderProfile();
  toast('已退出，当前为游客模式');
}

// ===== toast =====
let toastTimer = null;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
}

// ===== 启动 =====
ensureGuest();
migrateLegacyData();
ensureDefaultAddresses();
updateFilterPills();
renderHome();
updateDailyPromoCard();
updateUserChip();
updateHomeLocation();
loadAllCarts();
restoreMallShipState();
restoreActiveDeliveries();
showPage('page-home');
