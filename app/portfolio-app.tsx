"use client";

import { FormEvent, useEffect, useState } from "react";
import { destinationContinents, destinationCountries, destinationRegions, destinations, localize } from "../lib/destinations";

type EntryMode = "solo" | "group";
type DateMode = "leave" | "fuzzy" | "exact";

type GroupListItem = {
  id: string;
  kind: "solo" | "group";
  name: string;
  inviteCode: string;
  status: string;
  createdAt: string;
};

type Intent = {
  mode: string;
  origins: string[];
  destinations: string[];
  windowStart: string;
  windowEnd: string;
  minNights: number;
  maxNights: number;
  budgetMax: number;
  baggageKg: number;
  redEyeAllowed: boolean;
  maxStops: number;
  styles: string[];
};

type Candidate = {
  id: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  fitScore: number;
  payload: {
    code: string;
    country: string;
    emoji: string;
    note: string;
    priceFloor: number;
    priceCeiling: number;
    origins: string[];
    styles: string[];
    priceStatus: "unverified";
    maxStops: number;
    baggageKg: number;
    airports: Array<{ code: string; name: string }>;
    dateOptions: Array<{ departureDate: string; returnDate: string; matchType: "exact" | "overlap" }>;
    dateMode: "exact" | "flexible";
    reasons: string[];
    tradeoff: string;
  };
};

type LiveQuote = {
  status: "loading" | "live" | "no_direct" | "no_results" | "unconfigured" | "error";
  queryKey?: string;
  source?: string;
  checkedAt?: string;
  bookingUrl?: string;
  price?: number;
  currency?: string;
  airlines?: string[];
  itineraries?: Array<{ segments: Array<{ from: string; to: string; flight: string }> }>;
  error?: string;
};

type GroupDetail = {
  group: {
    id: string;
    kind: "solo" | "group";
    name: string;
    inviteCode: string;
    status: string;
    selectedCandidateId: string | null;
    createdAt: string;
  };
  members: Array<{
    userId: string;
    displayName: string;
    role: string;
    responseState: "pending" | "complete";
    styles: string[];
  }>;
  myIntent: Intent | null;
  isMember: boolean;
  currentUser: { id: string; displayName: string };
  summary: {
    completed: number;
    total: number;
    windowStart: string | null;
    windowEnd: string | null;
    budgetCeiling: number | null;
  };
  voting: {
    totalMembers: number;
    votersCount: number;
    votedUserIds: string[];
    myCandidateIds: string[];
    tallies: Array<{
      candidateId: string;
      count: number;
      voterUserIds: string[];
      voterNames: string[];
    }>;
  };
  candidates: Candidate[];
};

const styles = [
  { id: "lazy", label: "耍廢", symbol: "☁", hint: "少移動、睡飽再走" },
  { id: "nature", label: "自然", symbol: "⌁", hint: "山海、溫泉、散步" },
  { id: "food", label: "美食", symbol: "◒", hint: "市場、餐廳、咖啡" },
  { id: "city", label: "城市", symbol: "▦", hint: "展覽、街區、夜景" },
  { id: "shopping", label: "購物", symbol: "◇", hint: "逛街、選物、補貨" },
];

const continents = destinationContinents.map((item) => ({ id: item.id, label: localize(item.name) }));
const regions = destinationRegions.map((item) => ({ id: item.id, continent: item.continent, label: localize(item.name) }));
const countries = destinationCountries.map((item) => ({ id: item.id, region: item.region, label: localize(item.name) }));
const cities = destinations.map((item) => ({ id: item.code, country: item.countryCode, label: localize(item.cityName), airportCode: item.code, airportCount: item.airports.length, popularity: item.popularity }));

const leavePresets = [
  { id: "26-midautumn", year: 2026, title: "中秋＋教師節", start: "2026-09-19", end: "2026-09-28", leave: "9/21–9/24", leaveDays: 4, totalDays: 10, minNights: 5, maxNights: 8, tone: "秋季長線" },
  { id: "26-national", year: 2026, title: "國慶連假", start: "2026-10-03", end: "2026-10-11", leave: "10/5–10/8", leaveDays: 4, totalDays: 9, minNights: 5, maxNights: 8, tone: "秋季出走" },
  { id: "26-restoration", year: 2026, title: "光復節連假", start: "2026-10-24", end: "2026-11-01", leave: "10/27–10/30", leaveDays: 4, totalDays: 9, minNights: 5, maxNights: 8, tone: "楓葉檔期" },
  { id: "26-crossyear", year: 2026, title: "行憲＋2027 元旦", start: "2026-12-25", end: "2027-01-03", leave: "12/28–12/31", leaveDays: 4, totalDays: 10, minNights: 5, maxNights: 9, tone: "跨年最划算" },
  { id: "27-newyear", year: 2027, title: "元旦連假", start: "2027-01-01", end: "2027-01-10", leave: "1/4–1/8", leaveDays: 5, totalDays: 10, minNights: 5, maxNights: 9, tone: "新年第一飛" },
  { id: "27-spring", year: 2027, title: "農曆春節", start: "2027-02-04", end: "2027-02-14", leave: "2/11–2/12", leaveDays: 2, totalDays: 11, minNights: 6, maxNights: 10, tone: "請 2 休 11" },
  { id: "27-peace", year: 2027, title: "和平紀念日", start: "2027-02-27", end: "2027-03-07", leave: "3/2–3/5", leaveDays: 4, totalDays: 9, minNights: 5, maxNights: 8, tone: "初春長假" },
  { id: "27-qingming", year: 2027, title: "兒童＋清明", start: "2027-04-03", end: "2027-04-11", leave: "4/7–4/9", leaveDays: 3, totalDays: 9, minNights: 5, maxNights: 8, tone: "請 3 休 9" },
  { id: "27-dragon", year: 2027, title: "端午節", start: "2027-06-05", end: "2027-06-09", leave: "6/7–6/8", leaveDays: 2, totalDays: 5, minNights: 3, maxNights: 4, tone: "短程剛好" },
  { id: "27-midautumn", year: 2027, title: "中秋節", start: "2027-09-11", end: "2027-09-15", leave: "9/13–9/14", leaveDays: 2, totalDays: 5, minNights: 3, maxNights: 4, tone: "請 2 休 5" },
  { id: "27-teacher", year: 2027, title: "教師節", start: "2027-09-25", end: "2027-09-28", leave: "9/27", leaveDays: 1, totalDays: 4, minNights: 2, maxNights: 3, tone: "請 1 休 4" },
  { id: "27-national", year: 2027, title: "國慶連假", start: "2027-10-09", end: "2027-10-17", leave: "10/12–10/15", leaveDays: 4, totalDays: 9, minNights: 5, maxNights: 8, tone: "秋季長線" },
  { id: "27-restoration", year: 2027, title: "光復節連假", start: "2027-10-23", end: "2027-10-31", leave: "10/26–10/29", leaveDays: 4, totalDays: 9, minNights: 5, maxNights: 8, tone: "賞楓首選" },
  { id: "27-crossyear", year: 2027, title: "行憲＋2028 元旦", start: "2027-12-24", end: "2028-01-02", leave: "12/27–12/30", leaveDays: 4, totalDays: 10, minNights: 5, maxNights: 9, tone: "跨年最划算" },
] as const;

