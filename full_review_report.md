# 🏪 UniMart — Full Codebase Review & MVP Roadmap

> **Review Date:** October 26, 2026  
> **Codebase:** Expo React Native · Supabase · Paystack  
> **Status:** Feature-rich early build — needs hardening before launch

---

## 1. Executive Summary

The app has a genuinely solid foundation. The core buyer flow (browse → product detail → cart → checkout → payment via Paystack → order confirmation → tracking) is wired end-to-end with real Supabase backend calls and edge functions. The vendor flow (apply → get approved → dashboard → manage products & orders) is similarly functional. However, several **critical blockers**, **data/logic bugs**, **UX gaps**, and **missing MVP features** need to be resolved before a public launch.

---

## 2. What's Already Working Well ✅

| Area | Status |
|---|---|
| Auth (register, login, logout, session persistence) | ✅ Solid |
| Cart (multi-vendor, AsyncStorage persistence) | ✅ Solid |
| Address management (CRUD, default, AsyncStorage) | ✅ Solid |
| Vendor application form → DB insert | ✅ Working |
| VendorGate routing (pending / rejected / approved states) | ✅ Correct |
| Checkout → Paystack initialize → verify payment → PlacedOrder | ✅ End-to-end |
| Edge function: price/stock verified server-side (no trust of client prices) | ✅ Secure |
| Realtime notifications via Supabase channel | ✅ Wired |
| Vendor dashboard: stats, recent orders, low stock | ✅ Functional |
| Vendor orders: status workflow (pending→accepted→preparing→ready→delivered) | ✅ Complete |
| Order tracking timeline with animated status steps | ✅ Beautiful |
| PlacedOrder screen: animated check, order summary, cart clear | ✅ Polished |
| Custom Inter font system | ✅ Working |
| `formatNaira`, `computeOrderFees`, `validateCoupon` in shared util | ✅ Clean |

---

## 3. Critical Bugs & Blockers 🔴

These will crash the app or silently produce wrong data.

