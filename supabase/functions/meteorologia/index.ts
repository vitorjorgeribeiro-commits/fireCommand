import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const lat = url.searchParams.get("lat");
    const lon = url.searchParams.get("lon");

    if (!lat || !lon) {
      return new Response(
        JSON.stringify({ error: "Parâmetros lat e lon são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m`;

    const response = await fetch(weatherUrl);
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Erro ao obter meteorologia" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const current = data.current;

    if (!current) {
      return new Response(
        JSON.stringify({ error: "Dados meteorológicos indisponíveis" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const windDir = current.wind_direction_10m;
    const compass = degToCompass(windDir);

    return new Response(
      JSON.stringify({
        temperatura: String(Math.round(current.temperature_2m)),
        humidade: String(Math.round(current.relative_humidity_2m)),
        vento_velocidade: String(Math.round(current.wind_speed_10m)),
        vento_direcao: compass,
        vento_direcao_graus: String(Math.round(windDir)),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function degToCompass(deg: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  const idx = Math.round(deg / 45) % 8;
  return directions[idx];
}
