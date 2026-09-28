# Cloudflare Pages 部署说明（占星页）

这个包是为 **Cloudflare Pages** 准备的（不是 Netlify）。结构：

```
（根目录）
├── index.html                     ← 你的占星页（前端，含内嵌图片）
└── functions/
    └── api/
        ├── _shared.js             ← 公共代理逻辑（勿删）
        ├── natal.js               ← 排盘
        ├── ascendant.js           ← 性格
        ├── insights.js            ← （套餐无权限，前端本地算，保留即可）
        ├── chart.js               ← 星盘图
        ├── sign-report.js         ← 行星落星座解读
        ├── house-report.js        ← 行星落宫位解读
        └── transit.js             ← 行运（地址待确认）
```

Cloudflare Pages 会自动把 `functions/api/natal.js` 映射成网址 `/api/natal`，
前端里 `proxyBase:"/api"` 正好对应，无需改动。

---

## 一、部署（拖拽上传方式）

1. 登录 Cloudflare → 左侧 **Workers & Pages** → **Create** → **Pages** → **Upload assets**（直接上传，不连 Git）。
2. 给项目起个名字。
3. 把这个包**解压后的所有内容**（index.html + functions 文件夹）**一起选中**，拖进上传区。
   - ⚠️ 上传的是「文件夹里的内容」，要能在根目录看到 `index.html` 和 `functions` 文件夹，不要多套一层文件夹。
4. 点部署，等它跑完。

## 二、配置环境变量（关键！不配就出不来真实数据）

在这个 Pages 项目里：**Settings → Environment variables → Production** 添加两个变量（名字一字不差）：

- `DIVINE_API_KEY` = 你的 DivineAPI **API KEY**（短的，e142… 开头）
- `DIVINE_TOKEN`  = 你的 DivineAPI **ACCESS TOKEN**（长的，eyJ… 开头）

添加后 **重新部署一次**（Deployments → 最新一次 → Retry deployment / 或重新上传），环境变量才生效。

## 三、测试

打开 Cloudflare 给你的网址 → 走引导 → Start with the basics → 填生日/时间/出生地 → Reveal my placements。
五个板块应出你的真实数据（上升/太阳/月亮、Personality、Insights、Sign/House）。

## 四、可选（仅在某个接口报 404 时才加的环境变量）

- `DIVINE_NATAL_URL` / `DIVINE_ASC_URL` / `DIVINE_CHART_URL` / `DIVINE_SIGN_URL` / `DIVINE_HOUSE_URL` / `DIVINE_TRANSIT_URL` / `DIVINE_INSIGHTS_URL`
- 平时**不用加**，只有默认地址报 404 时，用这些覆盖成正确地址。

## 五、调试

如果某个板块出不来，把 index.html 里的 `debugRaw: false` 改成 `debugRaw: true`，重新部署，页面上会显示接口原始返回，方便定位。

## 六、安全收尾（上线前做）

开发过程中 key/token 曾在对话里出现过。全部弄好后，去 DivineAPI 后台 **Re-Generate** key/token，更新 Cloudflare 这两个环境变量，再重新部署一次。