### 3.1 — `useNavigation` Called Outside NavigationContainer
**File:** [`AuthContext.js`](file:///c:/Users/PC/Documents/Projects/Unilag-expo/unilag-marketplace/src/context/AuthContext.js#L3)

```js
// Line 3
import { useNavigation } from '@react-navigation/native';
```
`useNavigation` is imported but **never used** in AuthContext. The import is harmless, but if anyone adds a call inside the Provider it will crash (the Provider wraps NavigationContainer, so it's outside it). **Remove the import.**

---

### 3.2 — Dead Code After `throw` in CheckoutScreen
**File:** [`CheckoutScreen.js`](file:///c:/Users/PC/Documents/Projects/Unilag-expo/unilag-marketplace/src/screens/CheckoutScreen.js#L176-L177)

```js
throw verifyError; // line 176
return;            // line 177 — UNREACHABLE
```
The `return` after `throw` is unreachable. Minor but indicates a copy-paste error in the error path. Also, the `throw` causes the outer `catch` to fire, showing a generic "Something went wrong" alert even though the real error was already shown one alert above — so the user sees **two error alerts** on a failed verification.

---

### 3.3 — `PlacedOrderScreen` Uses Stale/Missing `packages` Param
**File:** [`PlacedOrderScreen.js`](file:///c:/Users/PC/Documents/Projects/Unilag-expo/unilag-marketplace/src/screens/PlacedOrderScreen.js#L88-L96)

```js
const { packages = [], subtotal = 0, ... } = route.params || {};
```
But in `CheckoutScreen`, `navigation.replace('PlacedOrder', { orderId: verifyData.orderId })` — **only `orderId` is passed**. So `packages`, `subtotal`, `deliveryFee`, `totalPaid`, etc., are all `undefined`/defaults. The Payment Summary section will show **₦0 for everything**. The Packages section will be **empty**. The screen fetches the order from Supabase (good!) but doesn't use that data to populate the UI — it just `console.log`s it.

---

### 3.4 — `getVendorAccent` Will Always Return the Same Color for UUIDs
**File:** [`utils/orders.js`](file:///c:/Users/PC/Documents/Projects/Unilag-expo/unilag-marketplace/src/utils/orders.js#L26-L27)

```js
export const getVendorAccent = (id) =>
  VENDOR_ACCENT_PALETTE[(id || 0) % VENDOR_ACCENT_PALETTE.length];
```
`id` is a UUID string (e.g., `"3f7a..."`) not a number. `"3f7a..." % 5` is `NaN`, so `NaN % 5 = NaN`, and `PALETTE[NaN]` is `undefined`. All vendor avatars will have **no background colour** and likely crash or render blank.

---

### 3.5 — `console.log` with Sensitive Data Left in Production
**Files:** `AuthContext.js` line 33, `VendorDashboardScreen.js` line 288, `MyOrdersScreen.js` lines 113–114, `PlacedOrderScreen.js` lines 152–153, `VendorDetailsScreen.js` line 130

```js
console.log('Session:', data.session);        // exposes full JWT/session
console.log('🔥 MY ORDERS DATA:', JSON.stringify(data, null, 2)); // exposes full order data
```
These **must be removed** before any app store release or beta distribution.

---

### 3.6 — TrackOrderScreen Has a Hardcoded Dev Simulation Timer
**File:** [`TrackOrderScreen.js`](file:///c:/Users/PC/Documents/Projects/Unilag-expo/unilag-marketplace/src/screens/TrackOrderScreen.js#L442-L461)

```js
// TEMPORARY DEV SIMULATION - REMOVE WHEN BACKEND IS CONNECTED
useEffect(() => { ... setTimeout(() => setStatus(nextStatus), ...) }, [status]);
// END TEMPORARY DEV SIMULATION
```
This automatically walks through all order statuses every 4.5 seconds. If this ships, users will see their "Order Confirmed" magically advance to "Delivered" in ~22 seconds without the vendor doing anything. **Must be replaced with a real Supabase realtime subscription on the order status.**

---

### 3.7 — Checkout: Payment Method UI is 100% Fake
**File:** [`CheckoutScreen.js`](file:///c:/Users/PC/Documents/Projects/Unilag-expo/unilag-marketplace/src/screens/CheckoutScreen.js#L24-L44)

```js
const PAYMENT_METHODS = [
  { id: 'card', label: 'Debit Card', detail: '•••• 4829', ... },
  { id: 'transfer', label: 'Bank Transfer', ... },
  { id: 'wallet', label: 'Wallet Balance', detail: '₦24,500 available', ... },
];
```
The card detail, wallet balance, and even the selection are **hardcoded and cosmetic**. The actual payment only ever calls Paystack regardless of which method is selected. The `selectedPayment` state isn't passed to the payment function at all. This is misleading to users.

---

### 3.8 — Coupon Codes are Hardcoded Client-Side
**Files:** [`CheckoutScreen.js`](file:///c:/Users/PC/Documents/Projects/Unilag-expo/unilag-marketplace/src/screens/CheckoutScreen.js), [`utils/orders.js`](file:///c:/Users/PC/Documents/Projects/Unilag-expo/unilag-marketplace/src/utils/orders.js#L163-L168), [`initialize-payment/index.ts`](file:///c:/Users/PC/Documents/Projects/Unilag-expo/unilag-marketplace/supabase/functions/initialize-payment/index.ts#L15-L21)

`UNILAG10` and `PREMIUM` are hardcoded in both the client and the edge function. Anyone who knows the codes gets 10% off forever. Coupons need a DB table with expiry, usage limits, and admin control.

---

### 3.9 — Address Data Only in AsyncStorage (Not Synced to DB)
**File:** [`AddressContext.js`](file:///c:/Users/PC/Documents/Projects/Unilag-expo/unilag-marketplace/src/context/AddressContext.js)

All user addresses are saved to **device-only AsyncStorage**. If a user changes phones, reinstalls, or uses a different device, all saved addresses are gone. For an MVP, addresses should be saved to a `user_addresses` table in Supabase.

---

### 3.10 — `borderRadius: '100%'` in CartScreen (Invalid in RN)
**File:** [`CartScreen.js`](file:///c:/Users/PC/Documents/Projects/Unilag-expo/unilag-marketplace/src/screens/CartScreen.js#L454)

```js
logo: {
  borderRadius: '100%',  // ❌ React Native does not support string border-radius
}
```
This will throw a warning or silently fail. Should be `borderRadius: 20` (half of width/height).

---

## 4. Logic & Data Issues 🟡

These won't crash the app but produce wrong behavior.

### 4.1 — HomeScreen Has Hardcoded Mock Vendors
**File:** [`HomeScreen.js`](file:///c:/Users/PC/Documents/Projects/Unilag-expo/unilag-marketplace/src/screens/HomeScreen.js#L14-L18)

`mockVendors` (Glow Lab, SoleCraft, Chop Spot) are always shown if no live vendor with those names exists. These are also Unilag-specific names (`Jaja Hall`, `Moremi Hall`, etc.) which conflicts with the app's new direction as a general multi-vendor marketplace. Additionally, the hardcoded `'Popular near you'` and `'Moremi Hall, Unilag'` default address strings still reference Unilag specifically.

### 4.2 — VendorDetails: Categories Filter Not Connected
**File:** [`VendorDetailsScreen.js`](file:///c:/Users/PC/Documents/Projects/Unilag-expo/unilag-marketplace/src/screens/VendorDetailsScreen.js#L19)

The `categories` array (`['Popular', 'Rice', 'Grills', 'Drinks', 'Snacks']`) is defined and `activeCategory` state exists, but **no filter is actually applied** to `menuItems`. The category bar is rendered but does nothing. Also, the category list is hardcoded food-specific even though the app sells fashion, beauty, etc.

### 4.3 — VendorDetails: Product Image Key is Wrong
```js
source={{ uri: vendor?.menu?.[0]?.image }}  // used in VendorDetailsScreen header
```
But from HomeScreen, the vendor object has `vendor.image` (a direct string), not `vendor.menu[0].image`. `menu` is a mock-only field. For live vendors this will always be `undefined`, giving no header image.

### 4.4 — TrackOrder Receives Wrong Data Shape
**File:** [`MyOrdersScreen.js`](file:///c:/Users/PC/Documents/Projects/Unilag-expo/unilag-marketplace/src/screens/MyOrdersScreen.js#L240)

```js
onPress={() => navigation.navigate('TrackOrder', { order })}
```
The `normalizeOrder` function maps `raw.status` (e.g., `"delivered"`) to `"Completed"`. But `TrackOrderScreen.buildTimeline` expects status values like `"Order Confirmed"`, `"Vendor Preparing"`, `"Completed"` — different vocabulary. The timeline will always default to "In Transit" regardless of actual status.

### 4.5 — VendorDashboard: "View all" Buttons Do Nothing
**File:** [`VendorDashboardScreen.js`](file:///c:/Users/PC/Documents/Projects/Unilag-expo/unilag-marketplace/src/screens/VendorDashboardScreen.js#L408-L437)

The "View all" for Recent Orders and "See all" for Low Stock are wrapped in `<Pressable>` with no `onPress`. Same for the "Restock" button — it navigates nowhere.

### 4.6 — Dashboard `averageRating` is Hardcoded to 0
```js
setStats({ ..., averageRating: 0 });
```
The rating is never fetched from the DB. The stat card will always show `0`.

### 4.7 — AccountScreen: Multiple Menu Items Have No `onPress`
**File:** [`AccountScreen.js`](file:///c:/Users/PC/Documents/Projects/Unilag-expo/unilag-marketplace/src/screens/AccountScreen.js)

Help Center, Report an Issue, App Settings, Privacy Policy, Terms and Condition, and Password Manager all render as tappable rows but have **no navigation target or handler**. Users will tap and nothing will happen.

### 4.8 — `CategoriesScreen` is a Placeholder
**File:** [`CategoriesScreen.js`](file:///c:/Users/PC/Documents/Projects/Unilag-expo/unilag-marketplace/src/screens/CategoriesScreen.js#L40)

```js
<Text style={styles.placeholder}>Categories go here 🗂️</Text>
```
This entire screen is empty. It's the second tab of the app. Any user who taps "Search/Categories" sees nothing.

### 4.9 — `PaymentMethodScreen` & `AddCardScreen` Are Shells
**Files:** [`PaymentMethodScreen.js`](file:///c:/Users/PC/Documents/Projects/Unilag-expo/unilag-marketplace/src/screens/PaymentMethodScreen.js), [`AddCardScreen.js`](file:///c:/Users/PC/Documents/Projects/Unilag-expo/unilag-marketplace/src/screens/AddCardScreen.js)

These screens exist and are reachable from Checkout, but they likely don't persist real payment methods. Users can navigate there but any "saved card" data is either fake or lost on restart.

### 4.10 — TermsScreen & PrivacyScreen are Empty
**Files:** [`TermsScreen.js`](file:///c:/Users/PC/Documents/Projects/Unilag-expo/unilag-marketplace/src/screens/TermsScreen.js), [`PrivacyScreen.js`](file:///c:/Users/PC/Documents/Projects/Unilag-expo/unilag-marketplace/src/screens/PrivacyScreen.js)

Both are ~590 bytes — almost certainly blank placeholder screens. Needed before any public distribution (especially for App Store review).

### 4.11 — `VendorApplicationScreen` Has a Fake Multi-Step Progress Bar
**File:** [`VendorApplicationScreen.js`](file:///c:/Users/PC/Documents/Projects/Unilag-expo/unilag-marketplace/src/screens/VendorApplicationScreen.js#L131-L132)

```js
const active = index === 0;  // always step 1 is "active"
```
The progress bar always shows "Step 1: Personal" as active. It's cosmetic and misleading — all steps are on one scroll, not actually separated.

### 4.12 — No Input Validation on Vendor Application
The `handleSubmit` function submits even if `businessName`, `campusLocation`, `businessDescription`, and `selectedTags` are all empty. There is no client-side validation.

### 4.13 — Notification Bell on HomeScreen Does Nothing
**File:** [`HomeScreen.js`](file:///c:/Users/PC/Documents/Projects/Unilag-expo/unilag-marketplace/src/screens/HomeScreen.js#L140)

```js
<Pressable style={styles.bellButton} accessibilityLabel="Notifications">
```
No `onPress` handler. Tapping the bell does nothing.

### 4.14 — Search Bar on HomeScreen Has No Function
The `search` state is set but `displayVendors` is never filtered by `search`. Typing in the search box does nothing to the displayed vendors.

### 4.15 — `VendorDetailsScreen` Has a `console.log` in the Render Loop
```js
menuItems.map((item) => {
  console.log(item.name, item.images);  // line 130
```
This logs every render cycle for every product. Performance kill in production.

---

## 5. UI / Design Inconsistencies 🟠

| Issue | Detail |
|---|---|
| **Brand color mismatch** | HomeScreen uses `#D94A06`, CheckoutScreen uses `#B53B18`, CartScreen uses `#FF6B00`, Dashboard uses `#FF6B00`. Four different "brand" oranges across the app. |
| **AccountScreen is visually outdated** | Uses raw inline styles, fixed `fontWeight: 700` (should be string `'700'`), minimal design. Every other screen is polished; Account looks like an early prototype. |
| **CartScreen vendor logo is a black circle** | The `logo` view is a black circle placeholder — no vendor image or initials shown. |
| **VendorDetails: rating is hardcoded** | `⭐ 4.8 (500+ reviews)` — never dynamic. |
| **VendorDetails: delivery time is hardcoded** | `25-35 mins` — never dynamic. |
| **HomeScreen text says "UniMart"** | Sell banner says "Open your shop on UniMart" — but `package.json` says `unilag-marketplace`. Branding isn't fully decided. |
| **Checkout: UNILAG10/PREMIUM hint is visible** | `<Text>Try UNILAG10 or PREMIUM</Text>` — exposes the coupon codes publicly in the UI. |

---

## 6. Security Concerns 🔴

| Issue | Severity |
|---|---|
| Coupon codes hardcoded in client bundle | High |
| JWT/session logged to console | High |
| Full order data logged to console | Medium |
| Addresses stored only on device (data loss risk) | Medium |
| No rate limiting or abuse prevention on vendor application | Low |

---

## 7. Missing MVP Features (Must-Have Before Launch) 📋

These are features that users will immediately expect and whose absence will stop adoption.

| Feature | Current State | Priority |
|---|---|---|
| **Categories / Search screen** | Placeholder | 🔴 P0 |
| **Real order status tracking** (Supabase realtime) | Fake timer simulation | 🔴 P0 |
| **PlacedOrder screen shows real data** | Shows ₦0/empty from missing params | 🔴 P0 |
| **Address saved to Supabase** | AsyncStorage only | 🔴 P0 |
| **Vendor product search/filter** | Not implemented | 🟡 P1 |
| **Terms & Privacy content** | Empty screens | 🟡 P1 |
| **Form validation** (vendor application, register) | Absent | 🟡 P1 |
| **Order cancellation flow** | TrackOrderScreen has button but no handler | 🟡 P1 |
| **Contact Support / Report Issue** | Buttons but no action | 🟡 P1 |
| **Push notifications** (`expo-notifications` installed but unused) | Package installed, not wired | 🟡 P1 |
| **Password change / reset flow** | Menu item but no screen | 🟡 P1 |
| **Wishlist / Favourites** | Mentioned in Account upsell, not built | 🟠 P2 |
| **Vendor profile editing** | Not built | 🟠 P2 |
| **Vendor rating system** | Dashboard shows 0, no review flow | 🟠 P2 |
| **Admin panel for approving vendors** | No UI at all | 🟠 P2 (can use Supabase Studio) |
| **Delivery time estimation** | All hardcoded | 🟠 P2 |

---

## 8. Architecture & Code Quality Notes

| Observation | Recommendation |
|---|---|
| **`services/` directory is empty** | All Supabase calls are inline in screens. Extract into service files as the app grows. |
| **No loading states on many buttons** | "Place Order" button can be double-tapped. Add `loading` state + disable on press. |
| **No error boundary** | A single unhandled error can crash the whole app. Add a top-level error boundary. |
| **Mixed `SafeAreaView` imports** | Some screens use RN's built-in, others use `react-native-safe-area-context`. Standardise on the context version. |
| **`fontWeight` as numbers** | `fontWeight: 700` (number) used in many screens. React Native requires string: `'700'`. This is silently ignored on some platforms. |
| **`package.json` still named `unilag-marketplace`** | If the app is no longer Unilag-specific, update the name and `app.json` bundle IDs before store submission. |
| **`eas.json` present** | EAS Build is configured which is great for production builds. Make sure `EXPO_PUBLIC_SUPABASE_*` and `PAYSTACK_SECRET_KEY` env vars are set in EAS secrets. |

---

## 9. Recommended MVP Sprint Plan (to December)

> **Assumption:** December = ~5 weeks from now.

### Week 1 — Critical Bug Fixes (Non-Negotiable)
- [ ] Fix `PlacedOrderScreen`: populate from fetched Supabase order data
- [ ] Fix double-alert on payment verification failure
- [ ] Fix `getVendorAccent` for UUID strings
- [ ] Remove all `console.log` statements
- [ ] Fix `borderRadius: '100%'` in CartScreen
- [ ] Remove the dev simulation timer from TrackOrderScreen

### Week 2 — Core Missing Features
- [ ] Build real Categories/Search screen with vendor & product search
- [ ] Wire Supabase realtime on `order_packages` for live order tracking
- [ ] Move address storage to Supabase `user_addresses` table
- [ ] Add form validation to VendorApplication and Register screens
- [ ] Remove Unilag-specific hardcoded text (mock vendors, "Moremi Hall" default, etc.)

### Week 3 — UX Completion
- [ ] Implement Order Cancellation flow (TrackOrder → API call)
- [ ] Write real Terms & Privacy content
- [ ] Wire Push Notifications (`expo-notifications` setup)
- [ ] Fix VendorDetails category filter to actually filter products
- [ ] Fix VendorDetails header image to use the correct field
- [ ] Add loading/disabled states on all CTA buttons
- [ ] Fix AccountScreen outdated design to match the rest of the app
- [ ] Connect all dead menu items in AccountScreen (Help, Privacy, Terms, Password)

### Week 4 — Polish & Stabilisation
- [ ] Move coupon codes to a Supabase `coupons` table with admin control
- [ ] Unify brand color (pick one and apply everywhere)
- [ ] Fix VendorDashboard "View all" buttons and rating stat
- [ ] Fix VendorApplicationScreen progress bar to be multi-step or remove it
- [ ] Add error boundary at root level
- [ ] Standardise `SafeAreaView` imports
- [ ] Fix all `fontWeight` number → string

### Week 5 — Pre-Launch
- [ ] Beta test with 5–10 real vendors and buyers
- [ ] Set up EAS build pipeline with production env vars
- [ ] Add basic analytics (Posthog/Mixpanel or Supabase logs)
- [ ] App Store / Play Store asset preparation (icon, screenshots, description)
- [ ] Final security review: remove all dev logs, lock down Supabase RLS policies

---

## 10. Verdict

The app is in a **solid early-beta state**. The core commerce loop works. The design quality is genuinely impressive. With focused effort on the bug fixes and feature completion outlined above, a legitimate MVP launch before December is very achievable. The biggest risks are:

1. **PlacedOrder showing zero data** — users will distrust the app after their first purchase
2. **TrackOrder showing fake progression** — immediately obvious and trust-destroying
3. **CategoriesScreen being empty** — the second tab of the app is a dead end

Fix those three first and the app becomes something you can confidently put in front of real users.
