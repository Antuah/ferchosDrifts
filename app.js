// Product Database matching Screen 1 details
const PRODUCTS = [
  {
    id: 'skyline-r34',
    name: 'Nissan Skyline GT-R R34',
    category: 'jdm',
    scale: '1:64',
    price: 189,
    stock: 3,
    image: 'assets/skyline_r34.jpg',
    badgeText: '3 disponibles',
    badgeClass: 'available'
  },
  {
    id: 'porsche-gt3',
    name: 'Porsche 911 GT3 RS',
    category: 'deportivos',
    scale: '1:64',
    price: 145,
    stock: 12,
    image: 'assets/porsche_gt3.jpg',
    badgeText: '12 disponibles',
    badgeClass: 'available'
  },
  {
    id: 'mustang-67',
    name: "'67 Ford Mustang",
    category: 'clasicos',
    scale: '1:64',
    price: 99,
    stock: 0,
    image: 'assets/mustang_67.jpg',
    badgeText: 'Agotado',
    badgeClass: 'empty'
  },
  {
    id: 'countach',
    name: 'Lamborghini Countach',
    category: 'ediciones',
    scale: '1:64',
    price: 210,
    stock: 5,
    image: 'assets/countach.jpg',
    badgeText: '5 disponibles',
    badgeClass: 'available'
  },
  {
    id: 'supra-mk4',
    name: 'Toyota Supra MK4',
    category: 'jdm',
    scale: '1:64',
    price: 175,
    stock: 8,
    image: 'assets/supra_mk4.jpg',
    badgeText: '8 disponibles',
    badgeClass: 'available'
  },
  {
    id: 'track-loop',
    name: 'Set Pista Loop Extremo',
    category: 'pistas',
    scale: 'N/A',
    price: 320,
    stock: 2,
    image: 'assets/track_loop.jpg',
    badgeText: '¡Solo 2!',
    badgeClass: 'low'
  },
  {
    id: 'vw-beetle',
    name: 'VW Beetle Custom',
    category: 'clasicos',
    scale: '1:43',
    price: 85,
    stock: 24,
    image: 'assets/vw_beetle.jpg',
    badgeText: '24 disponibles',
    badgeClass: 'available'
  },
  {
    id: 'mclaren-senna',
    name: 'McLaren Senna',
    category: 'deportivos',
    scale: '1:64',
    price: 160,
    stock: 1,
    image: 'assets/mclaren_senna.jpg',
    badgeText: '¡Última pieza!',
    badgeClass: 'low'
  }
];

// App State
let cart = [];
let currentView = 'catalog';
let selectedCategory = 'all';
let userEmail = '';
let orderReference = '';
let searchQuery = '';

const SHIPPING_COST = 90;
const WHATSAPP_NUMBER = '5215548274827'; // Mock phone for WhatsApp API redirection

// Initial Mock Cart Populate matching Screen 2 (3 items: 1 Skyline, 2 Supra, 1 VW Beetle)
function initializeMockCart() {
  cart = [
    { productId: 'skyline-r34', quantity: 1 },
    { productId: 'supra-mk4', quantity: 2 },
    { productId: 'vw-beetle', quantity: 1 }
  ];
  updateCartBadge();
}

// Helper to generate a unique random order reference code
function generateOrderReference() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `FSD-${num}`;
}

// Toast Notifications Helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'success' ? 'success' : ''}`;
  
  // Icon
  let icon = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  `;
  if (type === 'success') {
    icon = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18" style="stroke: var(--accent-green)">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    `;
  }
  
  toast.innerHTML = `${icon}<span>${message}</span>`;
  container.appendChild(toast);
  
  // Fade out and remove
  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3000);
}

// Switch between views
function switchView(viewId) {
  // Hide all views
  document.querySelectorAll('.view-container').forEach(el => {
    el.classList.remove('active');
  });
  
  // Resolve view DOM ID (append -view if not present)
  const domId = viewId.endsWith('-view') ? viewId : `${viewId}-view`;
  
  // Show active view
  let targetView = document.getElementById(domId);
  if (!targetView) {
    console.warn(`La vista "${domId}" no existe. Mostrando catálogo por defecto.`);
    showToast('Esta función estará disponible próximamente', 'info');
    targetView = document.getElementById('catalog-view');
    viewId = 'catalog';
  }
  
  if (targetView) {
    targetView.classList.add('active');
    currentView = viewId;
    window.scrollTo(0, 0);
  }
  
  // Run post-load operations per view
  if (viewId === 'catalog') {
    renderCatalog();
  } else if (viewId === 'cart') {
    renderCart();
  } else if (viewId === 'checkout-email') {
    renderCheckoutEmail();
  } else if (viewId === 'checkout-payment') {
    renderCheckoutPayment();
  } else if (viewId === 'checkout-whatsapp') {
    renderCheckoutWhatsapp();
  }
}

