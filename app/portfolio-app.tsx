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
  { id: "lazy", label: "è€å»¢", symbol: "â˜", hint: "å°‘ç§»å‹•ã€ç¡é£½å†èµ°" },
  { id: "nature", label: "è‡ªç„¶", symbol: "âŒ", hint: "å±±æµ·ã€æº«æ³‰ã€æ•£æ­¥" },
  { id: "food", label: "ç¾é£Ÿ", symbol: "â—’", hint: "å¸‚å ´ã€é¤å»³ã€å’–å•¡" },
  { id: "city", label: "åŸå¸‚", symbol: "â–¦", hint: "å±•è¦½ã€è¡—å€ã€å¤œæ™¯" },
  { id: "shopping", label: "è³¼ç‰©", symbol: "â—‡", hint: "é€›è¡—ã€é¸ç‰©ã€è£œè²¨" },
];

const continents = destinationContinents.map((item) => ({ id: item.id, label: localize(item.name) }));
const regions = destinationRegions.map((item) => ({ id: item.id, continent: item.continent, label: localize(item.name) }));
const countries = destinationCountries.map((item) => ({ id: item.id, region: item.region, label: localize(item.name) }));
const cities = destinations.map((item) => ({ id: item.code, country: item.countryCode, label: localize(item.cityName), airportCode: item.code, airportCount: item.airports.length, popularity: item.popularity }));

const leavePresets = [
  { id: "26-midautumn", year: 2026, title: "ä¸­ç§‹ï¼‹æ•™å¸«ç¯€", start: "2026-09-19", end: "2026-09-28", leave: "9/21â€“9/24", leaveDays: 4, totalDays: 10, minNights: 5, maxNights: 8, tone: "ç§‹å­£é•·ç·š" },
  { id: "26-national", year: 2026, title: "åœ‹æ…¶é€£å‡", start: "2026-10-03", end: "2026-10-11", leave: "10/5â€“10/8", leaveDays: 4, totalDays: 9, minNights: 5, maxNights: 8, tone: "ç§‹å­£å‡ºèµ°" },
  { id: "26-restoration", year: 2026, title: "å…‰å¾©ç¯€é€£å‡", start: "2026-10-24", end: "2026-11-01", leave: "10/27â€“10/30", leaveDays: 4, totalDays: 9, minNights: 5, maxNights: 8, tone: "æ¥“è‘‰æª”æœŸ" },
  { id: "26-crossyear", year: 2026, title: "è¡Œæ†²ï¼‹2027 å…ƒæ—¦", start: "2026-12-25", end: "2027-01-03", leave: "12/28â€“12/31", leaveDays: 4, totalDays: 10, minNights: 5, maxNights: 9, tone: "è·¨å¹´æœ€åˆ’ç®—" },
  { id: "27-newyear", year: 2027, title: "å…ƒæ—¦é€£å‡", start: "2027-01-01", end: "2027-01-10", leave: "1/4â€“1/8", leaveDays: 5, totalDays: 10, minNights: 5, maxNights: 9, tone: "æ–°å¹´ç¬¬ä¸€é£›" },
  { id: "27-spring", year: 2027, title: "è¾²æ›†æ˜¥ç¯€", start: "2027-02-04", end: "2027-02-14", leave: "2/11â€“2/12", leaveDays: 2, totalDays: 11, minNights: 6, maxNights: 10, tone: "è«‹ 2 ä¼‘ 11" },
  { id: "27-peace", year: 2027, title: "å’Œå¹³ç´€å¿µæ—¥", start: "2027-02-27", end: "2027-03-07", leave: "3/2â€“3/5", leaveDays: 4, totalDays: 9, minNights: 5, maxNights: 8, tone: "åˆæ˜¥é•·å‡" },
  { id: "27-qingming", year: 2027, title: "å…’ç«¥ï¼‹æ¸…æ˜", start: "2027-04-03", end: "2027-04-11", leave: "4/7â€“4/9", leaveDays: 3, totalDays: 9, minNights: 5, maxNights: 8, tone: "è«‹ 3 ä¼‘ 9" },
  { id: "27-dragon", year: 2027, title: "ç«¯åˆç¯€", start: "2027-06-05", end: "2027-06-09", leave: "6/7â€“6/8", leaveDays: 2, totalDays: 5, minNights: 3, maxNights: 4, tone: "çŸ­ç¨‹å‰›å¥½" },
  { id: "27-midautumn", year: 2027, title: "ä¸­ç§‹ç¯€", start: "2027-09-11", end: "2027-09-15", leave: "9/13â€“9/14", leaveDays: 2, totalDays: 5, minNights: 3, maxNights: 4, tone: "è«‹ 2 ä¼‘ 5" },
  { id: "27-teacher", year: 2027, title: "æ•™å¸«ç¯€", start: "2027-09-25", end: "2027-09-28", leave: "9/27", leaveDays: 1, totalDays: 4, minNights: 2, maxNights: 3, tone: "è«‹ 1 ä¼‘ 4" },
  { id: "27-national", year: 2027, title: "åœ‹æ…¶é€£å‡", start: "2027-10-09", end: "2027-10-17", leave: "10/12â€“10/15", leaveDays: 4, totalDays: 9, minNights: 5, maxNights: 8, tone: "ç§‹å­£é•·ç·š" },
  { id: "27-restoration", year: 2027, title: "å…‰å¾©ç¯€é€£å‡", start: "2027-10-23", end: "2027-10-31", leave: "10/26â€“10/29", leaveDays: 4, totalDays: 9, minNights: 5, maxNights: 8, tone: "è³æ¥“é¦–é¸" },
  { id: "27-crossyear", year: 2027, title: "è¡Œæ†²ï¼‹2028 å…ƒæ—¦", start: "2027-12-24", end: "2028-01-02", leave: "12/27â€“12/30", leaveDays: 4, totalDays: 10, minNights: 5, maxNights: 9, tone: "è·¨å¹´æœ€åˆ’ç®—" },
] as const;

