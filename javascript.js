// ==========================================
// KD Tiffin Service — Order Logic
// ==========================================

let cart = {}; // { "Veg Standard Thali": { price: 120, qty: 2 }, ... }

const cartCountEl = document.getElementById('cart-count');
const cartTotalEl = document.getElementById('cart-total');
const cartSrLabelEl = document.getElementById('cart-sr-label');
const greetingEl = document.getElementById('time-greeting');
const checkoutModal = document.getElementById('checkout-modal');
const orderSummaryEl = document.getElementById('order-summary');
const orderViewEl = document.getElementById('order-view');
const orderSuccessEl = document.getElementById('order-success');
const orderFormEl = document.getElementById('order-form');
const toastContainerEl = document.getElementById('toast-container');

let lastFocusedEl = null;

// Escape any dynamic text before it goes into innerHTML
function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[ch]));
}

// 1. Dynamic greeting based on time of day
function updateTimeGreeting() {
    const hour = new Date().getHours();
    if (hour < 11) {
        greetingEl.textContent = "🌅 Good morning! Order your fresh lunch tiffin before 11:00 AM.";
    } else if (hour < 17) {
        greetingEl.textContent = "☀️ Good afternoon! Planning dinner? Order your evening tiffin now.";
    } else {
        greetingEl.textContent = "🌙 Good evening! Place tomorrow's breakfast tiffin order tonight.";
    }
}

// 2. Cart totals
function cartCount() {
    return Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
}
function cartTotal() {
    return Object.values(cart).reduce((sum, item) => sum + item.price * item.qty, 0);
}

// 3. Add item to cart (merges quantity if already present)
function addToCart(itemName, price, btnEl) {
    if (cart[itemName]) {
        cart[itemName].qty += 1;
    } else {
        cart[itemName] = { price, qty: 1 };
    }
    updateCartUI();
    syncCardQuantities();
    showNotification(`Added ${itemName} — ₹${price}`);

    // Only run the flash animation on the full-size "Add" button,
    // not on the compact qty-stepper "+" control.
    if (btnEl && btnEl.classList.contains('add-btn')) {
        const original = btnEl.textContent;
        btnEl.disabled = true;
        btnEl.textContent = "✓ Added";
        btnEl.classList.add('added');
        setTimeout(() => {
            btnEl.textContent = original;
            btnEl.classList.remove('added');
            btnEl.disabled = false;
        }, 700);
    }
}

// 4. Decrease quantity of one item by one (removes the line at 0)
function decrementCartItem(itemName) {
    if (!cart[itemName]) return;
    cart[itemName].qty -= 1;
    if (cart[itemName].qty <= 0) delete cart[itemName];
    updateCartUI();
    renderOrderSummary();
    syncCardQuantities();

    if (checkoutModal.style.display === 'flex') {
        if (cartCount() === 0) closeCheckout();
    }
}

// 5. Remove one item line entirely from the cart
function removeFromCart(itemName) {
    delete cart[itemName];
    updateCartUI();
    renderOrderSummary();
    syncCardQuantities();

    if (cartCount() === 0) {
        closeCheckout();
    }
}

// 6. Update cart badge, total display and the accessible label
function updateCartUI() {
    const count = cartCount();
    const total = cartTotal();
    cartCountEl.textContent = count;
    cartTotalEl.textContent = total;
    if (cartSrLabelEl) {
        cartSrLabelEl.textContent = `View your order, currently ${count} item${count === 1 ? '' : 's'}, total ₹${total}`;
    }
}

// 7. Keep each product card's quantity stepper in sync with the cart
function syncCardQuantities() {
    document.querySelectorAll('.card[data-item]').forEach((card) => {
        const name = card.dataset.item;
        const qty = cart[name] ? cart[name].qty : 0;
        const valueEl = card.querySelector('.qty-value');
        const stepper = card.querySelector('.qty-stepper');

        if (valueEl) valueEl.textContent = qty;
        if (stepper) stepper.setAttribute('aria-label', `${name} quantity, ${qty} in order`);
        card.classList.toggle('has-qty', qty > 0);
    });
}

// 8. Toast notifications (stack in a fixed container instead of overlapping)
function showNotification(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toastContainerEl.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2200);
}

