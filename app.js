const products = [...document.querySelectorAll('.product-card')].map(card => ({
  id: card.dataset.id,
  category: card.dataset.category,
  name: card.dataset.name,
  price: Number(card.dataset.price),
  image: card.dataset.image,
  description: card.dataset.description,
  card
}));

const state = { cart: {}, favorites: new Set(), activeFilter: 'all', query: '', quickProduct: null, quickQuantity: 1 };
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
let toastTimer;

function money(value) { return `$${value.toFixed(2)}`; }
function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}
function lockPage(locked) { document.body.classList.toggle('lock', locked); }

// Mobile navigation
const menuToggle = $('.menu-toggle');
menuToggle.addEventListener('click', () => {
  const open = $('#main-nav').classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
$('#main-nav').addEventListener('click', e => {
  if (e.target.matches('a')) {
    $('#main-nav').classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
});

// Product filtering and sorting
function applyProducts() {
  const query = state.query.toLowerCase();
  let visible = products.filter(product => {
    const categoryMatch = state.activeFilter === 'all' || product.category === state.activeFilter;
    const queryMatch = !query || `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(query);
    return categoryMatch && queryMatch;
  });
  const sort = $('#sort').value;
  visible.sort((a, b) => sort === 'price-low' ? a.price - b.price : sort === 'price-high' ? b.price - a.price : sort === 'name' ? a.name.localeCompare(b.name) : products.indexOf(a) - products.indexOf(b));
  const grid = $('#product-grid');
  visible.forEach(product => grid.appendChild(product.card));
  products.forEach(product => product.card.hidden = !visible.includes(product));
  $('#empty-products').hidden = visible.length > 0;
  const filterBox = $('#active-filter');
  filterBox.hidden = state.activeFilter === 'all' && !state.query;
  filterBox.querySelector('span').textContent = state.query ? `Results for “${state.query}”` : `Showing ${state.activeFilter}`;
}

$$('.category-bar button').forEach(button => button.addEventListener('click', () => {
  state.activeFilter = button.dataset.category;
  state.query = '';
  $$('.category-bar button').forEach(item => item.classList.toggle('active', item === button));
  applyProducts();
  $('#products').scrollIntoView({ behavior: 'smooth' });
}));
$('#sort').addEventListener('change', applyProducts);
$('#view-all').addEventListener('click', resetProducts);
$('#active-filter button').addEventListener('click', resetProducts);
$('#empty-products button').addEventListener('click', resetProducts);
function resetProducts() {
  state.activeFilter = 'all'; state.query = '';
  $$('.category-bar button').forEach(item => item.classList.remove('active'));
  applyProducts();
}

// Favorites
$$('.favorite').forEach(button => button.addEventListener('click', () => {
  const product = products.find(item => item.card === button.closest('.product-card'));
  state.favorites.has(product.id) ? state.favorites.delete(product.id) : state.favorites.add(product.id);
  const active = state.favorites.has(product.id);
  button.classList.toggle('active', active);
  button.textContent = active ? '♥' : '♡';
  button.setAttribute('aria-pressed', String(active));
  $('#favorite-count').textContent = state.favorites.size;
  toast(active ? `${product.name} saved` : `${product.name} removed`);
}));
$('#favorites-button').addEventListener('click', () => toast(state.favorites.size ? `${state.favorites.size} saved item${state.favorites.size > 1 ? 's' : ''}` : 'No saved products yet'));

// Cart drawer
function cartEntries() { return Object.entries(state.cart).filter(([, qty]) => qty > 0); }
function addToCart(product, quantity = 1) {
  state.cart[product.id] = (state.cart[product.id] || 0) + quantity;
  renderCart();
  toast(`${product.name} added to your bag`);
}
function cartQuantity() { return cartEntries().reduce((sum, [, qty]) => sum + qty, 0); }
function cartTotal() { return cartEntries().reduce((sum, [id, qty]) => sum + products.find(p => p.id === id).price * qty, 0); }
function renderCart() {
  const entries = cartEntries();
  const container = $('#cart-items');
  container.innerHTML = entries.map(([id, qty]) => {
    const product = products.find(p => p.id === id);
    return `<article class="cart-item" data-id="${id}"><img src="${product.image}" alt="${product.name}"><div><h3>${product.name}</h3><strong>${money(product.price)}</strong><div class="item-qty"><button type="button" data-action="minus" aria-label="Decrease ${product.name}">−</button><span>${qty}</span><button type="button" data-action="plus" aria-label="Increase ${product.name}">+</button></div></div><button class="remove-item" data-action="remove" type="button">Remove</button></article>`;
  }).join('');
  const total = cartTotal();
  $('#cart-count').textContent = cartQuantity();
  $('#cart-empty').hidden = entries.length > 0;
  $('#cart-footer').hidden = entries.length === 0;
  $('#cart-total').textContent = money(total);
  const remaining = Math.max(0, 75 - total);
  $('#shipping-message').textContent = remaining ? `You're ${money(remaining)} away from free shipping.` : 'You unlocked free shipping!';
  $('#shipping-bar').style.width = `${Math.min(100, total / 75 * 100)}%`;
}
$('#cart-items').addEventListener('click', e => {
  const button = e.target.closest('button'); if (!button) return;
  const id = button.closest('.cart-item').dataset.id;
  if (button.dataset.action === 'plus') state.cart[id] += 1;
  if (button.dataset.action === 'minus') state.cart[id] = Math.max(0, state.cart[id] - 1);
  if (button.dataset.action === 'remove') state.cart[id] = 0;
  renderCart();
});
$$('.quick-add').forEach(button => button.addEventListener('click', () => addToCart(products.find(p => p.card === button.closest('.product-card')))));
function openCart() { $('#drawer-backdrop').hidden = false; $('#cart-drawer').classList.add('open'); $('#cart-drawer').setAttribute('aria-hidden', 'false'); lockPage(true); $('#cart-close').focus(); }
function closeCart() { $('#drawer-backdrop').hidden = true; $('#cart-drawer').classList.remove('open'); $('#cart-drawer').setAttribute('aria-hidden', 'true'); lockPage(false); $('#cart-open').focus(); }
$('#cart-open').addEventListener('click', openCart);
$('#cart-close').addEventListener('click', closeCart);
$('#drawer-backdrop').addEventListener('click', closeCart);
$('#continue-shopping').addEventListener('click', closeCart);
$('.checkout').addEventListener('click', () => toast('Checkout is ready for backend integration'));

// Search dialog
function renderSearchResults(query) {
  const matches = products.filter(p => `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(query.toLowerCase()));
  $('#search-results').innerHTML = query ? (matches.length ? matches.map(p => `<button class="search-result" type="button" data-id="${p.id}"><img src="${p.image}" alt=""><span><b>${p.name}</b><small>${money(p.price)}</small></span></button>`).join('') : '<div class="no-results">No results. Try serum, cleanser or SPF.</div>') : '';
}
$('#search-open').addEventListener('click', () => { $('#search-dialog').showModal(); lockPage(true); setTimeout(() => $('#search-input').focus(), 0); });
$('#search-close').addEventListener('click', () => $('#search-dialog').close());
$('#search-dialog').addEventListener('close', () => lockPage(false));
$('#search-input').addEventListener('input', e => renderSearchResults(e.target.value.trim()));
$('#search-form').addEventListener('submit', e => { e.preventDefault(); state.query = $('#search-input').value.trim(); state.activeFilter = 'all'; $('#search-dialog').close(); applyProducts(); $('#products').scrollIntoView({ behavior: 'smooth' }); });
$$('.search-suggestions button').forEach(button => button.addEventListener('click', () => { $('#search-input').value = button.textContent; renderSearchResults(button.textContent); }));
$('#search-results').addEventListener('click', e => { const result = e.target.closest('.search-result'); if (!result) return; const product = products.find(p => p.id === result.dataset.id); $('#search-dialog').close(); openQuickView(product); });

// Quick view
function openQuickView(product) {
  state.quickProduct = product; state.quickQuantity = 1;
  $('#quick-image').src = product.image; $('#quick-image').alt = product.name;
  $('#quick-name').textContent = product.name; $('#quick-description').textContent = product.description;
  $('#quick-price').textContent = money(product.price); $('#quick-quantity').textContent = '1';
  $('#quick-dialog').showModal(); lockPage(true);
}
$$('.quick-view').forEach(button => button.addEventListener('click', () => openQuickView(products.find(p => p.card === button.closest('.product-card')))));
$('#quick-close').addEventListener('click', () => $('#quick-dialog').close());
$('#quick-dialog').addEventListener('close', () => lockPage(false));
$('#quick-minus').addEventListener('click', () => { state.quickQuantity = Math.max(1, state.quickQuantity - 1); $('#quick-quantity').textContent = state.quickQuantity; });
$('#quick-plus').addEventListener('click', () => { state.quickQuantity += 1; $('#quick-quantity').textContent = state.quickQuantity; });
$('#quick-add').addEventListener('click', () => { addToCart(state.quickProduct, state.quickQuantity); $('#quick-dialog').close(); openCart(); });

// Newsletter
$('#newsletter-form').addEventListener('submit', e => { e.preventDefault(); const email = new FormData(e.currentTarget).get('email'); $('#newsletter-status').textContent = `Welcome to Aura, ${email}. Your 15% code is on the way.`; e.currentTarget.reset(); });

// Close interactive layers with Escape
window.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#cart-drawer').classList.contains('open')) closeCart(); });

// Reveal animation
const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: .08 });
$$('.reveal').forEach(el => observer.observe(el));

renderCart();
applyProducts();
