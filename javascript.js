// ==========================================
// KD Tiffin Service — Order Logic
// ==========================================

// Global State: cart is a map of items keyed by name, each with qty
let cart = {}; // { "Veg Standard Thali": { price: 120, qty: 2 }, ... }

// DOM Elements
const cartCountEl = document.getElementById('cart-count');
const cartTotalEl = document.getElementById('cart-total');
const greetingEl = document.getElementById('time-greeting');
const checkoutModal = document.getElementById('checkout-modal');
const orderSummaryEl = document.getElementById('order-summary');
const orderViewEl = document.getElementById('order-view');
const orderSuccessEl = document.getElementById('order-success');

// 1. Dynamic Greeting based on time of day
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

// 3. Add Item to Cart (merges quantity if item already present)
function addToCart(itemName, price, btnEl) {
    if (cart[itemName]) {
        cart[itemName].qty += 1;
    } else {
        cart[itemName] = { price, qty: 1 };
    }
    updateCartUI();
    showNotification(`Added ${itemName} — ₹${price}`);

    if (btnEl) {
        const original = btnEl.textContent;
        btnEl.textContent = "✓ Added";
        btnEl.classList.add('added');
        setTimeout(() => {
            btnEl.textContent = original;
            btnEl.classList.remove('added');
        }, 900);
    }
}

// 4. Remove one item line entirely from the cart
function removeFromCart(itemName) {
    delete cart[itemName];
    updateCartUI();
    renderOrderSummary();
}

// 5. Update Cart Badge and Total Display
function updateCartUI() {
    cartCountEl.textContent = cartCount();
    cartTotalEl.textContent = cartTotal();
}

// 6. Toast Notification
function showNotification(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2200);
}

// 7. Render itemized order summary inside the modal
function renderOrderSummary() {
    const entries = Object.entries(cart);

    if (entries.length === 0) {
        orderSummaryEl.innerHTML = `<p style="color:var(--ink-soft); font-size:0.9rem;">Your order is empty.</p>`;
        return;
    }

    let rows = entries.map(([name, item]) => `
        <div class="order-line">
            <span class="line-name">${name}</span>
            <span class="line-qty">×${item.qty}</span>
            <span class="line-price">₹${item.price * item.qty}</span>
            <button type="button" class="remove-line" onclick="removeFromCart('${name.replace(/'/g, "\\'")}')">remove</button>
        </div>
    `).join('');

    rows += `<div class="order-total-row"><span>Total</span><span>₹${cartTotal()}</span></div>`;
    orderSummaryEl.innerHTML = rows;
}

// 8. Modal Open / Close Logic
function openCheckout() {
    if (cartCount() === 0) {
        showNotification("Your order is empty — add a tiffin plan first.");
        return;
    }
    orderViewEl.style.display = "block";
    orderSuccessEl.classList.remove('show');
    renderOrderSummary();
    checkoutModal.style.display = "flex";
}

function closeCheckout() {
    checkoutModal.style.display = "none";
}

// 9. Inline field validation (no alert())
function setFieldError(inputId, errorId, isValid) {
    const errorEl = document.getElementById(errorId);
    errorEl.classList.toggle('show', !isValid);
}

// 10. Handle Order Form Submission
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
        return;
    }

    const total = cartTotal();

    // Show inline success state instead of a browser alert
    document.getElementById('success-name').textContent = name;
    document.getElementById('success-detail').textContent =
        `Total ₹${total} will be delivered to: ${address}. We'll call ${phone} to confirm the timing.`;

    orderViewEl.style.display = "none";
    orderSuccessEl.classList.add('show');

    // Reset state for the next order
    cart = {};
    updateCartUI();
    document.getElementById('order-form').reset();
}

// Initialize Page Features
document.addEventListener('DOMContentLoaded', () => {
    updateTimeGreeting();
});