// 9. Render itemized order summary inside the modal
function renderOrderSummary() {
    const entries = Object.entries(cart);

    if (entries.length === 0) {
        orderSummaryEl.innerHTML = `<p style="color:var(--ink-soft); font-size:0.9rem;">Your order is empty.</p>`;
        return;
    }

    let rows = entries.map(([name, item]) => {
        const safeName = escapeHtml(name);
        const safeKey = name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        return `
        <div class="order-line">
            <span class="line-name">${safeName}</span>
            <span class="line-qty">×${item.qty}</span>
            <span class="line-price">₹${item.price * item.qty}</span>
            <button type="button" class="remove-line" onclick="removeFromCart('${safeKey}')" aria-label="Remove ${safeName} from order">remove</button>
        </div>
    `;
    }).join('');

    rows += `<div class="order-total-row"><span>Total</span><span>₹${cartTotal()}</span></div>`;
    orderSummaryEl.innerHTML = rows;
}

// 10. Modal open / close logic
function openCheckout() {
    if (cartCount() === 0) {
        showNotification("Your order is empty — add a tiffin plan first.");
        return;
    }
    lastFocusedEl = document.activeElement;

    orderViewEl.style.display = "block";
    orderSuccessEl.classList.remove('show');
    renderOrderSummary();
    checkoutModal.style.display = "flex";
    document.body.classList.add('modal-open');

    const firstField = document.getElementById('cust-name');
    if (firstField) firstField.focus();

    document.addEventListener('keydown', handleModalKeydown);
}

function closeCheckout() {
    checkoutModal.style.display = "none";
    document.body.classList.remove('modal-open');
    document.removeEventListener('keydown', handleModalKeydown);

    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
        lastFocusedEl.focus();
    }
}

function handleModalKeydown(event) {
    if (event.key === 'Escape') {
        closeCheckout();
        return;
    }

    if (event.key === 'Tab') {
        const focusable = Array.from(
            checkoutModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        ).filter((el) => el.offsetParent !== null); // only currently visible elements

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }
}

// Clicking the dimmed backdrop closes the modal, same as the × button
checkoutModal.addEventListener('click', (event) => {
    if (event.target === checkoutModal) {
        closeCheckout();
    }
});

// 11. Inline field validation (no alert())
function setFieldError(inputId, errorId, isValid) {
    const inputEl = document.getElementById(inputId);
    const errorEl = document.getElementById(errorId);
    errorEl.classList.toggle('show', !isValid);
    if (inputEl) inputEl.setAttribute('aria-invalid', String(!isValid));
}

// 12. Handle order form submission
function handleOrderSubmit(event) {
    event.preventDefault();

    const nameEl = document.getElementById('cust-name');
    const phoneEl = document.getElementById('cust-phone');
    const addressEl = document.getElementById('cust-address');

    const name = nameEl.value.trim();
    const phone = phoneEl.value.trim();
    const address = addressEl.value.trim();

    const nameValid = name.length > 0;
    const phoneValid = /^[0-9]{10}$/.test(phone);
    const addressValid = address.length > 0;

    setFieldError('cust-name', 'err-name', nameValid);
    setFieldError('cust-phone', 'err-phone', phoneValid);
    setFieldError('cust-address', 'err-address', addressValid);

    if (!nameValid || !phoneValid || !addressValid) {
        if (!nameValid) nameEl.focus();
        else if (!phoneValid) phoneEl.focus();
        else if (!addressValid) addressEl.focus();
        return;
    }

    const total = cartTotal();

    document.getElementById('success-name').textContent = name;
    document.getElementById('success-detail').textContent =
        `Total ₹${total} will be delivered to: ${address}. We'll call ${phone} to confirm the timing.`;

    orderViewEl.style.display = "none";
    orderSuccessEl.classList.add('show');

    // Reset state for the next order
    cart = {};
    updateCartUI();
    syncCardQuantities();
    orderFormEl.reset();
}

// Initialize page features
document.addEventListener('DOMContentLoaded', () => {
    updateTimeGreeting();
    updateCartUI();
    syncCardQuantities();
    setInterval(updateTimeGreeting, 5 * 60 * 1000);
});