const statusLabels: Record<string, string> = {
  collecting: "收集中",
  matching: "已完成計算",
  decided: "已決定",
  archived: "已封存",
};

function dateAfter(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function defaultFuzzyMonth() {
  const now = new Date();
  const year = now.getMonth() >= 11 ? now.getFullYear() + 1 : now.getFullYear();
  return `${year}-12`;
}

function fuzzyWindow(month: string, period: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const lastDay = new Date(year, monthNumber, 0).getDate();
  const prefix = `${year}-${String(monthNumber).padStart(2, "0")}`;
  if (period === "early") return { start: `${prefix}-01`, end: `${prefix}-10` };
  if (period === "mid") return { start: `${prefix}-11`, end: `${prefix}-20` };
  if (period === "late") return { start: `${prefix}-21`, end: `${prefix}-${lastDay}` };
  if (period === "new_year") return { start: `${year}-12-26`, end: `${year + 1}-01-05` };
  return { start: `${prefix}-01`, end: `${prefix}-${lastDay}` };
}

function readFuzzyMode(mode?: string) {
  const match = mode?.match(/^fuzzy:(\d{4}-\d{2}):(full|early|mid|late|new_year)$/);
  return match ? { month: match[1], period: match[2] } : null;
}

function readLeavePreset(mode?: string) {
  return mode?.startsWith("leave:") ? leavePresets.find((preset) => preset.id === mode.slice(6)) : undefined;
}

function formatDate(value: string | null) {
  if (!value) return "尚未產生";
  return new Intl.DateTimeFormat("zh-TW", { month: "numeric", day: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function formatFullDate(value: string | null) {
  if (!value) return "尚未產生";
  return new Intl.DateTimeFormat("zh-TW", { year: "numeric", month: "numeric", day: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function money(value: number | null) {
  return value === null ? "—" : `NT$ ${new Intl.NumberFormat("zh-TW").format(value)}`;
}

function getGuestId() {
  const key = "suifei-guest-id";
  let value = window.localStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    window.localStorage.setItem(key, value);
  }
  return value;
}

async function requestApi<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      "x-suifei-guest-id": getGuestId(),
      ...init?.headers,
    },
  });
  const data = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(data.error || "操作沒有完成");
  return data;
}

export function PortfolioApp() {
  const [entryMode, setEntryMode] = useState<EntryMode>("solo");
  const [showCreate, setShowCreate] = useState(false);
  const [recentGroups, setRecentGroups] = useState<GroupListItem[]>([]);
  const [detail, setDetail] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("g") || params.get("s");
    if (code) {
      void openGroup(code);
    } else {
      void loadGroups();
    }
  }, []);

  async function loadGroups() {
    setLoading(true);
    setError("");
    try {
      const data = await requestApi<{ groups: GroupListItem[] }>("/api/groups");
      setRecentGroups(data.groups);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "暫時無法載入");
    } finally {
      setLoading(false);
    }
  }

  async function openGroup(code: string) {
    setLoading(true);
    setError("");
    try {
      const data = await requestApi<GroupDetail>(`/api/groups?code=${encodeURIComponent(code)}`);
      setDetail(data);
      window.history.replaceState({}, "", data.group.kind === "solo" ? `/?s=${data.group.inviteCode}` : `/?g=${data.group.inviteCode}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "找不到旅團");
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }

  async function postAction(payload: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      const data = await requestApi<GroupDetail>("/api/groups", { method: "POST", body: JSON.stringify(payload) });
      setDetail(data);
      setShowCreate(false);
      window.history.replaceState({}, "", data.group.kind === "solo" ? `/?s=${data.group.inviteCode}` : `/?g=${data.group.inviteCode}`);
      return data;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "操作沒有完成");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function removeGroupMembership(action: "leave" | "disband", code: string) {
    setBusy(true);
    setError("");
    try {
      await requestApi<{ success: true; action: "left" | "disbanded" }>("/api/groups", { method: "POST", body: JSON.stringify({ action, code }) });
      setDetail(null);
      setShowCreate(false);
      window.history.replaceState({}, "", "/#my-groups");
      await loadGroups();
      setNotice(action === "disband" ? "旅團已解散" : "你已退出旅團");
      window.setTimeout(() => document.getElementById("my-groups")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "操作沒有完成");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function startSoloSearch() {
    await postAction({ action: "create", kind: "solo", name: "我的個人搜尋" });
  }

  function goHome() {
    setDetail(null);
    setShowCreate(false);
    setNotice("");
    setError("");
    window.history.replaceState({}, "", "/");
    void loadGroups();
  }

  async function goToMyGroups() {
    setDetail(null);
    setShowCreate(false);
    setNotice("");
    setError("");
    window.history.replaceState({}, "", "/#my-groups");
    await loadGroups();
    window.setTimeout(() => document.getElementById("my-groups")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  async function copyInvite() {
    if (!detail) return;
    const url = `${window.location.origin}/?g=${detail.group.inviteCode}`;
    const message = `${detail.group.name} 的唯一加入連結\n不用登入，填一個暱稱就能一起決定去哪裡：\n${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: detail.group.name, text: "不用登入，填一個暱稱就能一起決定去哪裡。", url });
        setNotice("已開啟分享選單");
      } else {
        await navigator.clipboard.writeText(message);
        setNotice("唯一加入連結已複製");
      }
    } catch {
      // The user may close the native share sheet; no error state is needed.
    }
  }

  if (loading) return <LoadingScreen />;

  return (
    <main className="app-shell">
      <Topbar workspaceKind={detail?.group.kind ?? null} onHome={goHome} onMyGroups={goToMyGroups} />
      {error && <div className="toast error-toast" role="alert">{error}<button onClick={() => setError("")} aria-label="關閉">×</button></div>}
      {notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice("")} aria-label="關閉">×</button></div>}

      {detail ? (
        <GroupWorkspace
          detail={detail}
          busy={busy}
          onAction={postAction}
          onRemoveGroup={removeGroupMembership}
          onShare={copyInvite}
        />
      ) : (
        <Landing
          entryMode={entryMode}
          setEntryMode={setEntryMode}
          showCreate={showCreate}
          setShowCreate={setShowCreate}
          recentGroups={recentGroups}
          busy={busy}
          onStartSolo={startSoloSearch}
          onCreate={postAction}
          onOpen={openGroup}
        />
      )}
    </main>
  );
}

function Topbar({ workspaceKind, onHome, onMyGroups }: { workspaceKind: "solo" | "group" | null; onHome: () => void; onMyGroups: () => Promise<void> }) {
  return (
    <header className="topbar">
      <button className="brand" type="button" onClick={onHome} aria-label="回到隨飛首頁">
        <span className="brand-mark"><span /></span><b>隨飛</b><small>隨性出發</small>
      </button>
      <div className="topbar-note"><span className="live-dot" /> Cloudflare 安全儲存</div>
      {workspaceKind && <button className="ghost-button" type="button" onClick={() => workspaceKind === "solo" ? onHome() : void onMyGroups()}>{workspaceKind === "solo" ? "回到首頁" : "我的旅團"}</button>}
    </header>
  );
}

