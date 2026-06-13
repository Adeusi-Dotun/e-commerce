/**
 * utils/orders.js
 * Shared helper functions for order-related screens (Cart, Checkout, PlacedOrder, etc.)
 */

// ── Currency formatting ──────────────────────────────────────────────────────

/**
 * Formats a number as Nigerian Naira (₦).
 * @param {number} amount
 * @returns {string}  e.g. "₦12,500"
 */
export const formatNaira = (amount) =>
  `₦${Number(amount).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

// ── Vendor helpers ────────────────────────────────────────────────────────────

/** Palette used to colour vendor avatars consistently across screens. */
const VENDOR_ACCENT_PALETTE = ['#2D4A3E', '#3D4F6F', '#6B4E3D', '#5C3D5A', '#4A5568'];

/**
 * Returns a deterministic accent colour for a vendor based on its id.
 * @param {number|string} id
 * @returns {string} hex colour
 */
export const getVendorAccent = (id) =>
  VENDOR_ACCENT_PALETTE[(id || 0) % VENDOR_ACCENT_PALETTE.length];

/**
 * Returns up to two initials from a vendor / person name.
 * @param {string} name
 * @returns {string}  e.g. "CB" for "Chop Better"
 */
export const getVendorInitials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

// ── Order ID ──────────────────────────────────────────────────────────────────

/**
 * Generates a random order ID in the format  ORD-<YEAR>-<4 chars>.
 * @returns {string}  e.g. "ORD-2026-A4BX"
 */
export const generateOrderId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const suffix = Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  return `ORD-${new Date().getFullYear()}-${suffix}`;
};

// ── Delivery helpers ──────────────────────────────────────────────────────────

/**
 * Returns a "from / to" delivery window starting 2–3 days from now.
 * @returns {{ from: string, to: string }}
 */
export const getEstimatedDelivery = () => {
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() + 2);
  const to = new Date(now);
  to.setDate(to.getDate() + 3);
  const fmt = (d) =>
    d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  return { from: fmt(from), to: fmt(to) };
};

/**
 * Returns a human-readable date label for an order (e.g. "Today • 3:45 PM").
 * @param {Date} d
 * @returns {string}
 */
export const formatOrderDateLabel = (d) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfGiven = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round(
    (startOfGiven - startOfToday) / (24 * 60 * 60 * 1000)
  );

  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const datePart =
    diffDays === 0
      ? 'Today'
      : diffDays === -1
        ? 'Yesterday'
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return `${datePart} • ${time}`;
};

// ── Cart / package aggregation ────────────────────────────────────────────────

/**
 * Counts the total number of individual items across all vendor packages.
 * @param {Array} packages  Cart array: [{ vendorId, items: [{ quantity }] }]
 * @returns {number}
 */
export const computeItemsCountFromPackages = (packages = []) =>
  packages.reduce((sum, vendor) => {
    const vendorItems = Array.isArray(vendor?.items) ? vendor.items : [];
    return (
      sum +
      vendorItems.reduce((subSum, item) => subSum + (Number(item?.quantity) || 1), 0)
    );
  }, 0);

/**
 * Builds a short readable preview of an order from its packages.
 * Shows up to 3 item names; appends " + ..." if there are more.
 * @param {Array} packages
 * @returns {string}  e.g. "Jollof Rice + Chicken + Shawarma + ..."
 */
export const buildOrderPreviewFromPackages = (packages = []) => {
  const names = [];

  packages.forEach((vendor) => {
    const vendorItems = Array.isArray(vendor?.items) ? vendor.items : [];
    vendorItems.forEach((item) => {
      const name = item?.name;
      if (typeof name === 'string' && name.trim().length > 0) names.push(name.trim());
    });
  });

  const top = names.slice(0, 3);
  if (top.length === 0) return 'Your order';
  return names.length > 3 ? `${top.join(' + ')} + ...` : top.join(' + ');
};

// ── Payment ───────────────────────────────────────────────────────────────────

/** Maps payment method IDs to human-readable labels shown on receipts. */
export const PAYMENT_LABELS = {
  card: 'Card ending in 4242',
  transfer: 'Bank Transfer',
  wallet: 'Wallet Balance',
};

/**
 * Calculates all order fee components from cart data.
 * @param {{ subtotal: number, vendorCount: number, appliedCoupon: object|null }} params
 * @returns {{ deliveryFee, serviceFee, discount, grandTotal }}
 */
export const computeOrderFees = ({ subtotal, vendorCount, appliedCoupon }) => {
  const deliveryFee = Math.min(800 + vendorCount * 350, 2400);
  const serviceFee = Math.round(subtotal * 0.025);
  const discount = appliedCoupon ? Math.round(subtotal * 0.1) : 0;
  const grandTotal = Math.max(0, subtotal + deliveryFee + serviceFee - discount);
  return { deliveryFee, serviceFee, discount, grandTotal };
};

/**
 * Validates a coupon code.
 * Returns the coupon object if valid, or null if invalid.
 * @param {string} code
 * @returns {{ code: string, label: string }|null}
 */
export const validateCoupon = (code) => {
  const upper = code.trim().toUpperCase();
  if (upper === 'UNILAG10' || upper === 'PREMIUM') {
    return { code: upper, label: '10% off your order' };
  }
  return null;
};
