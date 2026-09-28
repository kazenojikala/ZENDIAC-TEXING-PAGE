// functions/api/_shared.js — shared helpers for Cloudflare Pages Functions
export function cors(status, body){
  return new Response(body, { status, headers: {
    "Content-Type":"application/json",
    "Access-Control-Allow-Origin":"*",
    "Access-Control-Allow-Headers":"Content-Type",
    "Access-Control-Allow-Methods":"POST, OPTIONS"
  }});
}
export function cleanToken(t){
  t = (t||"").trim().replace(/\s+/g,"");
  if(/^bearer/i.test(t)) t = t.replace(/^bearer/i,"").trim();
  return t;
}
export const PASS = ["full_name","day","month","year","hour","min","sec",
  "gender","place","lat","lon","tzone","lan","house_system","node_type",
  "transit_day","transit_month","transit_year","transit_hour","transit_min","transit_sec"];

export async function forward(ENV, url, body){
  const form = new FormData();
  form.set("api_key", (ENV.DIVINE_API_KEY||"").trim());
  for (const k of PASS) if (body[k]!==undefined && body[k]!==null && body[k]!=="") form.set(k, String(body[k]));
  const token = cleanToken(ENV.DIVINE_TOKEN);
  const headers = {}; if (token) headers["Authorization"] = "Bearer " + token;
  const r = await fetch(url, { method:"POST", headers, body: form });
  const text = await r.text();
  return cors(r.status, text);
}
export async function readBody(request){
  try { return await request.json(); } catch { return {}; }
}