function Landing({ entryMode, setEntryMode, showCreate, setShowCreate, recentGroups, busy, onStartSolo, onCreate, onOpen }: {
  entryMode: EntryMode;
  setEntryMode: (mode: EntryMode) => void;
  showCreate: boolean;
  setShowCreate: (value: boolean) => void;
  recentGroups: GroupListItem[];
  busy: boolean;
  onStartSolo: () => Promise<void>;
  onCreate: (payload: Record<string, unknown>) => Promise<GroupDetail | null>;
  onOpen: (code: string) => Promise<void>;
}) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span /> 不用先決定去哪裡</div>
          <h1>想飛，<br /><em>先找得到交集。</em></h1>
          <p>一個人可以先找旅行靈感；一群人可以各自私下填日期、預算與偏好。隨飛負責把聊天變成三個真正能討論的共同答案。</p>
          <div className="entry-picker" role="tablist" aria-label="選擇開始方式">
            <button className={entryMode === "solo" ? "active" : ""} type="button" role="tab" aria-selected={entryMode === "solo"} onClick={() => { setEntryMode("solo"); setShowCreate(false); }}>
              <span>01</span><b>我想出去</b><small>先替自己找日期與方向</small>
            </button>
            <button className={entryMode === "group" ? "active" : ""} type="button" role="tab" aria-selected={entryMode === "group"} onClick={() => { setEntryMode("group"); setShowCreate(false); }}>
              <span>02</span><b>我們想出去</b><small>先湊團，再找共同答案</small>
            </button>
          </div>
          <button className="primary-button hero-action" disabled={busy} type="button" onClick={() => entryMode === "solo" ? void onStartSolo() : setShowCreate(true)}>
            {busy && entryMode === "solo" ? "正在開啟搜尋…" : entryMode === "solo" ? "直接開始搜尋" : "建立一個新旅團"}<span>→</span>
          </button>
          <div className="trust-row"><span>不用登入</span><span>不公開個人預算</span><span>不用先指定目的地</span><span>結果最多 3 個</span></div>
        </div>

        {showCreate && entryMode === "group" ? (
          <CreatePanel busy={busy} onCancel={() => setShowCreate(false)} onCreate={onCreate} />
        ) : (
          <PreviewCard />
        )}
      </section>

      <section className="recent-section" id="my-groups">
          <div className="section-heading"><div><span className="section-kicker">你的旅程</span><h2>繼續上次的旅團</h2></div></div>
          {recentGroups.length > 0 ? <div className="recent-grid">
            {recentGroups.map((group) => (
              <button key={group.id} type="button" onClick={() => void onOpen(group.inviteCode)}>
                <span className={`status-pill ${group.status}`}>{statusLabels[group.status] || group.status}</span>
                <b>{group.name}</b><small>專屬連結 · {group.inviteCode.slice(0, 6)}…</small><i>→</i>
              </button>
            ))}
          </div> : <div className="empty-result"><span>＋</span><h3>還沒有加入任何旅團</h3><p>建立新旅團或打開朋友分享的連結後，會出現在這裡。</p></div>}
      </section>

      <section className="principles-section">
        <article><span>01</span><h3>先過明確條件</h3><p>日期、目的地範圍、出發地和天數先取交集；票價與直飛供給到即時查票頁確認。</p></article>
        <article><span>02</span><h3>照顧最不滿意的人</h3><p>不是單純多數決；適配度同時看平均與最低分，避免有人被犧牲。</p></article>
        <article><span>03</span><h3>即時查價再購買</h3><p>站內不假裝票價不會變；點擊後帶完整日期與機場到外部即時搜尋及購買。</p></article>
      </section>
      <Footer />
    </>
  );
}

function CreatePanel({ busy, onCancel, onCreate }: {
  busy: boolean;
  onCancel: () => void;
  onCreate: (payload: Record<string, unknown>) => Promise<GroupDetail | null>;
}) {
  const [name, setName] = useState("週末逃跑局");
  const [displayName, setDisplayName] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    void onCreate({ action: "create", kind: "group", name, displayName });
  }

  return (
    <form className="create-panel" onSubmit={submit}>
      <div className="panel-top"><div><span className="section-kicker">建立多人旅團</span><h2>先把旅團建起來</h2></div><button type="button" onClick={onCancel} aria-label="關閉">×</button></div>
      <label>名稱<input value={name} maxLength={48} onChange={(event) => setName(event.target.value)} required /></label>
      <label>大家怎麼稱呼你<input value={displayName} maxLength={30} onChange={(event) => setDisplayName(event.target.value)} placeholder="可留空，使用登入名稱" /></label>
      <div className="create-explainer"><span>1</span><p>建立後先填自己的條件。</p><span>2</span><p>把專屬連結丟到 LINE。</p></div>
      <button className="primary-button" disabled={busy} type="submit">{busy ? "正在建立…" : "建立並填寫條件"}</button>
      <p className="micro-copy">資料會保存在 Cloudflare D1；精確預算只用來計算，不會顯示給其他成員。</p>
    </form>
  );
}

function PreviewCard() {
  return (
    <aside className="preview-card">
      <div className="paper-tape" />
      <span className="section-kicker">旅團羅盤</span>
      <div className="preview-title"><div><h2>週末逃跑局</h2><p>4 位旅伴 · 等待 1 人</p></div><span className="status-pill matching">計算中</span></div>
      <div className="avatar-row"><span>J</span><span>安</span><span>M</span><span className="pending">哲</span></div>
      <div className="preview-score"><strong>92<small>/100</small></strong><div><b>目前共同偏好分數</b><p>日期交集 12 天 · 預算交集成立</p></div></div>
      <dl><div><dt>硬條件</dt><dd>直飛 · 4–6 天 · 不紅眼</dd></div><div><dt>共同偏好</dt><dd>海邊 · 美食 · 少移動</dd></div><div><dt>下一步</dt><dd>等阿哲填完就產生答案</dd></div></dl>
      <div className="privacy-strip">每個人只會看見自己的精確預算</div>
    </aside>
  );
}

