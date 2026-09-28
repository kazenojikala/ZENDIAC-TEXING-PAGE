import { cors, readBody, forward } from "./_shared.js";
const BASE = "https://astroapi-4.divineapi.com/western-api/v2/general-house-report";
export const onRequestOptions = () => cors(204, "");
export const onRequestPost = async ({ request, env }) => {
  const body = await readBody(request);
  const planet = String(body.planet||"").toLowerCase().replace(/\s+/g,"");
  if(!planet) return cors(400, JSON.stringify({error:"missing planet"}));
  const base = env.DIVINE_HOUSE_URL || BASE;
  return forward(env, base + "/" + encodeURIComponent(planet), body);
};
