import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import { Stripe } from "npm:stripe@13.11.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2023-10-16",
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user with Clerk
    const clerkResponse = await fetch("https://api.clerk.dev/v1/session", {
      headers: {
        Authorization: `Bearer ${Deno.env.get("CLERK_SECRET_KEY")}`,
        "Content-Type": "application/json",
      },
    });

    if (!clerkResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Invalid session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { userId } = await clerkResponse.json();

    // Get the action from the request
    const { action } = await req.json();

    switch (action) {
      case "reset_license": {
        // Check if user has active subscription
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("stripe_subscription_id")
          .eq("user_id", userId)
          .single();

        if (!subscription?.stripe_subscription_id) {
          return new Response(
            JSON.stringify({ error: "No active subscription" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Reset the license
        const { error } = await supabase
          .from("licenses")
          .update({ machine_id: null })
          .eq("user_id", userId);

        if (error) {
          return new Response(
            JSON.stringify({ error: "Failed to reset license" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ message: "License reset successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "create_subscription": {
        const { priceId } = await req.json();
        
        // Create a Stripe checkout session
        const session = await stripe.checkout.sessions.create({
          customer_email: userId, // You might want to get the actual email from Clerk
          line_items: [{ price: priceId, quantity: 1 }],
          mode: "subscription",
          success_url: `${req.headers.get("origin")}/success`,
          cancel_url: `${req.headers.get("origin")}/cancel`,
        });

        return new Response(
          JSON.stringify({ sessionId: session.id }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});