function GroupWorkspace({ detail, busy, onAction, onRemoveGroup, onShare }: {
  detail: GroupDetail;
  busy: boolean;
  onAction: (payload: Record<string, unknown>) => Promise<GroupDetail | null>;
  onRemoveGroup: (action: "leave" | "disband", code: string) => Promise<boolean>;
  onShare: () => Promise<void>;
}) {
  const solo = detail.group.kind === "solo";
  const [showCalculation, setShowCalculation] = useState(false);
  const allReady = detail.summary.total > 0 && detail.summary.completed === detail.summary.total;
  const isOwner = detail.members.some((member) => member.userId === detail.currentUser.id && member.role === "owner");
  const hasDateOverlap = !detail.summary.windowStart || !detail.summary.windowEnd || detail.summary.windowStart <= detail.summary.windowEnd;
  const searchFinished = detail.group.status === "matching" || detail.group.status === "decided";
  const selected = detail.candidates.find((candidate) => candidate.id === detail.group.selectedCandidateId);
  const myVotes = new Set(detail.voting.myCandidateIds);
  return (
    <>
      <section className="workspace-head">
        <div><span className="section-kicker">{solo ? "個人旅行搜尋" : "專屬連結旅團"}</span><h1>{solo ? "找一趟適合現在的旅行" : detail.group.name}</h1><p>{solo ? "填入彈性日期、預算與想去的範圍，直接取得三個建議" : `${detail.summary.completed} / ${detail.summary.total} 人準備好 · ${statusLabels[detail.group.status]} · 有連結隨時可加入`}</p></div>
        {!solo && isOwner && <button className="share-button" type="button" onClick={() => void onShare()}><span>↗</span> 分享唯一連結</button>}
      </section>

      <section className={`workspace-grid ${solo ? "solo" : ""}`}>
        {!solo && <aside className="members-panel">
          <div className="panel-label"><span>旅團成員</span><b>{detail.summary.completed}/{detail.summary.total}</b></div>
          <div className="progress-track"><i style={{ width: `${detail.summary.total ? (detail.summary.completed / detail.summary.total) * 100 : 0}%` }} /></div>
          <div className="member-list">
            {detail.members.map((member) => (
              <div className="member-row" key={member.userId}>
                <span className="member-avatar">{member.displayName.slice(0, 1).toUpperCase()}</span>
                <div><b>{member.displayName}{member.userId === detail.currentUser.id ? " · 你" : ""}</b><small>{member.responseState === "complete" ? member.styles.slice(0, 2).map((style) => styles.find((item) => item.id === style)?.label).filter(Boolean).join(" · ") || "條件已確認" : "等待填寫並確認"}</small></div>
                <span className={`member-state ${member.responseState}`}>{member.responseState === "complete" ? "準備好" : "待確認"}</span>
              </div>
            ))}
          </div>
          {detail.candidates.length > 0 && <VoteSummary detail={detail} />}
          {detail.isMember && <div className="group-management"><span>{isOwner ? "團主權限" : "成員選項"}</span><p>{isOwner ? "只有你能開始找票或解散這個旅團。" : "你可以查看團主產生的結果、複選投票或退出。"}</p><button className="danger-button" disabled={busy} type="button" onClick={() => { const confirmed = window.confirm(isOwner ? `確定要解散「${detail.group.name}」嗎？所有條件、結果與票數都會永久刪除。` : `確定要退出「${detail.group.name}」嗎？`); if (confirmed) void onRemoveGroup(isOwner ? "disband" : "leave", detail.group.inviteCode); }}>{busy ? "處理中…" : isOwner ? "解散旅團" : "退出旅團"}</button></div>}
          <p className="privacy-note">{isOwner ? "使用上方「分享唯一連結」邀請旅伴；新成員加入後會重新等待全員確認。" : "結果產生後，團員只能查看、複選投票或退出旅團。"} 其他成員看不到你的精確預算、禁忌或個別分數。</p>
        </aside>}

        <div className="workspace-main">
          {!detail.isMember ? (
            <JoinPanel detail={detail} busy={busy} onAction={onAction} />
          ) : (
            <>
              {(solo || !detail.myIntent) && <IntentForm detail={detail} busy={busy} onAction={onAction} />}
              {detail.myIntent && <div className={solo ? "solo-results" : ""}>
                <GroupSummary detail={detail} solo={solo} />
                {!solo && !allReady && <div className="empty-result"><span>◷</span><h3>等大家都勾選「我準備好了」</h3><p>目前 {detail.summary.completed}/{detail.summary.total} 人準備完成。群組不會鎖定，仍可繼續分享連結、加入新成員或修改條件。</p></div>}
                {!solo && allReady && !hasDateOverlap && <div className="empty-result"><span>↔</span><h3>大家的日期沒有交集</h3><p>共同最早可出發是 {formatFullDate(detail.summary.windowStart)}，但共同最晚回程是 {formatFullDate(detail.summary.windowEnd)}。請至少一位成員修改日期並重新勾選「我準備好了」。</p></div>}
                {!solo && allReady && hasDateOverlap && detail.candidates.length === 0 && !searchFinished && isOwner && <div className="ready-search"><span className="section-kicker">全員準備完成</span><h2>現在才開始找共同航班</h2><p>只有團主可以依目前所有人的日期、預算、目的地與航班條件產生結果；找完後群組仍保持開放。</p><button className="primary-button" disabled={busy} type="button" onClick={() => void onAction({ action: "search", code: detail.group.inviteCode })}>{busy ? "正在找共同航班…" : "開始找票"}<span>→</span></button></div>}
                {!solo && allReady && hasDateOverlap && detail.candidates.length === 0 && !searchFinished && !isOwner && <div className="empty-result"><span>◷</span><h3>等待團主開始找票</h3><p>大家都已經準備完成。結果由團主統一產生，之後你可以查看即時票價並複選投票。</p></div>}
                {(solo || detail.candidates.length > 0 || (!solo && searchFinished)) && <>
                <div className="result-heading"><div><span className="section-kicker">{solo ? "你的搜尋結果" : "共同答案"}</span><h2>{detail.candidates.length ? `先列 ${detail.candidates.length} 個偏好候選，查到票價才成立` : solo ? "目前沒有符合條件的目的地" : "目前沒有完整交集"}</h2></div><div className="result-tools"><button className="text-button" type="button" aria-expanded={showCalculation} onClick={() => setShowCalculation((current) => !current)}>{showCalculation ? "收起說明" : "如何計算？"}</button>{!solo && isOwner && detail.candidates.length > 0 && <button className="recalculate-button" disabled={busy} type="button" onClick={() => { if (window.confirm("重新找票會依目前條件重建候選，並清除現有票數。確定繼續嗎？")) void onAction({ action: "search", code: detail.group.inviteCode }); }}>{busy ? "重新計算中…" : "團主重新找票"}</button>}</div></div>
                {showCalculation && <CalculationPanel solo={solo} />}
                {detail.candidates.length ? (
                  <>
                  <div className="candidate-list">
                    {detail.candidates.map((candidate, index) => (
                      <CandidateCard key={candidate.id} candidate={candidate} rank={index + 1} solo={solo} selected={solo ? candidate.id === detail.group.selectedCandidateId : myVotes.has(candidate.id)} busy={busy} origin={detail.myIntent?.origins[0] || candidate.payload.origins[0]} adults={candidate.payload.origins.length === 1 ? detail.members.length : 1} onChoose={() => onAction(solo ? { action: "decide", code: detail.group.inviteCode, candidateId: candidate.id } : { action: "vote", code: detail.group.inviteCode, candidateId: candidate.id, selected: !myVotes.has(candidate.id) })} />
                    ))}
                  </div>
                  </>
                ) : (
                  <div className="empty-result"><span>↔</span><h3>{solo ? "目前找不到符合條件的目的地" : "條件還沒有重疊"}</h3><p>{solo ? "系統不會拿範圍外的城市湊答案。可以放寬目的地、日期或天數後重新搜尋。" : "系統不會拿範圍外的城市湊答案。常見原因是團員目的地沒有交集，或日期不足以容納旅行天數；請調整其中一項再重新計算。"}</p></div>
                )}
                {solo && selected && <div className="decision-banner"><span>✓</span><div><b>已收藏：{selected.destination}</b><p>{formatDate(selected.departureDate)} — {formatDate(selected.returnDate)}，仍需在購買前完成即時驗價。</p></div></div>}
                </>}
                {!solo && (!searchFinished || isOwner) && <details className="edit-intent"><summary>修改我的條件</summary><IntentForm detail={detail} busy={busy} onAction={onAction} compact /></details>}
              </div>}
            </>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}

function JoinPanel({ detail, busy, onAction }: { detail: GroupDetail; busy: boolean; onAction: (payload: Record<string, unknown>) => Promise<GroupDetail | null> }) {
  const [displayName, setDisplayName] = useState(detail.currentUser.displayName);
  return (
    <div className="form-card join-panel"><span className="section-kicker">免登入・連結加入</span><h2>有這條連結，就能加入「{detail.group.name}」</h2><p>不需要任何帳號。填一個暱稱後，就能提交自己的日期、預算與偏好，和大家一起看交集、選共同答案；精確預算不會公開。</p><label>旅伴怎麼稱呼你<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={30} placeholder="例如：小安" /></label><button className="primary-button" disabled={busy} type="button" onClick={() => void onAction({ action: "join", code: detail.group.inviteCode, displayName })}>{busy ? "正在加入…" : "用這個暱稱加入討論"}</button><p className="link-access-note">此連結相當於旅團通行證，請只分享給想一起參與的人。</p></div>
  );
}

function IntentForm({ detail, busy, onAction, compact = false }: { detail: GroupDetail; busy: boolean; onAction: (payload: Record<string, unknown>) => Promise<GroupDetail | null>; compact?: boolean }) {
  const original = detail.myIntent;
  const solo = detail.group.kind === "solo";
  const originalFuzzy = readFuzzyMode(original?.mode);
  const originalLeave = readLeavePreset(original?.mode);
  const availableLeavePresets = leavePresets.filter((preset) => preset.end >= dateAfter(0));
  const initialLeave = originalLeave || availableLeavePresets[0] || leavePresets.at(-1)!;
  const [displayName, setDisplayName] = useState(detail.currentUser.displayName);
  const [origin, setOrigin] = useState(original?.origins[0] || "TPE");
  const [dateMode, setDateMode] = useState<DateMode>(originalLeave ? "leave" : original && !originalFuzzy ? "exact" : original ? "fuzzy" : "leave");
  const [leavePresetId, setLeavePresetId] = useState<string>(initialLeave.id);
  const [leaveYear, setLeaveYear] = useState<number>(initialLeave.year);
  const [fuzzyMonth, setFuzzyMonth] = useState(originalFuzzy?.month || defaultFuzzyMonth());
  const [fuzzyPeriod, setFuzzyPeriod] = useState(originalFuzzy?.period || "mid");
  const [windowStart, setWindowStart] = useState(original?.windowStart || dateAfter(14));
  const [windowEnd, setWindowEnd] = useState(original?.windowEnd || dateAfter(75));
  const [minNights, setMinNights] = useState(original?.minNights || initialLeave.minNights);
  const [maxNights, setMaxNights] = useState(original?.maxNights || initialLeave.maxNights);
  const [budgetMax, setBudgetMax] = useState(original?.budgetMax || 14000);
  const [baggageKg, setBaggageKg] = useState(original?.baggageKg || 0);
  const [maxStops, setMaxStops] = useState(original?.maxStops || 0);
  const [redEyeAllowed, setRedEyeAllowed] = useState(original?.redEyeAllowed || false);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(original?.styles || ["lazy", "food"]);
  const [ready, setReady] = useState(solo);
  const originalContinent = original?.destinations.find((item) => item.startsWith("continent:"))?.split(":")[1] || "";
  const originalCountry = original?.destinations.find((item) => item.startsWith("country:"))?.split(":")[1] || "";
  const storedRegion = original?.destinations.find((item) => item.startsWith("region:"))?.split(":")[1] || "";
  const originalRegion = storedRegion === "northeast_asia"
    ? "east_asia"
    : storedRegion === "west_coast"
      ? originalCountry === "CA" ? "canada" : originalCountry === "US" ? "united_states" : ""
      : storedRegion === "australia_nz" ? "" : storedRegion;
  const originalCity = original?.destinations.find((item) => item.startsWith("city:"))?.split(":")[1] || "";
  const [continent, setContinent] = useState(originalContinent);
  const [region, setRegion] = useState(originalRegion);
  const [country, setCountry] = useState(originalCountry);
  const [city, setCity] = useState(originalCity);

  const availableCountries = countries.filter((item) => {
    if (region) return item.region === region;
    return regions.find((candidate) => candidate.id === item.region)?.continent === continent;
  });

  function toggleStyle(id: string) {
    setSelectedStyles((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function chooseLeavePreset(id: string) {
    const preset = leavePresets.find((item) => item.id === id);
    if (!preset) return;
    setLeavePresetId(id);
    setMinNights(preset.minNights);
    setMaxNights(preset.maxNights);
  }

  function chooseLeaveYear(year: number) {
    setLeaveYear(year);
    const firstPreset = availableLeavePresets.find((preset) => preset.year === year);
    if (firstPreset) chooseLeavePreset(firstPreset.id);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const selectedLeave = leavePresets.find((preset) => preset.id === leavePresetId) || initialLeave;
    const resolvedWindow = dateMode === "leave" ? { start: selectedLeave.start, end: selectedLeave.end } : dateMode === "fuzzy" ? fuzzyWindow(fuzzyMonth, fuzzyPeriod) : { start: windowStart, end: windowEnd };
    const destinations = [continent && `continent:${continent}`, region && `region:${region}`, country && `country:${country}`, city && `city:${city}`].filter(Boolean);
    const mode = dateMode === "leave" ? `leave:${selectedLeave.id}` : dateMode === "fuzzy" ? `fuzzy:${fuzzyMonth}:${fuzzyPeriod}` : "exact";
    void onAction({ action: "intent", code: detail.group.inviteCode, displayName, intent: { mode, origin, windowStart: resolvedWindow.start, windowEnd: resolvedWindow.end, minNights, maxNights, budgetMax, baggageKg, maxStops, redEyeAllowed, styles: selectedStyles, destinations, ready } });
  }

  return (
    <form className={`form-card intent-form ${compact ? "compact" : ""}`} onSubmit={submit}>
      {!compact && <div className="form-intro"><span className="section-kicker">你的私人條件卡</span><h2>填你的底線，不用替大家猜</h2><p>只有共同交集會出現在團體頁面。</p></div>}
      <div className="form-grid">
        <label>你的稱呼<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={30} /></label>
        <label>出發機場<input value={origin} onChange={(event) => setOrigin(event.target.value.toUpperCase().slice(0, 3))} pattern="[A-Za-z]{3}" placeholder="TPE" required /><small>請輸入三碼機場代碼</small></label>
        <fieldset className="date-mode-field"><legend>什麼時候想飛？</legend><div className="segmented-control three"><button type="button" className={dateMode === "leave" ? "selected" : ""} onClick={() => setDateMode("leave")}>請假攻略</button><button type="button" className={dateMode === "fuzzy" ? "selected" : ""} onClick={() => setDateMode("fuzzy")}>給大概就好</button><button type="button" className={dateMode === "exact" ? "selected" : ""} onClick={() => setDateMode("exact")}>明確區間</button></div></fieldset>
        {dateMode === "leave" ? <fieldset className="leave-guide"><legend>台灣請假攻略 <small>選一個就自動帶入日期與建議天數</small></legend><div className="year-switch">{[2026, 2027].map((year) => <button key={year} type="button" className={leaveYear === year ? "selected" : ""} onClick={() => chooseLeaveYear(year)}>{year}</button>)}</div><div className="leave-preset-grid">{availableLeavePresets.filter((preset) => preset.year === leaveYear).map((preset) => <button key={preset.id} type="button" className={leavePresetId === preset.id ? "selected" : ""} onClick={() => chooseLeavePreset(preset.id)}><span>{preset.tone}</span><b>{preset.title}</b><strong>請 {preset.leaveDays} 休 {preset.totalDays}</strong><small>{formatDate(preset.start)}–{formatDate(preset.end)} · 請 {preset.leave}</small></button>)}</div><p className="calendar-source">依行政院人事行政總處辦公日曆整理；民間企業仍以公司制度及勞動部規定為準。<a href={leaveYear === 2026 ? "https://www.dgpa.gov.tw/information?pid=12685&uid=55" : "https://www.dgpa.gov.tw/information?pid=12983&uid=2"} target="_blank" rel="noreferrer">查看官方日曆 ↗</a></p></fieldset> : dateMode === "fuzzy" ? <>
          <label>想飛的月份<input type="month" value={fuzzyMonth} onChange={(event) => setFuzzyMonth(event.target.value)} required /></label>
          <label>月份區段<select value={fuzzyPeriod} onChange={(event) => setFuzzyPeriod(event.target.value)}><option value="full">整個月都可以</option><option value="early">月初（1–10 日）</option><option value="mid">月中（11–20 日）</option><option value="late">月底（21 日–月底）</option><option value="new_year">跨年（12/26–1/5）</option></select></label>
        </> : <>
          <label>最早可出發<input type="date" value={windowStart} onChange={(event) => setWindowStart(event.target.value)} required /></label>
          <label>最晚需回來<input type="date" value={windowEnd} min={windowStart} onChange={(event) => setWindowEnd(event.target.value)} required /></label>
        </>}
        <label>最少住幾晚<input type="number" min="2" max="14" value={minNights} onChange={(event) => setMinNights(Number(event.target.value))} required /></label>
        <label>最多住幾晚<input type="number" min={minNights} max="14" value={maxNights} onChange={(event) => setMaxNights(Number(event.target.value))} required /></label>
        <label className="budget-field">每人總預算上限<strong>{money(budgetMax)}</strong><input type="range" min="5000" max="50000" step="500" value={budgetMax} onChange={(event) => setBudgetMax(Number(event.target.value))} /><small>作為推薦排序參考；不以未驗證票價淘汰目的地</small></label>
        <label>托運行李<select value={baggageKg} onChange={(event) => setBaggageKg(Number(event.target.value))}><option value="0">不需要</option><option value="15">至少 15 kg</option><option value="20">至少 20 kg</option><option value="23">至少 23 kg</option></select></label>
        <label>最多轉機<select value={maxStops} onChange={(event) => setMaxStops(Number(event.target.value))}><option value="0">只接受直飛</option><option value="1">最多一次</option><option value="2">最多兩次</option></select></label>
        <div className="check-label"><input id="red-eye-toggle" aria-label="可以搭紅眼班機" type="checkbox" checked={redEyeAllowed} onChange={(event) => setRedEyeAllowed(event.target.checked)} /><label htmlFor="red-eye-toggle"><b>可以搭紅眼班機</b><small>未勾選就當作硬條件</small></label></div>
      </div>
      <fieldset className="destination-field"><legend>想飛哪裡？ <small>依你選到的最細層級篩選；區域可以跳過</small></legend><div className="destination-grid">
        <label>洲<select value={continent} onChange={(event) => { setContinent(event.target.value); setRegion(""); setCountry(""); setCity(""); }}><option value="">哪裡都可以</option>{continents.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <label>區域（選填）<select value={region} disabled={!continent} onChange={(event) => { setRegion(event.target.value); setCountry(""); setCity(""); }}><option value="">區域不拘</option>{regions.filter((item) => item.continent === continent).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <label>國家<select value={country} disabled={!continent} onChange={(event) => { setCountry(event.target.value); setCity(""); }}><option value="">國家不拘</option>{availableCountries.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <label>城市／機場<select value={city} disabled={!country} onChange={(event) => setCity(event.target.value)}><option value="">城市與機場不拘</option>{cities.filter((item) => item.country === country).sort((a, b) => b.popularity - a.popularity).map((item) => <option key={item.id} value={item.id}>{item.label}（{item.airportCode}{item.airportCount > 1 ? ` 等 ${item.airportCount} 座機場` : ""}）</option>)}</select></label>
      </div><p className="destination-example">目前收錄 {destinationContinents.length} 大洲、{destinationRegions.length} 個區域、{destinationCountries.length} 個國家、{destinations.length} 個主要旅遊城市與 {destinations.reduce((total, item) => total + item.airports.length, 0)} 座機場。<br />例如：北美洲 → 加拿大 → 溫哥華；東南亞 → 越南 → 城市與機場不拘（越南都可以）</p></fieldset>
      <fieldset><legend>旅行偏好 <small>可複選，也可以跳過</small></legend><div className="style-grid">{styles.map((style) => <button key={style.id} type="button" className={selectedStyles.includes(style.id) ? "selected" : ""} aria-pressed={selectedStyles.includes(style.id)} onClick={() => toggleStyle(style.id)}><span>{style.symbol}</span><b>{style.label}</b><small>{style.hint}</small></button>)}</div></fieldset>
      {!solo && <div className="check-label ready-check"><input id={`ready-toggle-${compact ? "compact" : "full"}`} aria-label="我準備好了" type="checkbox" checked={ready} onChange={(event) => setReady(event.target.checked)} /><label htmlFor={`ready-toggle-${compact ? "compact" : "full"}`}><b>我準備好了</b><small>確認這份條件可以交給全團取交集；之後仍可修改並重新確認</small></label></div>}
      <button className="primary-button" disabled={busy || (!solo && !ready)} type="submit">{busy ? "正在儲存條件…" : solo ? original ? "更新並重新搜尋" : "完成，開始搜尋" : original ? "更新條件並標記準備完成" : "送出條件並標記準備完成"}</button>
    </form>
  );
}

function GroupSummary({ detail, solo = false }: { detail: GroupDetail; solo?: boolean }) {
  const complete = detail.summary.total > 0 && detail.summary.completed === detail.summary.total;
  const hasDateOverlap = !detail.summary.windowStart || !detail.summary.windowEnd || detail.summary.windowStart <= detail.summary.windowEnd;
  const summaryText = detail.summary.windowStart && detail.summary.windowEnd
    ? hasDateOverlap
      ? `${formatDate(detail.summary.windowStart)} 至 ${formatDate(detail.summary.windowEnd)} 可出發 · ${solo ? "預算上限" : "共同預算帶約"} ${money(detail.summary.budgetCeiling)}`
      : `日期沒有共同交集：最早可出發 ${formatFullDate(detail.summary.windowStart)}，最晚需回來 ${formatFullDate(detail.summary.windowEnd)}`
    : solo
      ? "填完條件後，就會顯示適合你的建議。"
      : "每個人送出條件並勾選準備完成後，才會出現找票按鈕。";
  return (
      <div className="group-summary"><div className={`summary-ring ${complete ? "complete" : ""}`}><strong>{detail.summary.completed}</strong><small>/{detail.summary.total}</small></div><div><span className="section-kicker">{solo ? "目前搜尋條件" : "全員準備狀態"}</span><h2>{solo ? "已完成個人條件" : complete ? "大家都準備好了" : `還差 ${detail.summary.total - detail.summary.completed} 人確認`}</h2><p>{summaryText}</p></div></div>
  );
}

function CalculationPanel({ solo }: { solo: boolean }) {
  return (
    <section className="calculation-panel" aria-label="偏好分數計算方式">
      <div><span className="calc-number">01</span><h3>先套用不能違反的條件</h3><p>日期必須有交集、天數必須容得下、目的地必須在所有人的範圍內，並遵守直飛或轉機上限。不符合就直接排除，不會靠分數補回來。</p></div>
      <div><span className="calc-number">02</span><h3>{solo ? "計算你的偏好吻合度" : "計算每位成員的偏好吻合度"}</h3><p>旅行風格占 45%、目的地層級占 45%、預算相對於目的地參考價占 10%。指定城市比只選洲別獲得更高的目的地吻合度。</p></div>
      <div><span className="calc-number">03</span><h3>{solo ? "換算成偏好分數" : "平均之外，也照顧最低分成員"}</h3><p>{solo ? "畫面分數是 62 分基礎值，加上偏好吻合結果換算；它是候選排序分數，不是成功機率。" : "團體分數＝62 分基礎值＋全員平均吻合度換算 23 分＋最低吻合成員換算 15 分，避免只照多數決犧牲其中一人。"}</p></div>
      <div><span className="calc-number">04</span><h3>即時航班另外驗證</h3><p>偏好分數不包含尚未查到的票價。三組日期會向 Google Flights 即時查價，有可售航班才成立，再依各目的地的實際票價排序日期。</p></div>
      <p className="calculation-note">這是透明的產品排序規則，不是 AI 猜測，也不是票價便宜機率。其他成員不會看到你的精確預算或個人分數。</p>
    </section>
  );
}

function VoteSummary({ detail }: { detail: GroupDetail }) {
  const tallies = detail.voting.tallies
    .map((tally) => ({ ...tally, candidate: detail.candidates.find((candidate) => candidate.id === tally.candidateId) }))
    .filter((tally) => tally.candidate);
  const leadingCount = Math.max(0, ...tallies.map((tally) => tally.count));
  const notVoted = detail.members
    .filter((member) => !detail.voting.votedUserIds.includes(member.userId))
    .map((member) => member.displayName);
  return (
    <section className="vote-summary" aria-label="旅團投票摘要">
      <div className="vote-summary-head"><div><span className="section-kicker">投票即時摘要</span><h3>{detail.voting.votersCount}/{detail.voting.totalMembers} 人已投票</h3></div><span className="multi-vote-note">每人可以複選</span></div>
      <div className="vote-tally-grid">
        {tallies.map((tally) => <div className={`vote-tally ${leadingCount > 0 && tally.count === leadingCount ? "leading" : ""}`} key={tally.candidateId}>
          <div><b>{tally.candidate?.destination}</b><strong>{tally.count} 票</strong></div>
          <div className="vote-dots" aria-label={`${tally.count} 票`}>{detail.members.map((member) => <span className={tally.voterUserIds.includes(member.userId) ? "filled" : ""} key={member.userId} title={member.displayName} />)}</div>
          <small>{tally.voterNames.length ? tally.voterNames.join("、") : "還沒有人選"}</small>
        </div>)}
      </div>
      <p>{notVoted.length ? `尚未投票：${notVoted.join("、")}` : "全員都已經投票；仍可繼續增選或取消。"}</p>
    </section>
  );
}

function CandidateCard({ candidate, rank, solo, selected, busy, origin, adults, onChoose }: { candidate: Candidate; rank: number; solo: boolean; selected: boolean; busy: boolean; origin: string; adults: number; onChoose: () => Promise<GroupDetail | null> }) {
  const airports = candidate.payload.airports?.length ? candidate.payload.airports : [{ code: candidate.payload.code, name: `${candidate.destination}主要機場` }];
  const sourceDateOptions = candidate.payload.dateOptions?.length ? candidate.payload.dateOptions : [{ departureDate: candidate.departureDate, returnDate: candidate.returnDate, matchType: "overlap" as const }];
  const serializedDateOptions = JSON.stringify(sourceDateOptions);
  const [airportCode, setAirportCode] = useState(airports[0].code);
  const selectedAirport = airports.find((airport) => airport.code === airportCode) ?? airports[0];
  const rankingContextKey = `${origin || "TPE"}:${selectedAirport.code}:${adults}:${candidate.payload.maxStops}:${serializedDateOptions}`;
  const [rankedDates, setRankedDates] = useState(() => sourceDateOptions.map((option, originalOrder) => ({ ...option, originalOrder, quote: { status: "loading" } as LiveQuote })));
  const [resolvedRankingKey, setResolvedRankingKey] = useState("");
  const [selectedDateKey, setSelectedDateKey] = useState(`${sourceDateOptions[0].departureDate}:${sourceDateOptions[0].returnDate}`);
  const visibleRankedDates = resolvedRankingKey === rankingContextKey ? rankedDates : sourceDateOptions.map((option, originalOrder) => ({ ...option, originalOrder, quote: { status: "loading" } as LiveQuote }));

  useEffect(() => {
    const controller = new AbortController();
    const options = JSON.parse(serializedDateOptions) as Array<{ departureDate: string; returnDate: string; matchType: "exact" | "overlap" }>;

    Promise.all(options.map(async (option, originalOrder) => {
      const quoteParams = new URLSearchParams({
        origin: origin || "TPE",
        destination: selectedAirport.code,
        departureDate: option.departureDate,
        returnDate: option.returnDate,
        adults: String(Math.max(1, adults)),
        directOnly: String(candidate.payload.maxStops === 0),
      });
      try {
        const result = await fetch(`/api/flights/quote?${quoteParams}`, { signal: controller.signal });
        const body = await result.json() as LiveQuote;
        const quote = result.ok ? body : { ...body, status: body.status === "unconfigured" ? "unconfigured" as const : "error" as const };
        return { ...option, originalOrder, quote };
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") throw error;
        return { ...option, originalOrder, quote: { status: "error" as const, error: "暫時無法取得即時報價" } };
      }
    })).then((results) => {
      const byAvailabilityAndPrice = (a: (typeof results)[number], b: (typeof results)[number]) => {
        const statusRank = (quote: LiveQuote) => quote.status === "live" ? 0 : quote.status === "no_direct" || quote.status === "no_results" ? 1 : 2;
        const statusDifference = statusRank(a.quote) - statusRank(b.quote);
        if (statusDifference) return statusDifference;
        if (a.quote.status === "live" && b.quote.status === "live") return (a.quote.price ?? Number.MAX_SAFE_INTEGER) - (b.quote.price ?? Number.MAX_SAFE_INTEGER);
        return a.originalOrder - b.originalOrder;
      };
      const sorted = candidate.payload.dateMode === "exact"
        ? [...results.filter((result) => result.matchType === "exact"), ...results.filter((result) => result.matchType !== "exact").sort(byAvailabilityAndPrice)]
        : [...results].sort(byAvailabilityAndPrice);
      if (controller.signal.aborted) return;
      setRankedDates(sorted);
      setResolvedRankingKey(rankingContextKey);
      const preferred = candidate.payload.dateMode === "exact" ? sorted[0] : sorted.find((result) => result.quote.status === "live") ?? sorted[0];
      if (preferred) setSelectedDateKey(`${preferred.departureDate}:${preferred.returnDate}`);
    }).catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setRankedDates(options.map((option, originalOrder) => ({ ...option, originalOrder, quote: { status: "error", error: "暫時無法取得即時報價" } as LiveQuote })));
        setResolvedRankingKey(rankingContextKey);
      }
    });
    return () => controller.abort();
  }, [adults, candidate.payload.dateMode, candidate.payload.maxStops, origin, rankingContextKey, selectedAirport.code, serializedDateOptions]);

  const selectedDateResult = visibleRankedDates.find((option) => `${option.departureDate}:${option.returnDate}` === selectedDateKey) ?? visibleRankedDates[0];
  const selectedDate = selectedDateResult ?? sourceDateOptions[0];
  const displayedQuote: LiveQuote = selectedDateResult?.quote ?? { status: "loading" };
  const liveDateCount = visibleRankedDates.filter((option) => option.quote.status === "live").length;

  const googleParams = new URLSearchParams({
    hl: "zh-TW",
    curr: "TWD",
    q: `${origin || "TPE"} 到 ${selectedAirport.code} ${selectedDate.departureDate} 至 ${selectedDate.returnDate}${candidate.payload.maxStops === 0 ? " 直飛" : ""}`,
  });
  const flightUrl = `https://www.google.com/travel/flights?${googleParams.toString()}`;
  const quoteTitle = displayedQuote.status === "loading"
    ? "正在查即時票價…"
    : displayedQuote.status === "live" && displayedQuote.price !== undefined
      ? money(displayedQuote.price)
      : displayedQuote.status === "no_direct"
        ? "這組日期沒有直飛"
        : displayedQuote.status === "no_results"
          ? "這組日期沒有可售航班"
          : displayedQuote.status === "unconfigured"
            ? "尚未連接即時資料源"
            : "即時查價暫時失敗";
  const quoteNote = displayedQuote.status === "live"
    ? `${displayedQuote.source} 即時結果${candidate.payload.maxStops === 0 ? " · 已驗證全程直飛" : ""} · 三組日期中 ${liveDateCount} 組有票 · ${displayedQuote.checkedAt ? new Date(displayedQuote.checkedAt).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" }) : "剛剛"}`
    : displayedQuote.status === "no_direct"
      ? "Google Flights 查無這組日期的去回程直飛；這個組合不成立"
      : displayedQuote.status === "no_results"
        ? "Google Flights 查無這組日期的可售航班；這個組合不成立"
    : displayedQuote.status === "unconfigured"
      ? "需放入 SerpApi API Key 後才會啟用"
      : "不以轉機價格代替直飛報價";
  return (
    <article className={`candidate-card ${selected ? "selected" : ""}`}>
      <div className="candidate-rank">0{rank}</div>
      <div className="candidate-main"><div className="destination"><span>{candidate.payload.emoji}</span><div><h3>{candidate.destination}</h3><p>{candidate.payload.country} · {selectedAirport.name}（{selectedAirport.code}）</p></div></div><p className="candidate-note">{candidate.payload.note}</p><div className="route-choices"><div><b>抵達哪座機場</b><span>{airports.map((airport) => <button key={airport.code} type="button" className={airport.code === selectedAirport.code ? "selected" : ""} onClick={() => setAirportCode(airport.code)}>{airport.name}<small>{airport.code}</small></button>)}</span></div><div><b>{candidate.payload.dateMode === "exact" ? "指定日期排第一；其他日期依即時票價排序" : "三組模糊日期自動查價，各目的地分別排名"}</b><span>{visibleRankedDates.map((option) => { const liveRank = visibleRankedDates.filter((candidateDate) => candidateDate.quote.status === "live").findIndex((candidateDate) => candidateDate.departureDate === option.departureDate && candidateDate.returnDate === option.returnDate) + 1; const optionKey = `${option.departureDate}:${option.returnDate}`; const optionLabel = option.matchType === "exact" ? "指定日期" : option.quote.status === "loading" ? "查價中" : option.quote.status === "live" ? `第 ${liveRank} 名 · ${money(option.quote.price ?? null)}` : option.quote.status === "no_direct" ? "沒有直飛" : option.quote.status === "no_results" ? "沒有可售航班" : "查價失敗"; return <button key={optionKey} type="button" className={`${optionKey === selectedDateKey ? "selected" : ""} ${option.quote.status === "live" ? "available" : "unavailable"}`} onClick={() => setSelectedDateKey(optionKey)}><small>{optionLabel}</small>{formatDate(option.departureDate)}–{formatDate(option.returnDate)}</button>; })}</span></div></div><div className="reason-list">{displayedQuote.status === "no_direct" || displayedQuote.status === "no_results" ? <><span>✕ {liveDateCount ? "目前選取的日期沒有符合條件的航班" : "三組日期都沒有符合條件的可售航班"}</span><small>{liveDateCount ? "請選上方標有即時價格的替代日期；目的地本身仍然有效。" : "這只代表目前三組日期的查價結果，不代表整段模糊期間完全沒有班機。"}</small></> : <>{candidate.payload.reasons.map((reason) => <span key={reason}>✓ {reason}</span>)}<small>{displayedQuote.status === "loading" ? "正在同時查詢三組日期並重新排名。" : "已依這個目的地的即時可售票價完成日期排名。"}</small></>}</div><div className="tag-row">{candidate.payload.styles.slice(0, 3).map((style) => <span key={style}>{styles.find((item) => item.id === style)?.label || style}</span>)}</div></div>
      <div className="fit-score"><span>{solo ? "個人偏好分數" : "團體偏好分數"}</span><strong>{candidate.fitScore}<small>/100</small></strong><i><b style={{ width: `${candidate.fitScore}%` }} /></i></div>
      <div className="candidate-action"><span>{candidate.payload.maxStops === 0 ? "每人來回直飛即時價" : "每人來回即時價"}</span><strong className={displayedQuote.status === "live" ? "" : "unverified-price"}>{quoteTitle}</strong><small>{quoteNote}<br />{selectedAirport.code} · {formatDate(selectedDate.departureDate)}–{formatDate(selectedDate.returnDate)}</small><a className="buy-link" href={displayedQuote.bookingUrl || flightUrl} target="_blank" rel="noopener noreferrer">{displayedQuote.status === "no_direct" || displayedQuote.status === "no_results" ? "在 Google Flights 查看相鄰日期" : "在 Google Flights 開啟這組航班"} ↗</a><button type="button" disabled={busy || displayedQuote.status !== "live"} onClick={() => void onChoose()}>{displayedQuote.status !== "live" ? "查到可售票價後才能選擇" : selected ? solo ? "已收藏 ✓" : "已投這票 ✓　點擊取消" : solo ? "收藏這個建議" : "投給這個選項"}</button></div>
    </article>
  );
}

function Footer() {
  return <footer><span className="footer-brand">隨飛</span><p>LINE 用來聊天，隨飛用來找到共同答案。</p><span>票價與購買由外部航班平台提供</span></footer>;
}

function LoadingScreen() {
  return <main className="loading-screen"><span className="brand-mark"><span /></span><b>正在整理旅行交集</b><i /></main>;
}
