import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY");

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    try {
      const userId = ctx.userClaims?.id;
      if (!userId) {
        return Response.json({ error: "User is not authenticated" }, { status: 401 });
      }

      const { reference } = await req.json();
      if (!reference) {
        return Response.json({ error: "reference is required" }, { status: 400 });
      }

      const { data: payment, error: lookupError } = await ctx.supabaseAdmin
        .from("payments")
        .select("id, user_id, status, amount, order_id")
        .eq("reference", reference)
        .maybeSingle();

      if (lookupError) {
        console.error("PAYMENT LOOKUP ERROR:", lookupError);
        return Response.json({ error: "Could not look up payment" }, { status: 500 });
      }
      if (!payment || payment.user_id !== userId) {
        return Response.json({ error: "Payment not found" }, { status: 404 });
      }

      if (payment.status === "paid") {
        return Response.json({
          verified: true,
          status: "paid",
          reference,
          orderId: payment.order_id,
        });
      }

      const psResponse = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        { headers: { Authorization: `Bearer ${paystackSecret}` } }
      );
      const result = await psResponse.json();

      if (!psResponse.ok || !result.status) {
        return Response.json(
          { verified: false, error: result.message ?? "Verification failed" },
          { status: psResponse.ok ? 502 : psResponse.status }
        );
      }

      const tx = result.data;

      if (tx.status !== "success") {
        if (["failed", "abandoned"].includes(tx.status)) {
          await ctx.supabaseAdmin
            .from("payments")
            .update({ status: tx.status })
            .eq("reference", reference)
            .eq("status", "pending");
        }
        return Response.json({ verified: false, status: tx.status, reference });
      }

      if (tx.reference !== reference || tx.currency !== "NGN") {
        return Response.json({ verified: false, error: "Transaction mismatch" }, { status: 400 });
      }

      const { data: result2, error: rpcError } = await ctx.supabaseAdmin.rpc("finalize_payment", {
        p_reference: reference,
        p_paystack_amount_kobo: tx.amount,
      });

      if (rpcError) {
        console.error("FINALIZE PAYMENT ERROR:", rpcError);
        if (
          rpcError.message?.includes("amount_mismatch") ||
          rpcError.message?.includes("item_unavailable")
        ) {
          await ctx.supabaseAdmin
            .from("payments")
            .update({ status: "failed" })
            .eq("reference", reference)
            .eq("status", "pending");
          return Response.json(
            { verified: false, error: "Order could not be completed", details: rpcError.message },
            { status: 409 }
          );
        }
        return Response.json({ error: "Could not finalize payment" }, { status: 500 });
      }

      return Response.json({
        verified: true,
        status: "paid",
        reference,
        orderId: result2.order_id,
      });
    } catch (error) {
      console.error("Payment verification error:", error);
      return Response.json(
        { error: "Something went wrong while verifying payment" },
        { status: 500 }
      );
    }
  }),
};