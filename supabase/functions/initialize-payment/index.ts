import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY");

// ── Ported from utils/orders.js — keep these in sync with the app ──────────
function computeOrderFees({ subtotal, vendorCount, appliedCoupon }) {
  const deliveryFee = Math.min(800 + vendorCount * 350, 2400);
  const serviceFee = Math.round(subtotal * 0.025);
  const discount = appliedCoupon ? Math.round(subtotal * 0.1) : 0;
  const grandTotal = Math.max(0, subtotal + deliveryFee + serviceFee - discount);
  return { deliveryFee, serviceFee, discount, grandTotal };
}

function validateCoupon(code) {
  const upper = (code || "").trim().toUpperCase();
  if (upper === "UNILAG10" || upper === "PREMIUM") {
    return { code: upper, label: "10% off your order" };
  }
  return null;
}
// ─────────────────────────────────────────────────────────────────────────

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    try {
      const userId = ctx.userClaims?.id;
      if (!userId) {
        return Response.json({ error: "User is not authenticated" }, { status: 401 });
      }

      // Email for Paystack — prefer the JWT claim, fall back to auth admin lookup
      let email = ctx.userClaims?.email;
      if (!email) {
        const { data: userRecord } = await ctx.supabaseAdmin.auth.admin.getUserById(userId);
        email = userRecord?.user?.email;
      }
      if (!email) {
        return Response.json({ error: "Could not determine account email" }, { status: 400 });
      }

      const { cart, deliveryAddress, deliveryNotes, couponCode } = await req.json();

      if (!Array.isArray(cart) || cart.length === 0) {
        return Response.json({ error: "Cart is empty" }, { status: 400 });
      }
      if (!deliveryAddress) {
        return Response.json({ error: "deliveryAddress is required" }, { status: 400 });
      }

      // Flatten to a single list of { productId, quantity }, ignoring the
      // client's vendor grouping entirely — we rebuild grouping from the DB.
      const requestedItems = [];
      for (const vendor of cart) {
        for (const item of vendor.items || []) {
          const quantity = Number(item.quantity);
          if (!item.id || !Number.isInteger(quantity) || quantity <= 0) {
            return Response.json({ error: "Invalid item in cart" }, { status: 400 });
          }
          requestedItems.push({ productId: item.id, quantity });
        }
      }
      if (requestedItems.length === 0) {
        return Response.json({ error: "Cart is empty" }, { status: 400 });
      }

      // Look up REAL prices/vendor ownership/availability from the DB
      const productIds = [...new Set(requestedItems.map((i) => i.productId))];  // selecting only the unique ids from the requested list to check on the db 
      const { data: products, error: productsError } = await ctx.supabaseAdmin
        .from("products")
        .select("id, name, price, vendor_id, stock, is_available")
        .in("id", productIds);

      if (productsError) {
        console.error("PRODUCTS LOOKUP ERROR:", productsError);
        return Response.json({ error: "Could not verify cart items" }, { status: 500 });
      }

      const productMap = new Map(products.map((p) => [p.id, p]));
      const missing = productIds.filter((id) => !productMap.has(id));
      if (missing.length > 0) {
        return Response.json(
          { error: "Some items are no longer available", productIds: missing },
          { status: 400 }
        );
      }

      // Reject unavailable items or quantities beyond stock
      const unavailable = [];
      for (const { productId, quantity } of requestedItems) {
        const product = productMap.get(productId);
        if (!product.is_available) {
          unavailable.push({ productId, reason: "unavailable" });
        } else if (product.stock !== null && quantity > product.stock) {
          unavailable.push({ productId, reason: "insufficient_stock", stock: product.stock });
        }
      }
      if (unavailable.length > 0) {
        return Response.json({ error: "Some items are unavailable", items: unavailable }, { status: 400 });
      }

      // Group by vendor_id from the DB (not from the client)
      const vendorGroups = new Map(); // vendor_id -> { items: [], subtotal }
      for (const { productId, quantity } of requestedItems) {
        const product = productMap.get(productId);
        const group = vendorGroups.get(product.vendor_id) ?? { items: [], subtotal: 0 };
        const lineTotal = product.price * quantity;
        group.items.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
        });
        group.subtotal += lineTotal;
        vendorGroups.set(product.vendor_id, group);
      }

      const subtotal = [...vendorGroups.values()].reduce((sum, g) => sum + g.subtotal, 0);
      const vendorCount = vendorGroups.size;
      const appliedCoupon = couponCode ? validateCoupon(couponCode) : null;

      const { deliveryFee, serviceFee, discount, grandTotal } = computeOrderFees({
        subtotal,
        vendorCount,
        appliedCoupon,
      });

      const packages = [...vendorGroups.entries()].map(([vendorId, group]) => ({
        vendorId,
        items: group.items,
        subtotal: group.subtotal,
      }));

      const checkoutData = {
        packages,
        deliveryAddress,
        deliveryNotes: deliveryNotes || "",
        couponCode: appliedCoupon?.code ?? null,
        subtotal,
        deliveryFee,
        serviceFee,
        discount,
        grandTotal,
      };

      // Server generates the reference now — never trust one from the client
      const reference = `UNILAG-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

      const { data: paymentData, error: paymentError } = await ctx.supabaseAdmin
        .from("payments")
        .insert({
          user_id: userId,
          reference,
          amount: grandTotal,
          status: "pending",
          provider: "paystack",
          checkout_data: checkoutData,
        })
        .select()
        .single();

      if (paymentError) {
        console.error("PAYMENT INSERT ERROR:", paymentError);
        return Response.json({ error: "Could not create payment record" }, { status: 500 });
      }

      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: Math.round(grandTotal * 100),
          reference,
          currency: "NGN",
        }),
      });

      const data = await response.json();

      return Response.json(
        { ...data, reference },
        { status: response.ok ? 200 : response.status }
      );
    } catch (error) {
      console.error("Payment initialization error:", error);
      return Response.json(
        { error: "Something went wrong while initializing payment" },
        { status: 500 }
      );
    }
  }),
};