const statusLabels: Record<string, string> = {
  collecting: "æ”¶é›†ä¸­",
  matching: "å·²å®Œæˆè¨ˆç®—",
  decided: "å·²æ±ºå®š",
  archived: "å·²å°å­˜",
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
  if (!value) return "å°šæœªç”¢ç”Ÿ";
  return new Intl.DateTimeFormat("zh-TW", { month: "numeric", day: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function formatFullDate(value: string | null) {
  if (!value) return "å°šæœªç”¢ç”Ÿ";
  return new Intl.DateTimeFormat("zh-TW", { year: "numeric", month: "numeric", day: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function money(value: number | null) {
  return value === null ? "â€”" : `NT$ ${new Intl.NumberFormat("zh-TW").format(value)}`;
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
  if (!response.ok) throw new Error(data.error || "æ“ä½œæ²’æœ‰å®Œæˆ");
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
      setError(caught instanceof Error ? caught.message : "æš«æ™‚ç„¡æ³•è¼‰å…¥");
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
      setError(caught instanceof Error ? caught.message : "æ‰¾ä¸åˆ°æ—…åœ˜");
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
      setError(caught instanceof Error ? caught.message : "æ“ä½œæ²’æœ‰å®Œæˆ");
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
      setNotice(action === "disband" ? "æ—…åœ˜å·²è§£æ•£" : "ä½ å·²é€€å‡ºæ—…åœ˜");
      window.setTimeout(() => document.getElementById("my-groups")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "æ“ä½œæ²’æœ‰å®Œæˆ");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function startSoloSearch() {
    await postAction({ action: "create", kind: "solo", name: "æˆ‘çš„å€‹äººæœå°‹" });
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
    const message = `${detail.group.name} çš„å”¯ä¸€åŠ å…¥é€£çµ\nä¸ç”¨ç™»å…¥ï¼Œå¡«ä¸€å€‹æš±ç¨±å°±èƒ½ä¸€èµ·æ±ºå®šå»å“ªè£¡ï¼š\n${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: detail.group.name, text: "ä¸ç”¨ç™»å…¥ï¼Œå¡«ä¸€å€‹æš±ç¨±å°±èƒ½ä¸€èµ·æ±ºå®šå»å“ªè£¡ã€‚", url });
        setNotice("å·²é–‹å•Ÿåˆ†äº«é¸å–®");
      } else {
        await navigator.clipboard.writeText(message);
        setNotice("å”¯ä¸€åŠ å…¥é€£çµå·²è¤‡è£½");
      }
    } catch {
      // The user may close the native share sheet; no error state is needed.
    }
  }

  if (loading) return <LoadingScreen />;

  return (
    <main className="app-shell">
      <Topbar workspaceKind={detail?.group.kind ?? null} onHome={goHome} onMyGroups={goToMyGroups} />
      {error && <div className="toast error-toast" role="alert">{error}<button onClick={() => setError("")} aria-label="é—œé–‰">Ã—</button></div>}
      {notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice("")} aria-label="é—œé–‰">Ã—</button></div>}

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
      <button className="brand" type="button" onClick={onHome} aria-label="å›åˆ°éš¨é£›é¦–é ">
        <span className="brand-mark"><span /></span><b>éš¨é£›</b><small>éš¨æ€§å‡ºç™¼</small>
      </button>
      <div className="topbar-note"×M|æÚ$z{-®éÜj×˜X{®j)ŞK»nKŠnX»î˜k©nX)ZèÎh‰[èÎûÈÎh˜ŞiÈ>X{®xûîh›îzZhÈ˜‰^8"#°¢&WGW&â€¢ÆF—b6Æ74æÖSÒ&w&÷W×7VÖÖ'’#ãÆF—b6Æ74æÖS×¶7VÖÖ'’×&–ærG¶6ö×ÆWFRò&6ö×ÆWFR"¢"'ÖÓãÇ7G&öæsç¶FWF–Âç7VÖÖ'’æ6ö×ÆWFVGÓÂ÷7G&öæsãÇ6ÖÆÃâ÷¶FWF–Âç7VÖÖ'’çF÷FÇÓÂ÷6ÖÆÃãÂöF—cãÆF—cãÇ7â6Æ74æÖSÒ'6V7F–öâÖ¶–6¶W"#ç·6öÆòò.yºîX˜Şi	Î[¾j)ŞK»b"¢.XZY:k©nX)x¸hX²'ÓÂ÷7ããÆƒ#ç·6öÆòò.[{.ZèÎh‰X¾K«®j)ŞK»b"¢6ö×ÆWFRò.ZJ~Zën˜;Şk©nX)Z[ŞK¨b"¢˜(N[zâG¶FWF–Âç7VÖÖ'’çF÷FÂÒFWF–Âç7VÖÖ'’æ6ö×ÆWFVGÒK«®z+®Š¨ÖÓÂöƒ#ãÇç·7VÖÖ'•FW‡GÓÂ÷ãÂöF—cãÂöF—cà¢“°§Ğ ¦gVæ7F–öâ6Æ7VÆF–öåæVÂ‡²6öÆòÓ¢²6öÆó¢&ööÆVâÒ’°¢&WGW&â€¢Ç6V7F–öâ6Æ74æÖSÒ&6Æ7VÆF–öâ×æVÂ"&–ÖÆ&VÃÒ.XşZ[ŞXˆni[Šˆzé~ik[Èò#à¢ÆF—cãÇ7â6Æ74æÖSÒ&6Æ2ÖçVÖ&W"#ãÂ÷7ããÆƒ3îXXZY~yJKˆŞˆ;Ş˜^XøŞy¨Nj)ŞK»cÂöƒ3ãÇîiz^iÉş[ø^šiÈKªN™¸n8ZJi[[ø^šZë[é~Kˆ¾8yºîy¨NYË[ø^šYÊh˜iÈK«®y¨NzøNYÈŞXZ~ûÈÎKŠn˜^Zèy»Nš9¾h‰n‹Øj™şKˆ®™™8.KˆŞzÊnY[y»Nhê^hé.™šNûÈÎKˆŞiÈ>™ÚXˆni[Š9ÎY¹îKèn8#Â÷ãÂöF—cà¢ÆF—cãÇ7â6Æ74æÖSÒ&6Æ2ÖçVÖ&W"#ã#Â÷7ããÆƒ3ç·6öÆòò.Šˆzé~KÚy¨NXşZ[ŞY¾Y[ªb"¢.Šˆzé~jøşKØŞh‰Y:y¨NXşZ[ŞY¾Y[ªb'ÓÂöƒ3ãÇîix^ŠÎš*jÎXÚCR^8yºîy¨NYË[N{I®XÚCR^8š	zé~y»[ŞikÎyºîy¨NYËXø>ˆ>X;XÚ^8.hÈ~Zé®Yøî[ˆ.jùNXú®˜kK.XŠ^xÛ.[é~i»Nš¹y¨Nyºîy¨NYËY¾Y[ªn8#Â÷ãÂöF—cà¢ÆF—cãÇ7â6Æ74æÖSÒ&6Æ2ÖçVÖ&W"#ã3Â÷7ããÆƒ3ç·6öÆòò.hù¾zé~h‰XşZ[ŞXˆni[‚"¢.[›>YØ~K˜¾ZInûÈÎK™şxZ~š~iÈKØîXˆnh‰Y:'ÓÂöƒ3ãÇç·6öÆòò.yZ¾™Ú.Xˆni[iŠòc"XˆnYû®zHîXÎûÈÎXªKˆ®XşZ[ŞY¾Y{YiéÎhù¾zé~ûÉ¾Zè>iŠşX	˜hé.[¨şXˆni[ûÈÎKˆŞiŠşh‰X©şj™şxè~8""¢.YÉš¹NXˆni[ûÉÓc"XˆnYû®zHîXÎûÈ¾XZY:[›>YØ~Y¾Y[ªnhù¾zér#2XˆnûÈ¾iÈKØîY¾Yh‰Y:hù¾zérRXˆnûÈÎ˜şXXŞXú®xZ~ZI®i[k®xª~x›.X[nKŠŞKˆK«®8"'ÓÂ÷ãÂöF—cà¢ÆF—cãÇ7â6Æ74æÖSÒ&6Æ2ÖçVÖ&W"#ãCÂ÷7ããÆƒ3îXÛ>i˜.ˆŠ®xúŞXúnZInš™~ŠØ“Âöƒ3ãÇîXşZ[ŞXˆni[KˆŞXÈ^Y
¾[	®iÊ®iú^X‹y¨NzZX;8.Kˆ{XNiz^iÉşiÈ>Y	vöövÆRfÆ–v‡G2XÛ>i˜.iú^X;ûÈÎiÈXúşYJîˆŠ®xúŞh˜Şh‰z¸¾ûÈÎXhŞKéŞYNyºîy¨NYËy¨NZún™©¾zZX;hé.[¨şiz^iÉş8#Â÷ãÂöF—cà¢Ç6Æ74æÖSÒ&6Æ7VÆF–öâÖæ÷FR#î˜	iŠş˜şiˆîy¨NyJ.Y8hé.[¨şŠhşX˜~ûÈÎKˆŞiŠò’xÉÎkŠÎûÈÎK™şKˆŞiŠşzZX;KëşZéÎj™şxè~8.X[nK¹nh‰Y:KˆŞiÈ>yÈ¾X‹KÚy¨N{+îz+®š	zé~h‰nX¾K«®Xˆni[8#Â÷à¢Â÷6V7F–öãà¢“°§Ğ ¦gVæ7F–öâf÷FU7VÖÖ'’‡²FWF–ÂÓ¢²FWF–Ã¢w&÷WFWF–ÂÒ’°¢6öç7BFÆÆ–W2ÒFWF–Âçf÷F–ærçFÆÆ–W0¢æÖ‚‡FÆÇ’’Óâ‡²ââçFÆÇ’Â6æF–FFS¢FWF–Âæ6æF–FFW2æf–æB‚†6æF–FFR’Óâ6æF–FFRæ–BÓÓÒFÆÇ’æ6æF–FFT–B’Ò’¢æf–ÇFW"‚‡FÆÇ’’ÓâFÆÇ’æ6æF–FFR“°¢6öç7BÆVF–æt6÷VçBÒÖF‚æÖ‚ƒÂââçFÆÆ–W2æÖ‚‡FÆÇ’’ÓâFÆÇ’æ6÷VçB’“°¢6öç7Bæ÷Ef÷FVBÒFWF–ÂæÖVÖ&W'0¢æf–ÇFW"‚†ÖVÖ&W"’ÓâFWF–Âçf÷F–ærçf÷FVEW6W$–G2æ–æ6ÇVFW2†ÖVÖ&W"çW6W$–B’¢æÖ‚†ÖVÖ&W"’ÓâÖVÖ&W"æF—7Æ”æÖR“°¢&WGW&â€¢Ç6V7F–öâ6Æ74æÖSÒ'f÷FR×7VÖÖ'’"&–ÖÆ&VÃÒ.ix^YÉh©^zZiŠh#à¢ÆF—b6Æ74æÖSÒ'f÷FR×7VÖÖ'’Ö†VB#ãÆF—cãÇ7â6Æ74æÖSÒ'6V7F–öâÖ¶–6¶W"#îh©^zZXÛ>i˜.iŠhÂ÷7ããÆƒ3ç¶FWF–Âçf÷F–ærçf÷FW'46÷VçGÒ÷¶FWF–Âçf÷F–ærçF÷FÄÖVÖ&W'7ÒK«®[{.h©^zZƒÂöƒ3ãÂöF—cãÇ7â6Æ74æÖSÒ&×VÇF’×f÷FRÖæ÷FR#îjøşK«®XúşKº^ŠH~˜ƒÂ÷7ããÂöF—cà¢ÆF—b6Æ74æÖSÒ'f÷FR×FÆÇ’Öw&–B#à¢·FÆÆ–W2æÖ‚‡FÆÇ’’ÓâÆF—b6Æ74æÖS×¶f÷FR×FÆÇ’G¶ÆVF–æt6÷VçBâbbFÆÇ’æ6÷VçBÓÓÒÆVF–æt6÷VçBò&ÆVF–ær"¢"'ÖÒ¶W“×·FÆÇ’æ6æF–FFT–GÓà¢ÆF—cãÆ#ç·FÆÇ’æ6æF–FFSòæFW7F–æF–öçÓÂö#ãÇ7G&öæsç·FÆÇ’æ6÷VçGÒzZƒÂ÷7G&öæsãÂöF—cà¢ÆF—b6Æ74æÖSÒ'f÷FRÖF÷G2"&–ÖÆ&VÃ×¶G·FÆÇ’æ6÷VçGÒzZ†Óç¶FWF–ÂæÖVÖ&W'2æÖ‚†ÖVÖ&W"’ÓâÇ7â6Æ74æÖS×·FÆÇ’çf÷FW%W6W$–G2æ–æ6ÇVFW2†ÖVÖ&W"çW6W$–B’ò&f–ÆÆVB"¢"'Ò¶W“×¶ÖVÖ&W"çW6W$–GÒF—FÆS×¶ÖVÖ&W"æF—7Æ”æÖWÒóâ—ÓÂöF—cà¢Ç6ÖÆÃç·FÆÇ’çf÷FW$æÖW2æÆVæwF‚òFÆÇ’çf÷FW$æÖW2æ¦ö–â‚.8"’¢.˜(Nk).iÈK«®˜‚'ÓÂ÷6ÖÆÃà¢ÂöF—câ—Ğ¢ÂöF—cà¢Çç¶æ÷Ef÷FVBæÆVæwF‚ò[	®iÊ®h©^zZûÉ¢G¶æ÷Ef÷FVBæ¦ö–â‚.8"—Ö¢.XZY:˜;Ş[{.{i>h©^zZûÉ¾K¸ŞXúş{›Î{¨ÎZ)î˜h‰nXùnkh8"'ÓÂ÷à¢Â÷6V7F–öãà¢“°§Ğ ¦gVæ7F–öâ6æF–FFT6&B‡²6æF–FFRÂ&æ²Â6öÆòÂ6VÆV7FVBÂ'W7’Â÷&–v–âÂGVÇG2Âöä6†ö÷6RÓ¢²6æF–FFS¢6æF–FFS²&æ³¢çVÖ&W#²6öÆó¢&ööÆVã²6VÆV7FVC¢&ööÆVã²'W7“¢&ööÆVã²÷&–v–ã¢7G&–æs²GVÇG3¢çVÖ&W#²öä6†ö÷6S¢‚’Óâ&öÖ—6SÄw&÷WFWF–ÂÂçVÆÃâÒ’°¢6öç7B—'÷'G2Ò6æF–FFRç–ÆöBæ—'÷'G3òæÆVæwF‚ò6æF–FFRç–ÆöBæ—'÷'G2¢·²6öFS¢6æF–FFRç–ÆöBæ6öFRÂæÖS¢G¶6æF–FFRæFW7F–æF–öçŞK‹¾Šhj™şZFÕÓ°¢6öç7B6÷W&6TFFT÷F–öç2Ò6æF–FFRç–ÆöBæFFT÷F–öç3òæÆVæwF‚ò6æF–FFRç–ÆöBæFFT÷F–öç2¢·²FW'GW&TFFS¢6æF–FFRæFW'GW&TFFRÂ&WGW&äFFS¢6æF–FFRç&WGW&äFFRÂÖF6…G—S¢&÷fW&Æ"26öç7BÕÓ°¢6öç7B6W&–Æ—¦VDFFT÷F–öç2Ò¥4ôâç7G&–æv–g’‡6÷W&6TFFT÷F–öç2“°¢6öç7B¶—'÷'D6öFRÂ6WD—'÷'D6öFUÒÒW6U7FFR†—'÷'G5³Òæ6öFR“°¢6öç7B6VÆV7FVD—'÷'BÒ—'÷'G2æf–æB‚†—'÷'B’Óâ—'÷'Bæ6öFRÓÓÒ—'÷'D6öFR’óò—'÷'G5³Ó°¢6öç7B&æ¶–æt6öçFW‡D¶W’ÒG¶÷&–v–âÇÂ%ER'Ó¢G·6VÆV7FVD—'÷'Bæ6öFWÓ¢G¶GVÇG7Ó¢G¶6æF–FFRç–ÆöBæÖ…7F÷7Ó¢G·6W&–Æ—¦VDFFT÷F–öç7Ö°¢6öç7B·&æ¶VDFFW2Â6WE&æ¶VDFFW5ÒÒW6U7FFR‚‚’Óâ6÷W&6TFFT÷F–öç2æÖ‚†÷F–öâÂ÷&–v–æÄ÷&FW"’Óâ‡²ââæ÷F–öâÂ÷&–v–æÄ÷&FW"ÂV÷FS¢²7FGW3¢&ÆöF–ær"Ò2Æ—fUV÷FRÒ’’“°¢6öç7B·&W6öÇfVE&æ¶–æt¶W’Â6WE&W6öÇfVE&æ¶–æt¶W•ÒÒW6U7FFR‚""“°¢6öç7B·6VÆV7FVDFFT¶W’Â6WE6VÆV7FVDFFT¶W•ÒÒW6U7FFR†G·6÷W&6TFFT÷F–öç5³ÒæFW'GW&TFFWÓ¢G·6÷W&6TFFT÷F–öç5³Òç&WGW&äFFWÖ“°¢6öç7Bf—6–&ÆU&æ¶VDFFW2Ò&W6öÇfVE&æ¶–æt¶W’ÓÓÒ&æ¶–æt6öçFW‡D¶W’ò&æ¶VDFFW2¢6÷W&6TFFT÷F–öç2æÖ‚†÷F–öâÂ÷&–v–æÄ÷&FW"’Óâ‡²ââæ÷F–öâÂ÷&–v–æÄ÷&FW"ÂV÷FS¢²7FGW3¢&ÆöF–ær"Ò2Æ—fUV÷FRÒ’“° ¢W6TVffV7B‚‚’Óâ°¢6öç7B6öçG&öÆÆW"ÒæWr&÷'D6öçG&öÆÆW"‚“°¢6öç7B÷F–öç2Ò¥4ôâç'6R‡6W&–Æ—¦VDFFT÷F–öç2’2'&“Ç²FW'GW&TFFS¢7G&–æs²&WGW&äFFS¢7G&–æs²ÖF6…G—S¢&W†7B"Â&÷fW&Æ"Óã° ¢&öÖ—6RæÆÂ†÷F–öç2æÖ†7–æ2†÷F–öâÂ÷&–v–æÄ÷&FW"’Óâ°¢6öç7BV÷FU&×2ÒæWrU$Å6V&6…&×2‡°¢÷&–v–ã¢÷&–v–âÇÂ%ER"À¢FW7F–æF–öã¢6VÆV7FVD—'÷'Bæ6öFRÀ¢FW'GW&TFFS¢÷F–öâæFW'GW&TFFRÀ¢&WGW&äFFS¢÷F–öâç&WGW&äFFRÀ¢GVÇG3¢7G&–ær„ÖF‚æÖ‚ƒÂGVÇG2’’À¢F—&V7DöæÇ“¢7G&–ær†6æF–FFRç–ÆöBæÖ…7F÷2ÓÓÒ’À¢Ò“°¢G'’°¢6öç7B&W7VÇBÒv—BfWF6‚†ö’öfÆ–v‡G2÷V÷FSòG·V÷FU&×7ÖÂ²6–væÃ¢6öçG&öÆÆW"ç6–væÂÒ“°¢6öç7B&öG’Òv—B&W7VÇBæ§6öâ‚’2Æ—fUV÷FS°¢6öç7BV÷FRÒ&W7VÇBæö²ò&öG’¢²ââæ&öG’Â7FGW3¢&öG’ç7FGW2ÓÓÒ'Væ6öæf–wW&VB"ò'Væ6öæf–wW&VB"26öç7B¢&W'&÷""26öç7BÓ°¢&WGW&â²ââæ÷F–öâÂ÷&–v–æÄ÷&FW"ÂV÷FRÓ°¢Ò6F6‚†W'&÷#¢Væ¶æ÷vâ’°¢–b†W'&÷"–ç7Fæ6VöbDôÔW†6WF–öâbbW'&÷"ææÖRÓÓÒ$&÷'DW'&÷""’F‡&÷rW'&÷#°¢&WGW&â²ââæ÷F–öâÂ÷&–v–æÄ÷&FW"ÂV÷FS¢²7FGW3¢&W'&÷""26öç7BÂW'&÷#¢.iª¾i˜.xJk9^Xùn[é~XÛ>i˜.ZX;’"ÒÓ°¢Ğ¢Ò’’çF†Vâ‚‡&W7VÇG2’Óâ°¢6öç7B'”f–Æ&–Æ—G”æE&–6RÒ†¢‡G—Vöb&W7VÇG2•¶çVÖ&W%ÒÂ#¢‡G—Vöb&W7VÇG2•¶çVÖ&W%Ò’Óâ°¢6öç7B7FGW5&æ²Ò‡V÷FS¢Æ—fUV÷FR’ÓâV÷FRç7FGW2ÓÓÒ&Æ—fR"ò¢V÷FRç7FGW2ÓÓÒ&æõöF—&V7B"ÇÂV÷FRç7FGW2ÓÓÒ&æõ÷&W7VÇG2"ò¢#°¢6öç7B7FGW4F–ffW&Væ6RÒ7FGW5&æ²†çV÷FR’Ò7FGW5&æ²†"çV÷FR“°¢–b‡7FGW4F–ffW&Væ6R’&WGW&â7FGW4F–ffW&Væ6S°¢–b†çV÷FRç7FGW2ÓÓÒ&Æ—fR"bb"çV÷FRç7FGW2ÓÓÒ&Æ—fR"’&WGW&â†çV÷FRç&–6RóòçVÖ&W"äÔ…õ4dUô”åDTtU"’Ò†"çV÷FRç&–6RóòçVÖ&W"äÔ…õ4dUô”åDTtU"“°¢&WGW&âæ÷&–v–æÄ÷&FW"Ò"æ÷&–v–æÄ÷&FW#°¢Ó°¢6öç7B6÷'FVBÒ6æF–FFRç–ÆöBæFFTÖöFRÓÓÒ&W†7B ¢ò²ââç&W7VÇG2æf–ÇFW"‚‡&W7VÇB’Óâ&W7VÇBæÖF6…G—RÓÓÒ&W†7B"’Âââç&W7VÇG2æf–ÇFW"‚‡&W7VÇB’Óâ&W7VÇBæÖF6…G—RÓÒ&W†7B"’ç6÷'B†'”f–Æ&–Æ—G”æE&–6R•Ğ¢¢²ââç&W7VÇG5Òç6÷'B†'”f–Æ&–Æ—G”æE&–6R“°¢–b†6öçG&öÆÆW"ç6–væÂæ&÷'FVB’&WGW&ã°¢6WE&æ¶VDFFW2‡6÷'FVB“°¢6WE&W6öÇfVE&æ¶–æt¶W’‡&æ¶–æt6öçFW‡D¶W’“°¢6öç7B&VfW'&VBÒ6æF–FFRç–ÆöBæFFTÖöFRÓÓÒ&W†7B"ò6÷'FVE³Ò¢6÷'FVBæf–æB‚‡&W7VÇB’Óâ&W7VÇBçV÷FRç7FGW2ÓÓÒ&Æ—fR"’óò6÷'FVE³Ó°¢–b‡&VfW'&VB’6WE6VÆV7FVDFFT¶W’†G·&VfW'&VBæFW'GW&TFFWÓ¢G·&VfW'&VBç&WGW&äFFWÖ“°¢Ò’æ6F6‚‚†W'&÷#¢Væ¶æ÷vâ’Óâ°¢–b‚†W'&÷"–ç7Fæ6VöbDôÔW†6WF–öâbbW'&÷"ææÖRÓÓÒ$&÷'DW'&÷""’’°¢6WE&æ¶VDFFW2†÷F–öç2æÖ‚†÷F–öâÂ÷&–v–æÄ÷&FW"’Óâ‡²ââæ÷F–öâÂ÷&–v–æÄ÷&FW"ÂV÷FS¢²7FGW3¢&W'&÷""ÂW'&÷#¢.iª¾i˜.xJk9^Xùn[é~XÛ>i˜.ZX;’"Ò2Æ—fUV÷FRÒ’’“°¢6WE&W6öÇfVE&æ¶–æt¶W’‡&æ¶–æt6öçFW‡D¶W’“°¢Ğ¢Ò“°¢&WGW&â‚’Óâ6öçG&öÆÆW"æ&÷'B‚“°¢ÒÂ¶GVÇG2Â6æF–FFRç–ÆöBæFFTÖöFRÂ6æF–FFRç–ÆöBæÖ…7F÷2Â÷&–v–âÂ&æ¶–æt6öçFW‡D¶W’Â6VÆV7FVD—'÷'Bæ6öFRÂ6W&–Æ—¦VDFFT÷F–öç5Ò“° ¢6öç7B6VÆV7FVDFFU&W7VÇBÒf—6–&ÆU&æ¶VDFFW2æf–æB‚†÷F–öâ’ÓâG¶÷F–öâæFW'GW&TFFWÓ¢G¶÷F–öâç&WGW&äFFWÖÓÓÒ6VÆV7FVDFFT¶W’’óòf—6–&ÆU&æ¶VDFFW5³Ó°¢6öç7B6VÆV7FVDFFRÒ6VÆV7FVDFFU&W7VÇBóò6÷W&6TFFT÷F–öç5³Ó°¢6öç7BF—7Æ–VEV÷FS¢Æ—fUV÷FRÒ6VÆV7FVDFFU&W7VÇCòçV÷FRóò²7FGW3¢&ÆöF–ær"Ó°¢6öç7BÆ—fTFFT6÷VçBÒf—6–&ÆU&æ¶VDFFW2æf–ÇFW"‚†÷F–öâ’Óâ÷F–öâçV÷FRç7FGW2ÓÓÒ&Æ—fR"’æÆVæwFƒ° ¢6öç7BvöövÆU&×2ÒæWrU$Å6V&6…&×2‡°¢†Ã¢'¦‚ÕEr"À¢7W'#¢%EtB"À¢¢G¶÷&–v–âÇÂ%ER'ÒX‹G·6VÆV7FVD—'÷'Bæ6öFWÒG·6VÆV7FVDFFRæFW'GW&TFFWÒˆ{2G·6VÆV7FVDFFRç&WGW&äFFWÒG¶6æF–FFRç–ÆöBæÖ…7F÷2ÓÓÒò"y»Nš9²"¢"'ÖÀ¢Ò“°¢6öç7BfÆ–v‡EW&ÂÒ‡GG3¢ò÷wwrævöövÆRæ6öÒ÷G&fVÂöfÆ–v‡G3òG¶vöövÆU&×2çFõ7G&–ær‚—Ö°¢6öç7BV÷FUF—FÆRÒF—7Æ–VEV÷FRç7FGW2ÓÓÒ&ÆöF–ær ¢ò.jÚ>YÊiú^XÛ>i˜.zZX;(
b ¢¢F—7Æ–VEV÷FRç7FGW2ÓÓÒ&Æ—fR"bbF—7Æ–VEV÷FRç&–6RÓÒVæFVf–æV@¢òÖöæW’†F—7Æ–VEV÷FRç&–6R¢¢F—7Æ–VEV÷FRç7FGW2ÓÓÒ&æõöF—&V7B ¢ò.˜	{XNiz^iÉşk).iÈy»Nš9² ¢¢F—7Æ–VEV÷FRç7FGW2ÓÓÒ&æõ÷&W7VÇG2 ¢ò.˜	{XNiz^iÉşk).iÈXúşYJîˆŠ®xúÒ ¢¢F—7Æ–VEV÷FRç7FGW2ÓÓÒ'Væ6öæf–wW&VB ¢ò.[	®iÊ®˜
>hê^XÛ>i˜.‹8~iik© ¢¢.XÛ>i˜.iú^X;iª¾i˜.ZKiYr#°¢6öç7BV÷FTæ÷FRÒF—7Æ–VEV÷FRç7FGW2ÓÓÒ&Æ—fR ¢òG¶F—7Æ–VEV÷FRç6÷W&6WÒXÛ>i˜.{YiéÂG¶6æF–FFRç–ÆöBæÖ…7F÷2ÓÓÒò"+r[{.š™~ŠØXZzˆ¾y»Nš9²"¢"'Ò+rKˆ{XNiz^iÉşKŠÒG¶Æ—fTFFT6÷VçGÒ{XNiÈzZ‚+rG¶F—7Æ–VEV÷FRæ6†V6¶VDBòæWrFFR†F—7Æ–VEV÷FRæ6†V6¶VDB’çFôÆö6ÆUF–ÖU7G&–ær‚'¦‚ÕEr"Â²†÷W#¢#"ÖF–v—B"ÂÖ–çWFS¢#"ÖF–v—B"Ò’¢.X™¾X™²'Ö ¢¢F—7Æ–VEV÷FRç7FGW2ÓÓÒ&æõöF—&V7B ¢ò$vöövÆRfÆ–v‡G2iú^xJ˜	{XNiz^iÉşy¨NXë¾Y¹îzˆ¾y»Nš9¾ûÉ¾˜	X¾{XNYKˆŞh‰z¸² ¢¢F—7Æ–VEV÷FRç7FGW2ÓÓÒ&æõ÷&W7VÇG2 ¢ò$vöövÆRfÆ–v‡G2iú^xJ˜	{XNiz^iÉşy¨NXúşYJîˆŠ®xúŞûÉ¾˜	X¾{XNYKˆŞh‰z¸² ¢¢F—7Æ–VEV÷FRç7FGW2ÓÓÒ'Væ6öæf–wW&VB ¢ò.™ÈiKîXZR6W'’’¶W’[èÎh˜ŞiÈ>YYşyJ‚ ¢¢.KˆŞKº^‹Øj™şX;jÎKº>i»şy»Nš9¾ZX;’#°¢&WGW&â€¢Æ'F–6ÆR6Æ74æÖS×¶6æF–FFRÖ6&BG·6VÆV7FVBò'6VÆV7FVB"¢"'ÖÓà¢ÆF—b6Æ74æÖSÒ&6æF–FFR×&æ²#ã·&æ·ÓÂöF—cà¢ÆF—b6Æ74æÖSÒ&6æF–FFRÖÖ–â#ãÆF—b6Æ74æÖSÒ&FW7F–æF–öâ#ãÇ7ãç¶6æF–FFRç–ÆöBæVÖö¦—ÓÂ÷7ããÆF—cãÆƒ3ç¶6æF–FFRæFW7F–æF–öçÓÂöƒ3ãÇç¶6æF–FFRç–ÆöBæ6÷VçG'—Ò+r·6VÆV7FVD—'÷'BææÖWŞûÈ‡·6VÆV7FVD—'÷'Bæ6öFWŞûÈ“Â÷ãÂöF—cãÂöF—cãÇ6Æ74æÖSÒ&6æF–FFRÖæ÷FR#ç¶6æF–FFRç–ÆöBææ÷FWÓÂ÷ãÆF—b6Æ74æÖSÒ'&÷WFRÖ6†ö–6W2#ãÆF—cãÆ#îh«^˜NY:®[ª~j™şZCÂö#ãÇ7ãç¶—'÷'G2æÖ‚†—'÷'B’ÓâÆ'WGFöâ¶W“×¶—'÷'Bæ6öFWÒG—SÒ&'WGFöâ"6Æ74æÖS×¶—'÷'Bæ6öFRÓÓÒ6VÆV7FVD—'÷'Bæ6öFRò'6VÆV7FVB"¢"'Òöä6Æ–6³×²‚’Óâ6WD—'÷'D6öFR†—'÷'Bæ6öFR—Óç¶—'÷'BææÖWÓÇ6ÖÆÃç¶—'÷'Bæ6öFWÓÂ÷6ÖÆÃãÂö'WGFöãâ—ÓÂ÷7ããÂöF—cãÆF—cãÆ#ç¶6æF–FFRç–ÆöBæFFTÖöFRÓÓÒ&W†7B"ò.hÈ~Zé®iz^iÉşhé.zÊÎKˆûÉ¾X[nK¹niz^iÉşKéŞXÛ>i˜.zZX;hé.[¨ò"¢.Kˆ{XNjŠ{8®iz^iÉşˆz®X¹^iú^X;ûÈÎYNyºîy¨NYËXˆnXŠ^hé.YÒ'ÓÂö#ãÇ7ãç·f—6–&ÆU&æ¶VDFFW2æÖ‚†÷F–öâ’Óâ²6öç7BÆ—fU&æ²Òf—6–&ÆU&æ¶VDFFW2æf–ÇFW"‚†6æF–FFTFFR’Óâ6æF–FFTFFRçV÷FRç7FGW2ÓÓÒ&Æ—fR"’æf–æD–æFW‚‚†6æF–FFTFFR’Óâ6æF–FFTFFRæFW'GW&TFFRÓÓÒ÷F–öâæFW'GW&TFFRbb6æF–FFTFFRç&WGW&äFFRÓÓÒ÷F–öâç&WGW&äFFR’²²6öç7B÷F–öä¶W’ÒG¶÷F–öâæFW'GW&TFFWÓ¢G¶÷F–öâç&WGW&äFFWÖ²6öç7B÷F–öäÆ&VÂÒ÷F–öâæÖF6…G—RÓÓÒ&W†7B"ò.hÈ~Zé®iz^iÉò"¢÷F–öâçV÷FRç7FGW2ÓÓÒ&ÆöF–ær"ò.iú^X;KŠÒ"¢÷F–öâçV÷FRç7FGW2ÓÓÒ&Æ—fR"òzÊÂG¶Æ—fU&æ·ÒYÒ+rG¶ÖöæW’†÷F–öâçV÷FRç&–6RóòçVÆÂ—Ö¢÷F–öâçV÷FRç7FGW2ÓÓÒ&æõöF—&V7B"ò.k).iÈy»Nš9²"¢÷F–öâçV÷FRç7FGW2ÓÓÒ&æõ÷&W7VÇG2"ò.k).iÈXúşYJîˆŠ®xúÒ"¢.iú^X;ZKiYr#²&WGW&âÆ'WGFöâ¶W“×¶÷F–öä¶W—ÒG—SÒ&'WGFöâ"6Æ74æÖS×¶G¶÷F–öä¶W’ÓÓÒ6VÆV7FVDFFT¶W’ò'6VÆV7FVB"¢"'ÒG¶÷F–öâçV÷FRç7FGW2ÓÓÒ&Æ—fR"ò&f–Æ&ÆR"¢'Væf–Æ&ÆR'ÖÒöä6Æ–6³×²‚’Óâ6WE6VÆV7FVDFFT¶W’†÷F–öä¶W’—ÓãÇ6ÖÆÃç¶÷F–öäÆ&VÇÓÂ÷6ÖÆÃç¶f÷&ÖDFFR†÷F–öâæFW'GW&TFFR—Ş(	7¶f÷&ÖDFFR†÷F–öâç&WGW&äFFR—ÓÂö'WGFöãã²Ò—ÓÂ÷7ããÂöF—cãÂöF—cãÆF—b6Æ74æÖSÒ'&V6öâÖÆ—7B#ç¶F—7Æ–VEV÷FRç7FGW2ÓÓÒ&æõöF—&V7B"ÇÂF—7Æ–VEV÷FRç7FGW2ÓÓÒ&æõ÷&W7VÇG2"òÃãÇ7ãî)ÉR¶Æ—fTFFT6÷VçBò.yºîX˜Ş˜Xùny¨Niz^iÉşk).iÈzÊnYj)ŞK»ny¨NˆŠ®xúÒ"¢.Kˆ{XNiz^iÉş˜;Şk).iÈzÊnYj)ŞK»ny¨NXúşYJîˆŠ®xúÒ'ÓÂ÷7ããÇ6ÖÆÃç¶Æ—fTFFT6÷VçBò.Š¸¾˜Kˆ®ikj‰iÈXÛ>i˜.X;jÎy¨Ni»şKº>iz^iÉşûÉ¾yºîy¨NYËiÊÎ‹ª¾K¸ŞxKniÈiX8""¢.˜	Xú®Kº>ŠyºîX˜ŞKˆ{XNiz^iÉşy¨Niú^X;{YiéÎûÈÎKˆŞKº>Ši[Një^jŠ{8®iÉş™i>ZèÎXZk).iÈxúŞj™ş8"'ÓÂ÷6ÖÆÃãÂóâ¢Ãç¶6æF–FFRç–ÆöBç&V6öç2æÖ‚‡&V6öâ’ÓâÇ7â¶W“×·&V6öçÓî)É2·&V6öçÓÂ÷7ãâ—ÓÇ6ÖÆÃç¶F—7Æ–VEV÷FRç7FGW2ÓÓÒ&ÆöF–ær"ò.jÚ>YÊYÎi˜.iú^Šš.Kˆ{XNiz^iÉşKŠn˜xŞikhé.YŞ8""¢.[{.KéŞ˜	X¾yºîy¨NYËy¨NXÛ>i˜.XúşYJîzZX;ZèÎh‰iz^iÉşhé.YŞ8"'ÓÂ÷6ÖÆÃãÂóçÓÂöF—cãÆF—b6Æ74æÖSÒ'Fr×&÷r#ç¶6æF–FFRç–ÆöBç7G–ÆW2ç6Æ–6RƒÂ2’æÖ‚‡7G–ÆR’ÓâÇ7â¶W“×·7G–ÆWÓç·7G–ÆW2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ7G–ÆR“òæÆ&VÂÇÂ7G–ÆWÓÂ÷7ãâ—ÓÂöF—cãÂöF—cà¢ÆF—b6Æ74æÖSÒ&f—B×66÷&R#ãÇ7ãç·6öÆòò.X¾K«®XşZ[ŞXˆni[‚"¢.YÉš¹NXşZ[ŞXˆni[‚'ÓÂ÷7ããÇ7G&öæsç¶6æF–FFRæf—E66÷&WÓÇ6ÖÆÃâóÂ÷6ÖÆÃãÂ÷7G&öæsãÆ“ãÆ"7G–ÆS×·²v–GFƒ¢G¶6æF–FFRæf—E66÷&WÒV×ÒóãÂö“ãÂöF—cà¢ÆF—b6Æ74æÖSÒ&6æF–FFRÖ7F–öâ#ãÇ7ãç¶6æF–FFRç–ÆöBæÖ…7F÷2ÓÓÒò.jøşK«®KènY¹îy»Nš9¾XÛ>i˜.X;’"¢.jøşK«®KènY¹îXÛ>i˜.X;’'ÓÂ÷7ããÇ7G&öær6Æ74æÖS×¶F—7Æ–VEV÷FRç7FGW2ÓÓÒ&Æ—fR"ò""¢'VçfW&–f–VB×&–6R'Óç·V÷FUF—FÆWÓÂ÷7G&öæsãÇ6ÖÆÃç·V÷FTæ÷FWÓÆ'"óç·6VÆV7FVD—'÷'Bæ6öFWÒ+r¶f÷&ÖDFFR‡6VÆV7FVDFFRæFW'GW&TFFR—Ş(	7¶f÷&ÖDFFR‡6VÆV7FVDFFRç&WGW&äFFR—ÓÂ÷6ÖÆÃãÆ6Æ74æÖSÒ&'W’ÖÆ–æ²"‡&Vc×¶F—7Æ–VEV÷FRæ&öö¶–æuW&ÂÇÂfÆ–v‡EW&ÇÒF&vWCÒ%ö&Ææ²"&VÃÒ&æö÷VæW"æ÷&VfW'&W"#ç¶F—7Æ–VEV÷FRç7FGW2ÓÓÒ&æõöF—&V7B"ÇÂF—7Æ–VEV÷FRç7FGW2ÓÓÒ&æõ÷&W7VÇG2"ò.YÊ‚vöövÆRfÆ–v‡G2iú^yÈ¾y»˜Kiz^iÉò"¢.YÊ‚vöövÆRfÆ–v‡G2™h¾YYş˜	{XNˆŠ®xúÒ'Ò(isÂöãÆ'WGFöâG—SÒ&'WGFöâ"F—6&ÆVC×¶'W7’ÇÂF—7Æ–VEV÷FRç7FGW2ÓÒ&Æ—fR'Òöä6Æ–6³×²‚’Óâfö–Böä6†ö÷6R‚—Óç¶F—7Æ–VEV÷FRç7FGW2ÓÒ&Æ—fR"ò.iú^X‹XúşYJîzZX;[èÎh˜Şˆ;Ş˜i8r"¢6VÆV7FVBò6öÆòò.[{.iKn‰xò)É2"¢.[{.h©^˜	zZ‚)É>8›¹îi8®Xùnkh‚"¢6öÆòò.iKn‰xş˜	X¾[»®ŠÛ"¢.h©^{Zn˜	X¾˜šR'ÓÂö'WGFöããÂöF—cà¢Âö'F–6ÆSà¢“°§Ğ ¦gVæ7F–öâfö÷FW"‚’°¢&WGW&âÆfö÷FW#ãÇ7â6Æ74æÖSÒ&fö÷FW"Ö'&æB#î™ªš9³Â÷7ããÇäÄ”äRyJKènˆ®ZJûÈÎ™ªš9¾yJKènh›îX‹X[YÎzÙNj8#Â÷ãÇ7ãîzZX;ˆˆ~‹;Î‹+~yKZIn˜:ˆŠ®xúŞ[›>XûhùKé³Â÷7ããÂöfö÷FW#ã°§Ğ ¦gVæ7F–öâÆöF–æu67&VVâ‚’°¢&WGW&âÆÖ–â6Æ74æÖSÒ&ÆöF–ær×67&VVâ#ãÇ7â6Æ74æÖSÒ&'&æBÖÖ&²#ãÇ7âóãÂ÷7ããÆ#îjÚ>YÊi[Nynix^ŠÎKªN™¸cÂö#ãÆ’óãÂöÖ–ãã°§Ğ