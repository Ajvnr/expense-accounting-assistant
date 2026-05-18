const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const ALLOWED_ORIGIN = "https://ajvnr.github.io";

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const corsHeaders = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }

    if (!origin.startsWith(ALLOWED_ORIGIN)) {
      return new Response("Forbidden", { status: 403 });
    }

    let body;
    try {
      body = await request.text();
    } catch {
      return new Response("Bad Request", { status: 400, headers: corsHeaders });
    }

    const groqResponse = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.GROQ_API_KEY}`,
      },
      body,
    });

    const responseHeaders = new Headers(corsHeaders);
    responseHeaders.set("Content-Type", groqResponse.headers.get("Content-Type") || "text/event-stream");

    return new Response(groqResponse.body, {
      status: groqResponse.status,
      headers: responseHeaders,
    });
  },
};
