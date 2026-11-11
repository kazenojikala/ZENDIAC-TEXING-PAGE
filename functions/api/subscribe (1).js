// functions/api/subscribe.js
// 把用户邮箱收集到 Klaviyo（以后群发营销用），并触发一封"回看链接"邮件。
// 需要在 Cloudflare 环境变量里配置：
//   KLAVIYO_API_KEY  = 你的 Klaviyo Private API Key（pk_ 开头）  —— 必填
//   KLAVIYO_LIST_ID  = 你在 Klaviyo 建的营销列表 ID              —— 选填（建议填，用于营销订阅）

function cors(status, body){
  return new Response(body, { status, headers: {
    "Content-Type":"application/json",
    "Access-Control-Allow-Origin":"*",
    "Access-Control-Allow-Headers":"Content-Type",
    "Access-Control-Allow-Methods":"POST, OPTIONS"
  }});
}
export const onRequestOptions = () => cors(204, "");
export const onRequestPost = async ({ request, env }) => {
  let body; try { body = await request.json(); } catch { return cors(400, JSON.stringify({error:"bad json"})); }
  const email = String(body.email||"").trim();
  const link  = String(body.link||"").trim();
  const name  = String(body.name||"").trim();
  if(!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return cors(400, JSON.stringify({error:"invalid email"}));

  const KEY = env.KLAVIYO_API_KEY;
  if(!KEY) return cors(500, JSON.stringify({error:"KLAVIYO_API_KEY not set"}));
  const REV = "2024-10-15";
  const firstName = name.split(/\s+/)[0] || "";
  const H = {
    "Authorization": "Klaviyo-API-Key " + KEY,
    "revision": REV,
    "Content-Type": "application/json",
    "Accept": "application/json"
  };

  // 1) 记录一个事件：会自动创建/更新用户档案，并触发 Klaviyo 里的"发结果邮件"自动流程。
  //    reading_link 作为事件属性传入，邮件模板里用它作为按钮链接。
  const eventBody = {
    data: { type:"event", attributes:{
      properties: { reading_link: link, source: "ZENDIAC Astrology Reading" },
      metric:  { data:{ type:"metric",  attributes:{ name:"Requested Astrology Reading" } } },
      profile: { data:{ type:"profile", attributes:{ email: email, first_name: firstName } } }
    }}
  };
  let evOk=false, evErr="";
  try { const r = await fetch("https://a.klaviyo.com/api/events/", { method:"POST", headers:H, body:JSON.stringify(eventBody) });
        evOk = r.ok; if(!r.ok) evErr = await r.text().catch(()=> ""); }
  catch(e){ evErr = String(e); }

  // 2) 订阅到营销列表（标记为已同意），供以后群发营销。需要配 KLAVIYO_LIST_ID。
  let subOk=null, subErr="";
  if(env.KLAVIYO_LIST_ID){
    const subBody = {
      data: { type:"profile-subscription-bulk-create-job", attributes:{
        profiles: { data: [ { type:"profile", attributes:{
          email: email,
          subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } }
        } } ] }
      }, relationships: { list: { data: { type:"list", id: env.KLAVIYO_LIST_ID } } } }
    };
    try { const r2 = await fetch("https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/", { method:"POST", headers:H, body:JSON.stringify(subBody) });
          subOk = r2.ok; if(!r2.ok) subErr = await r2.text().catch(()=> ""); }
    catch(e){ subErr = String(e); subOk=false; }
  }

  if(evOk || subOk) return cors(200, JSON.stringify({ ok:true, event:evOk, subscribed:subOk }));
  return cors(502, JSON.stringify({ ok:false, event_error:evErr, sub_error:subErr }));
};
