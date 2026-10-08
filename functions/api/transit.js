import { cors, readBody, forward } from "./_shared.js";
const URL = "https://astroapi-8.divineapi.com/western-api/v1/full-transit";
export const onRequestOptions = () => cors(204, "");
export const onRequestPost = async ({ request, env }) => {
  const body = await readBody(request);
  const url = env.DIVINE_TRANSIT_URL || URL;
  return forward(env, url, body);
};
