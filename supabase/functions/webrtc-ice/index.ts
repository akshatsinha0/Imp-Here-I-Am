import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const iceServers: any[] = [
      { urls: "stun:stun.l.google.com:19302" },
    ];
    const TURN_URL = Deno.env.get("TURN_URL");
    const TURN_USERNAME = Deno.env.get("TURN_USERNAME");
    const TURN_CREDENTIAL = Deno.env.get("TURN_CREDENTIAL");
    if (TURN_URL && TURN_USERNAME && TURN_CREDENTIAL) {
      iceServers.push({ urls: TURN_URL, username: TURN_USERNAME, credential: TURN_CREDENTIAL });
    }
    return new Response(JSON.stringify({ iceServers }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }], error: String(e) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
