# 隨飛 SUIFEI

多人旅行決策與即時航班比較 App。使用者不必登入；可建立旅團、分享唯一連結，讓每位成員各自提交日期、預算、出發機場、航班限制與旅行偏好，再由團主產生共同候選並讓全團複選投票。

線上版本：https://suifei-trip.justinfang.chatgpt.site

## 目前功能

- 個人模式直接搜尋，不必先建立旅團
- 群組以匿名裝置識別與唯一分享連結加入
- 全員勾選「我準備好了」後，只有團主能開始或重新找票
- 日期、天數、地區、國家、城市、機場與直飛限制的硬性交集
- 最多三個目的地候選，以及每個目的地三組彈性日期
- 三組日期同時向 Google Flights（SerpApi）查價，依可售直飛與價格排名
- 查無某組日期時不會否決整個目的地
- 每位成員可複選投票；顯示票數、投票者與尚未投票成員
- 團主可解散旅團，成員可退出
- Cloudflare D1 保存旅團、匿名成員、旅行意圖、候選與票數
- 訂票時另開 Google Flights，站內不代收款

## 偏好分數

候選先通過日期、天數、目的地範圍與航班限制等硬條件，再計算排序分數：

- 旅行風格：45%
- 目的地層級吻合度：45%
- 預算相對於目的地參考價：10%
- 團體結果同時考慮全員平均與最低分成員，避免只照多數決

這是候選排序分數，不是成功機率；即時票價另由航班資料來源驗證。

## 技術架構

- React 19、TypeScript、vinext / Vite
- Cloudflare Workers
- Cloudflare D1 + Drizzle ORM
- Google Flights via SerpApi
- Node.js 22+
- pnpm

主要程式：

- `app/portfolio-app.tsx`：主要 UI、群組流程、投票、即時日期排名
- `app/api/groups/route.ts`：旅團、成員、條件、候選、權限與投票 API
- `app/api/flights/quote/route.ts`：SerpApi 即時航班查詢與直飛驗證
- `lib/destinations.ts`：洲、區域、國家、城市與機場資料
- `db/schema.ts`、`drizzle/`：D1 schema 與 migrations

## 本機開發

```bash
pnpm install
pnpm dev
pnpm build
pnpm test
```

複製 `.env.example` 並設定：

```env
SERPAPI_API_KEY=your_key
```

`.openai/hosting.example.json` 是已移除實際部署識別碼的 Sites 設定範例。正式 API Key 與內部部署識別資料不會提交到公開 GitHub。

## 身份與隱私

- 第一次開啟會在裝置產生匿名識別碼，用於辨認旅團成員
- 分享連結相當於旅團通行證
- 其他成員看不到個人的精確預算或個人分數
- 價格可能隨航空公司與銷售平台即時變動，購買前仍應在外部頁面確認