// Update Cart Badge Count in Header
function updateCartBadge() {
  const badge = document.getElementById('cart-badge-count');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = totalItems;
}

// Render Products Grid in Catalog View
function renderCatalog() {
  const container = document.getElementById('product-grid-container');
  container.innerHTML = '';
  
  // Filter products by search and category
  const filtered = PRODUCTS.filter(prod => {
    const matchesCategory = selectedCategory === 'all' || prod.category === selectedCategory;
    const matchesSearch = searchQuery === '' || prod.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  // Update section title & count label
  const sectionTitle = document.getElementById('catalog-section-title');
  const countLabel = document.getElementById('catalog-count-label');
  
  if (searchQuery !== '') {
    sectionTitle.textContent = `Resultados para "${searchQuery}"`;
  } else {
    const activeChipText = document.querySelector(`.category-chip[data-category="${selectedCategory}"]`).textContent;
    sectionTitle.textContent = activeChipText === 'Novedades' ? 'Novedades de la semana' : activeChipText;
  }
  
  countLabel.textContent = `${filtered.length} productos · escala 1:64 y 1:43`;
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 24px; color: var(--text-muted);">
        <p style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">No se encontraron productos</p>
        <p style="font-size: 14px;">Prueba buscando otra cosa o limpia los filtros.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(product => {
    const isOutOfStock = product.stock === 0;
    const card = document.createElement('div');
    card.className = 'product-card';
    
    card.innerHTML = `
      <div class="product-image-container">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
      </div>
      <div class="product-info">
        <div class="product-meta-row">
          <span class="product-category-tag">${product.category}</span>
          <span class="stock-badge ${product.badgeClass}">${product.badgeText}</span>
        </div>
        <h3 class="product-title">${product.name}</h3>
        <div class="product-price-row">
          <span class="product-price">$${product.price}</span>
          <div style="width: 140px;">
            ${isOutOfStock ? `
              <button class="btn btn-secondary" onclick="showNotifyMe('${product.name}')">Avísame</button>
            ` : `
              <button class="btn btn-primary" onclick="addToCart('${product.id}')">Agregar al carrito</button>
            `}
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function showNotifyMe(productName) {
  showToast(`Te avisaremos cuando llegue "${productName}"`, 'success');
}

// Add Item to Cart
function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  
  const existing = cart.find(item => item.productId === productId);
  
  if (existing) {
    if (existing.quantity >= product.stock) {
      showToast(`Lo sentimos, solo hay ${product.stock} disponibles de este producto.`, 'info');
      return;
    }
    existing.quantity++;
  } else {
    cart.push({ productId, quantity: 1 });
  }
  
  updateCartBadge();
  showToast(`"${product.name}" agregado al carrito`, 'success');
}

// Calculate Cart Totals
function getCartTotals() {
  let subtotal = 0;
  cart.forEach(item => {
    const product = PRODUCTS.find(p => p.id === item.productId);
    if (product) {
      subtotal += product.price * item.quantity;
    }
  });
  
  const shipping = subtotal > 0 ? SHIPPING_COST : 0;
  const total = subtotal + shipping;
  
  return { subtotal, shipping, total };
}

// Render Cart View
function renderCart() {
  const itemsContainer = document.getElementById('cart-items-list');
  const titleCount = document.getElementById('cart-title-count');
  
  const totals = getCartTotals();
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  titleCount.textContent = `· ${totalQuantity} ${totalQuantity === 1 ? 'producto' : 'productos'}`;
  
  itemsContainer.innerHTML = '';
  
  if (cart.length === 0) {
    itemsContainer.innerHTML = `
      <div style="text-align: center; padding: 48px 24px; background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: 16px;">
        <p style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: var(--text-secondary);">Tu carrito está vacío</p>
        <button class="btn btn-primary" onclick="switchView('catalog')" style="width: auto;">Volver a la tienda</button>
      </div>
    `;
    
    // Disable checkout button
    document.getElementById('cart-checkout-btn').classList.add('btn-disabled');
    document.getElementById('cart-checkout-btn').disabled = true;
  } else {
    // Enable checkout button
    document.getElementById('cart-checkout-btn').classList.remove('btn-disabled');
    document.getElementById('cart-checkout-btn').disabled = false;

    cart.forEach(item => {
      const product = PRODUCTS.find(p => p.id === item.productId);
      if (!product) return;
      
      const itemTotal = product.price * item.quantity;
      const isMaxStock = item.quantity >= product.stock;
      
      const card = document.createElement('div');
      card.className = 'cart-item-card';
      card.innerHTML = `
        <div class="cart-item-image">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="cart-item-details">
          <h3 class="cart-item-name">${product.name}</h3>
          <div class="cart-item-meta">${product.category.toUpperCase()} · Escala ${product.scale}</div>
          <span class="cart-item-stock-warning ${product.stock <= 3 ? 'low' : ''}">
            ${product.stock <= 3 ? `Quedan ${product.stock}` : `${product.stock} disponibles`}
          </span>
        </div>
        <div class="qty-controller">
          <button class="qty-btn" onclick="changeCartItemQty('${product.id}', -1)">-</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" onclick="changeCartItemQty('${product.id}', 1)" ${isMaxStock ? 'disabled' : ''}>+</button>
        </div>
        <div class="cart-item-price">$${itemTotal}</div>
      `;
      itemsContainer.appendChild(card);
    });
  }
  
  // Render Summary Prices
  document.getElementById('cart-summary-subtotal').textContent = `$${totals.subtotal}`;
  document.getElementById('cart-summary-shipping').textContent = `$${totals.shipping}`;
  document.getElementById('cart-summary-total').textContent = `$${totals.total}`;
}

// Adjust Item Qty in Cart
window.changeCartItemQty = function(productId, delta) {
  const item = cart.find(i => i.productId === productId);
  if (!item) return;
  
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  
  const newQty = item.quantity + delta;
  
  if (newQty <= 0) {
    // Remove item
    cart = cart.filter(i => i.productId !== productId);
    showToast(`"${product.name}" eliminado del carrito`, 'info');
  } else if (newQty > product.stock) {
    showToast(`Stock máximo alcanzado para "${product.name}"`, 'info');
  } else {
    item.quantity = newQty;
  }
  
  updateCartBadge();
  renderCart();
};

// Render Order Summary in Checkout Pages
function renderOrderSummary(subtotalId, shippingId, totalId, listId) {
  const totals = getCartTotals();
  document.getElementById(subtotalId).textContent = `$${totals.subtotal}`;
  document.getElementById(shippingId).textContent = `$${totals.shipping}`;
  document.getElementById(totalId).textContent = `$${totals.total}`;
  
  const listContainer = document.getElementById(listId);
  listContainer.innerHTML = '';
  
  cart.forEach(item => {
    const product = PRODUCTS.find(p => p.id === item.productId);
    if (!product) return;
    
    const row = document.createElement('div');
    row.className = 'mini-order-item';
    row.innerHTML = `
      <div>
        <span class="mini-item-name">${product.name}</span>
        <span class="mini-item-qty">x${item.quantity}</span>
      </div>
      <span class="mini-item-price">$${product.price * item.quantity}</span>
    `;
    listContainer.appendChild(row);
  });
}

// Checkout Step 1 Rendering
function renderCheckoutEmail() {
  renderOrderSummary(
    'checkout-email-subtotal',
    'checkout-email-shipping',
    'checkout-email-total',
    'mini-order-list-email'
  );
  
  // Set saved email if any
  if (userEmail) {
    document.getElementById('checkout-email-input').value = userEmail;
  }
}

// Checkout Step 2 Rendering
function renderCheckoutPayment() {
  const totals = getCartTotals();
  document.getElementById('payment-widget-total').textContent = `$${totals.total}`;
  
  if (!orderReference) {
    orderReference = generateOrderReference();
  }
  document.getElementById('payment-widget-ref').textContent = orderReference;
  
  renderOrderSummary(
    'checkout-payment-subtotal',
    'checkout-payment-shipping',
    'checkout-payment-total',
    'mini-order-list-payment'
  );
  
  // Reset copy buttons classes
  document.getElementById('btn-copy-clabe').classList.remove('copied');
  document.getElementById('btn-copy-clabe').textContent = 'Copiar';
  document.getElementById('btn-copy-acc').classList.remove('copied');
  document.getElementById('btn-copy-acc').textContent = 'Copiar';
}

// Checkout Step 3 Rendering
function renderCheckoutWhatsapp() {
  const totals = getCartTotals();
  document.getElementById('whatsapp-alert-ref').textContent = `Al confirmar, tu pedido pasa a revisión. Te avisamos por correo cuando sea aprobado. Referencia ${orderReference}.`;
  
  // Build WhatsApp URL
  const waMessage = `Hola Fercho's Drift, acabo de realizar mi transferencia para mi pedido con referencia ${orderReference}.\n\nDetalles:\n- Correo: ${userEmail}\n- Total a transferir: $${totals.total} MXN.\n\nAdjunto comprobante de pago.`;
  const encodedMsg = encodeURIComponent(waMessage);
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMsg}`;
  
  const waBtn = document.getElementById('btn-open-whatsapp');
  waBtn.href = waUrl;
}

// Clipboard Copy Helper
function copyTextToClipboard(text, buttonElement) {
  navigator.clipboard.writeText(text).then(() => {
    buttonElement.textContent = '¡Copiado!';
    buttonElement.classList.add('copied');
    showToast('Copiado al portapapeles', 'success');
    
    setTimeout(() => {
      buttonElement.textContent = 'Copiar';
      buttonElement.classList.remove('copied');
    }, 2000);
  }).catch(err => {
    console.error('Error al copiar al portapapeles: ', err);
    showToast('Error al copiar al portapapeles', 'error');
  });
}

// Event Bindings and Setup
document.addEventListener('DOMContentLoaded', () => {
  // Pre-fill mock data for trial purposes
  initializeMockCart();
  
  // Initial Catalog render
  renderCatalog();
  
  // Navigation Logo and Header Links
  document.getElementById('logo-nav').addEventListener('click', () => {
    selectedCategory = 'all';
    // Clear chips selection
    document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
    document.querySelector('.category-chip[data-category="all"]').classList.add('active');
    searchQuery = '';
    document.getElementById('search-input').value = '';
    switchView('catalog');
  });
  
  document.getElementById('header-cart-btn').addEventListener('click', () => {
    switchView('cart');
  });
  
  document.getElementById('help-btn').addEventListener('click', () => {
    showToast('Centro de Ayuda: Escríbenos por WhatsApp para resolver dudas rápidas sobre escalas o envíos.', 'info');
  });
  
  document.getElementById('account-btn').addEventListener('click', () => {
    showToast('No es necesario crear una cuenta. Realiza tu compra directa y te avisamos por correo electrónico.', 'info');
  });
  
  // Categories Filter Chips
  document.querySelectorAll('.category-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedCategory = chip.getAttribute('data-category');
      switchView('catalog');
    });
  });
  
  // Search Input Handler
  document.getElementById('search-input').addEventListener('input', (e) => {
    searchQuery = e.target.value;
    // Go to catalog if not there
    if (currentView !== 'catalog') {
      switchView('catalog');
    } else {
      renderCatalog();
    }
  });
  
  // Cart Actions
  document.getElementById('cart-back-btn').addEventListener('click', () => {
    switchView('catalog');
  });
  
  document.getElementById('cart-checkout-btn').addEventListener('click', () => {
    switchView('checkout-email');
  });
  
  // Checkout Email Actions
  document.getElementById('checkout-email-back').addEventListener('click', () => {
    switchView('cart');
  });
  
  document.getElementById('email-form').addEventListener('submit', (e) => {
    e.preventDefault();
    userEmail = document.getElementById('checkout-email-input').value;
    if (userEmail) {
      switchView('checkout-payment');
    }
  });
  
  // Checkout Payment Actions
  document.getElementById('checkout-payment-back').addEventListener('click', () => {
    switchView('checkout-email');
  });
  
  document.getElementById('btn-copy-clabe').addEventListener('click', (e) => {
    const clabe = e.target.getAttribute('data-copy');
    copyTextToClipboard(clabe, e.target);
  });
  
  document.getElementById('btn-copy-acc').addEventListener('click', (e) => {
    const acc = e.target.getAttribute('data-copy');
    copyTextToClipboard(acc, e.target);
  });
  
  document.getElementById('payment-submit-btn').addEventListener('click', () => {
    switchView('checkout-whatsapp');
  });
  
  // Checkout WhatsApp Actions
  document.getElementById('checkout-whatsapp-back').addEventListener('click', () => {
    switchView('checkout-payment');
  });
  
  document.getElementById('btn-confirm-sent').addEventListener('click', () => {
    // Show success view
    const totals = getCartTotals();
    document.getElementById('success-order-ref').textContent = orderReference;
    document.getElementById('success-order-email').textContent = userEmail;
    document.getElementById('success-order-total').textContent = `$${totals.total}`;
    
    switchView('order-success-view');
    showToast('Pedido confirmado con éxito', 'success');
  });
  
  // Success page action
  document.getElementById('success-home-btn').addEventListener('click', () => {
    // Reset state & empty cart
    cart = [];
    userEmail = '';
    orderReference = '';
    updateCartBadge();
    
    // Clear inputs
    document.getElementById('checkout-email-input').value = '';
    
    // Back to catalog
    switchView('catalog');
  });
});

// Expose functions globally for inline HTML onclick attributes
window.switchView = switchView;
window.addToCart = addToCart;
window.showNotifyMe = showNotifyMe;
