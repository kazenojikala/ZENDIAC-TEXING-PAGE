import { cors, readBody, forward } from "./_shared.js";
const URL = "https://astroapi-4.divineapi.com/western-api/v1/transit-chart-report";
export const onRequestOptions = () => cors(204, "");
export const onRequestPost = async ({ request, env }) => {
  const body = await readBody(request);
  const url = env.DIVINE_TRANSIT_URL || URL;
  return forward(env, url, body);
};
