import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "../../../db";
import {
  candidateVotes,
  groupMembers,
  travelIntents,
  tripCandidates,
  tripGroups,
  users,
} from "../../../db/schema";
import { destinationContinents, destinationCountries, destinationRegions, destinations } from "../../../lib/destinations";

export const dynamic = "force-dynamic";

type IntentInput = {
  displayName?: string;
  mode?: string;
  origin?: string;
  windowStart?: string;
  windowEnd?: string;
  minNights?: number;
  maxNights?: number;
  budgetMax?: number;
  baggageKg?: number;
  redEyeAllowed?: boolean;
  maxStops?: number;
  styles?: string[];
  destinations?: string[];
  ready?: boolean;
};

type Identity = {
  externalId: string;
  displayName: string;
};

type StoredIntent = typeof travelIntents.$inferSelect;

const allowedStyleIds = new Set(["lazy", "nature", "food", "city", "shopping"]);
const allowedDestinationIds = new Set([
  ...destinationContinents.map((item) => `continent:${item.id}`),
  ...destinationRegions.map((item) => `region:${item.id}`),
  ...destinationCountries.map((item) => `country:${item.id}`),
  ...destinations.map((destination) => `city:${destination.code}`),
]);
const styleLabels: Record<string, string> = { lazy: "耍廢", nature: "自然", food: "美食", city: "城市", shopping: "購物" };

function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

function boundedText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function isDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function requestIdentity(request: Request): Identity | null {
  const guestId = request.headers.get("x-suifei-guest-id");
  if (guestId && /^[a-f0-9]{8}-[a-f0-9-]{27,72}$/i.test(guestId)) {
    return { externalId: `guest:${guestId}`, displayName: "旅伴" };
  }

  const userId = request.headers.get("oai-authenticated-user-id");
  const email = request.headers.get("oai-authenticated-user-email");
  const encodedName = request.headers.get("oai-authenticated-user-full-name");
  const encoding = request.headers.get("oai-authenticated-user-full-name-encoding");

  if (userId && email) {
    let displayName = email.split("@")[0] || "旅伴";
    if (encodedName && encoding === "percent-encoded-utf-8") {
      try {
        displayName = decodeURIComponent(encodedName);
      } catch {
        // Keep the safe email-derived fallback.
      }
    }
    return { externalId: userId, displayName };
  }

  return null;
}

async function ensureUser(identity: Identity, requestedName?: string) {
  const db = getDb();
  const existing = await db.select().from(users).where(eq(users.lineUserId, identity.externalId)).limit(1);
  const requestedDisplayName = boundedText(requestedName, 30);
  if (existing[0]) {
    const displayName = requestedDisplayName || existing[0].displayName;
    if (existing[0].displayName !== displayName) {
      await db.update(users).set({ displayName }).where(eq(users.id, existing[0].id));
    }
    return { ...existing[0], displayName };
  }

  const displayName = requestedDisplayName || identity.displayName;
  const row = {
    id: crypto.randomUUID(),
    lineUserId: identity.externalId,
    displayName,
    avatarUrl: null,
    allowlisted: true,
    createdAt: new Date().toISOString(),
  };
  await db.insert(users).values(row);
  return row;
}

function parseJsonArray(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function plusDays(date: string, days: number) {
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

function diffDays(start: string, end: string) {
  return Math.floor((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000);
}

function buildDateOptions(intents: StoredIntent[], windowStart: string, windowEnd: string, nights: number) {
  const exact = intents.every((intent) => intent.mode === "exact");
  const options = exact
    ? [
        { departureDate: windowStart, returnDate: windowEnd, matchType: "exact" as const },
        { departureDate: plusDays(windowStart, -1), returnDate: plusDays(windowEnd, -1), matchType: "overlap" as const },
        { departureDate: plusDays(windowStart, 1), returnDate: plusDays(windowEnd, 1), matchType: "overlap" as const },
      ]
    : [
        { departureDate: plusDays(windowStart, -(nights - 1)), returnDate: windowStart, matchType: "overlap" as const },
        {
          departureDate: plusDays(windowStart, Math.max(0, Math.floor((diffDays(windowStart, windowEnd) - nights) / 2))),
          returnDate: plusDays(windowStart, Math.max(0, Math.floor((diffDays(windowStart, windowEnd) - nights) / 2)) + nights),
          matchType: "overlap" as const,
        },
        { departureDate: windowEnd, returnDate: plusDays(windowEnd, nights), matchType: "overlap" as const },
      ];

  return options.filter((option, index) => options.findIndex((candidate) => candidate.departureDate === option.departureDate && candidate.returnDate === option.returnDate) === index);
}

function matchesDestinationScope(destination: (typeof destinations)[number], intent: StoredIntent) {
  const preferences = parseJsonArray(intent.destinationsJson);
  const cities = preferences.filter((item) => item.startsWith("city:"));
  if (cities.length) return cities.includes(`city:${destination.code}`);
  const countries = preferences.filter((item) => item.startsWith("country:"));
  if (countries.length) return countries.includes(`country:${destination.countryCode}`);
  const regions = preferences.filter((item) => item.startsWith("region:"));
  if (regions.length) {
    if (regions.includes("region:northeast_asia")) return destination.region === "east_asia";
    if (regions.includes("region:australia_nz")) return destination.continent === "oceania" && ["AU", "NZ"].includes(destination.countryCode);
    if (regions.includes("region:west_coast")) return destination.continent === "north_america" && ["YVR", "LAX", "SFO", "SEA"].includes(destination.code);
    return regions.includes(`region:${destination.region}`);
  }
  const continents = preferences.filter((item) => item.startsWith("continent:"));
  if (continents.length) return continents.includes(`continent:${destination.continent}`);
  return true;
}

function buildCandidates(groupId: string, intents: StoredIntent[]) {
  if (!intents.length) return [];
  const individual = intents.length === 1;
  const windowStart = intents.map((intent) => intent.windowStart).sort().at(-1)!;
  const windowEnd = intents.map((intent) => intent.windowEnd).sort().at(0)!;
  const minNights = Math.max(...intents.map((intent) => intent.minNights));
  const maxNights = Math.min(...intents.map((intent) => intent.maxNights));
  const maxStops = Math.min(...intents.map((intent) => intent.maxStops));
  const baggageKg = Math.max(...intents.map((intent) => intent.baggageKg));
  const nights = Math.min(Math.max(minNights, 3), maxNights);
  if (maxNights < minNights || diffDays(windowStart, windowEnd) < nights) return [];

  return destinations
    .filter((destination) => intents.every((intent) => matchesDestinationScope(destination, intent)))
    .map((destination) => {
      const styleScores = intents.map((intent) => {
        const styles = parseJsonArray(intent.stylesJson);
        if (!styles.length) return 0.55;
        return styles.filter((style) => (destination.styles as readonly string[]).includes(style)).length / styles.length;
      });
      const destinationScores = intents.map((intent) => {
        const preferences = parseJsonArray(intent.destinationsJson);
        if (!preferences.length) return 0.55;
        if (preferences.includes(`city:${destination.code}`)) return 1;
        if (preferences.includes(`country:${destination.countryCode}`)) return 0.9;
        if (preferences.includes(`region:${destination.region}`)) return 0.78;
        if (preferences.includes(`continent:${destination.continent}`)) return 0.65;
        return 0;
      });
      const budgetScores = intents.map((intent) => Math.min(1, intent.budgetMax / destination.floor));
      const memberScores = intents.map((_, index) => styleScores[index] * 0.45 + destinationScores[index] * 0.45 + budgetScores[index] * 0.1);
      const average = memberScores.reduce((total, score) => total + score, 0) / memberScores.length;
      const leastHappy = Math.min(...memberScores);
      const fitScore = Math.round(62 + average * 23 + leastHappy * 15);
      const cityMatches = intents.filter((intent) => parseJsonArray(intent.destinationsJson).includes(`city:${destination.code}`)).length;
      const countryMatches = intents.filter((intent) => parseJsonArray(intent.destinationsJson).includes(`country:${destination.countryCode}`)).length;
      const regionMatches = intents.filter((intent) => parseJsonArray(intent.destinationsJson).includes(`region:${destination.region}`)).length;
      const continentMatches = intents.filter((intent) => parseJsonArray(intent.destinationsJson).includes(`continent:${destination.continent}`)).length;
      const destinationReason = cityMatches
        ? individual ? "符合你指定的城市" : `命中 ${cityMatches}/${intents.length} 人的城市偏好`
        : countryMatches
          ? individual ? "符合你指定的國家" : `命中 ${countryMatches}/${intents.length} 人的國家偏好`
          : regionMatches
            ? individual ? "符合你指定的區域" : `命中 ${regionMatches}/${intents.length} 人的區域偏好`
            : continentMatches
              ? individual ? "符合你指定的洲別" : `命中 ${continentMatches}/${intents.length} 人的洲別偏好`
              : "保留目的地彈性，沒有硬性地區衝突";
      const styleCounts = destination.styles.map((style) => ({
        style,
        count: intents.filter((intent) => parseJsonArray(intent.stylesJson).includes(style)).length,
      })).sort((a, b) => b.count - a.count);
      const topStyle = styleCounts[0];
      const reasons = [
        individual ? `你的日期區間可安排 ${nights} 晚` : `全員日期交集可安排 ${nights} 晚`,
        destinationReason,
        maxStops === 0 ? "開啟查票頁時會套用「只看直飛」" : "查票頁會顯示含轉機航班，請再確認轉機次數",
        topStyle?.count ? individual ? `符合你的「${styleLabels[topStyle.style] ?? topStyle.style}」偏好` : `符合 ${topStyle.count}/${intents.length} 人的「${styleLabels[topStyle.style] ?? topStyle.style}」偏好` : "旅行風格沒有明顯衝突",
      ].slice(0, 3);
      const origins = [...new Set(intents.flatMap((intent) => parseJsonArray(intent.originsJson)))];
      const tradeoff = origins.length > 1
        ? "成員出發機場不同，訂票時需要各自查價"
        : "即時票價與實際班次查到後，這個候選才會成立";
      const dateOptions = buildDateOptions(intents, windowStart, windowEnd, nights);
      const payload = {
        code: destination.code,
        country: destination.country,
        countryCode: destination.countryCode,
        continent: destination.continent,
        region: destination.region,
        emoji: destination.emoji,
        note: destination.note,
        priceFloor: destination.floor,
        priceCeiling: destination.ceiling,
        origins,
        styles: destination.styles,
        priceStatus: "unverified",
        maxStops,
        baggageKg,
        airports: destination.airports,
        dateOptions,
        dateMode: intents.every((intent) => intent.mode === "exact") ? "exact" : "flexible",
        reasons,
        tradeoff,
      };
      return {
        id: `${groupId}:${destination.code}`,
        groupId,
        destination: destination.city,
        departureDate: dateOptions[0].departureDate,
        returnDate: dateOptions[0].returnDate,
        totalPriceTwd: destination.floor,
        fitScore,
        verifiedAt: null,
        payloadJson: JSON.stringify(payload),
      };
    })
    .sort((a, b) => {
      const aCode = a.id.split(":").at(-1);
      const bCode = b.id.split(":").at(-1);
      const aPopularity = destinations.find((destination) => destination.code === aCode)?.popularity ?? 0;
      const bPopularity = destinations.find((destination) => destination.code === bCode)?.popularity ?? 0;
      return b.fitScore - a.fitScore || bPopularity - aPopularity || a.totalPriceTwd - b.totalPriceTwd;
    })
    .slice(0, 3);
}

async function replaceCandidates(groupId: string, intents: StoredIntent[]) {
  const db = getDb();
  const candidates = buildCandidates(groupId, intents);
  await db.delete(candidateVotes).where(eq(candidateVotes.groupId, groupId));
  await db.delete(tripCandidates).where(eq(tripCandidates.groupId, groupId));
  if (candidates.length) await db.insert(tripCandidates).values(candidates);
  // "matching" means the current set of conditions has been calculated. Keep
  // that state even when no candidate survives, so the UI can distinguish an
  // empty result from a group that has not started searching yet.
  await db.update(tripGroups).set({ status: "matching", selectedCandidateId: null }).where(eq(tripGroups.id, groupId));
  return candidates;
}

async function detailByCode(code: string, currentUserId: string) {
  const db = getDb();
  const group = (await db.select().from(tripGroups).where(eq(tripGroups.inviteCode, code)).limit(1))[0];
  if (!group) return null;

  const memberships = await db.select({
    userId: groupMembers.userId,
    role: groupMembers.role,
    responseState: groupMembers.responseState,
    joinedAt: groupMembers.joinedAt,
    displayName: users.displayName,
  }).from(groupMembers).innerJoin(users, eq(groupMembers.userId, users.id)).where(eq(groupMembers.groupId, group.id));

  const memberIds = memberships.map((member) => member.userId);
  const intents = memberIds.length
    ? await db.select().from(travelIntents).where(and(eq(travelIntents.groupId, group.id), inArray(travelIntents.userId, memberIds)))
    : [];
  const candidates = await db.select().from(tripCandidates).where(eq(tripCandidates.groupId, group.id)).orderBy(desc(tripCandidates.fitScore));
  const votes = await db.select().from(candidateVotes).where(eq(candidateVotes.groupId, group.id));
  const myIntent = intents.find((intent) => intent.userId === currentUserId) ?? null;
  const stylesByUser = new Map(intents.map((intent) => [intent.userId, parseJsonArray(intent.stylesJson)]));
  const namesByUser = new Map(memberships.map((member) => [member.userId, member.displayName]));
  const budgetCeiling = intents.length ? Math.floor(Math.min(...intents.map((intent) => intent.budgetMax)) / 1000) * 1000 : null;
  const starts = intents.map((intent) => intent.windowStart).sort();
  const ends = intents.map((intent) => intent.windowEnd).sort();

  return {
    group: {
      id: group.id,
      kind: group.kind,
      name: group.name,
      inviteCode: group.inviteCode,
      status: group.status,
      selectedCandidateId: group.selectedCandidateId,
      createdAt: group.createdAt,
    },
    members: memberships.map((member) => ({
      ...member,
      styles: stylesByUser.get(member.userId) ?? [],
    })),
    myIntent: myIntent ? { ...myIntent, origins: parseJsonArray(myIntent.originsJson), destinations: parseJsonArray(myIntent.destinationsJson), styles: parseJsonArray(myIntent.stylesJson) } : null,
    isMember: memberships.some((member) => member.userId === currentUserId),
    summary: {
      completed: memberships.filter((member) => member.responseState === "complete").length,
      total: memberships.length,
      windowStart: starts.at(-1) ?? null,
      windowEnd: ends.at(0) ?? null,
      budgetCeiling,
    },
    voting: {
      totalMembers: memberships.length,
      votersCount: new Set(votes.map((vote) => vote.userId)).size,
      votedUserIds: [...new Set(votes.map((vote) => vote.userId))],
      myCandidateIds: votes.filter((vote) => vote.userId === currentUserId).map((vote) => vote.candidateId),
      tallies: candidates.map((candidate) => {
        const candidateVoters = votes.filter((vote) => vote.candidateId === candidate.id);
        return {
          candidateId: candidate.id,
          count: candidateVoters.length,
          voterUserIds: candidateVoters.map((vote) => vote.userId),
          voterNames: candidateVoters.map((vote) => namesByUser.get(vote.userId)).filter((name): name is string => Boolean(name)),
        };
      }),
    },
    candidates: candidates.map((candidate) => ({ ...candidate, payload: JSON.parse(candidate.payloadJson) })),
  };
}

export async function GET(request: Request) {
  try {
    const identity = requestIdentity(request);
    if (!identity) return jsonError("請先登入後再使用隨飛。", 401);
    const currentUser = await ensureUser(identity);
    const url = new URL(request.url);
    const code = boundedText(url.searchParams.get("code"), 24).toUpperCase();
    if (code) {
      const detail = await detailByCode(code, currentUser.id);
      return detail ? Response.json({ ...detail, currentUser }) : jsonError("找不到這個旅團。", 404);
    }

    const rows = await getDb().select({
      id: tripGroups.id,
      kind: tripGroups.kind,
      name: tripGroups.name,
      inviteCode: tripGroups.inviteCode,
      status: tripGroups.status,
      createdAt: tripGroups.createdAt,
    }).from(groupMembers).innerJoin(tripGroups, eq(groupMembers.groupId, tripGroups.id)).where(and(eq(groupMembers.userId, currentUser.id), eq(tripGroups.kind, "group"))).orderBy(desc(tripGroups.createdAt)).limit(12);
    return Response.json({ groups: rows, currentUser });
  } catch (error) {
    console.error(JSON.stringify({ message: "groups GET failed", error: error instanceof Error ? error.message : String(error) }));
    return jsonError("暫時無法讀取旅團，請稍後再試。", 500);
  }
}

export async function POST(request: Request) {
  try {
    const identity = requestIdentity(request);
    if (!identity) return jsonError("請先登入後再使用隨飛。", 401);
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 32768) return jsonError("提交內容過大。", 413);
    const body = await request.json() as Record<string, unknown>;
    const action = boundedText(body.action, 30);
    const requestedName = boundedText(body.displayName, 30);
    const currentUser = await ensureUser(identity, requestedName);
    const db = getDb();

    if (action === "create") {
      const kind = body.kind === "solo" ? "solo" : "group";
      if (kind === "solo") {
        const existingSolo = (await db.select().from(tripGroups).where(and(eq(tripGroups.ownerId, currentUser.id), eq(tripGroups.kind, "solo"))).orderBy(desc(tripGroups.createdAt)).limit(1))[0];
        if (existingSolo) {
          return Response.json({ ...(await detailByCode(existingSolo.inviteCode, currentUser.id)), currentUser });
        }
      }
      const name = boundedText(body.name, 48) || (kind === "solo" ? "我的隨飛組合" : "我們的隨飛旅團");
      const id = crypto.randomUUID();
      const inviteCode = crypto.randomUUID().replaceAll("-", "").slice(0, 24).toUpperCase();
      const createdAt = new Date().toISOString();
      await db.batch([
        db.insert(tripGroups).values({ id, ownerId: currentUser.id, kind, name, inviteCode, status: "collecting", createdAt }),
        db.insert(groupMembers).values({ groupId: id, userId: currentUser.id, role: "owner", responseState: "pending", joinedAt: createdAt }),
      ]);
      const detail = await detailByCode(inviteCode, currentUser.id);
      return Response.json({ ...detail, currentUser }, { status: 201 });
    }

    const code = boundedText(body.code, 24).toUpperCase();
    if (!code) return jsonError("缺少旅團邀請碼。" );
    const group = (await db.select().from(tripGroups).where(eq(tripGroups.inviteCode, code)).limit(1))[0];
    if (!group) return jsonError("找不到這個旅團。", 404);
    const membership = (await db.select().from(groupMembers).where(and(eq(groupMembers.groupId, group.id), eq(groupMembers.userId, currentUser.id))).limit(1))[0];

    if (action === "join") {
      if (!membership) {
        await db.batch([
          db.insert(groupMembers).values({ groupId: group.id, userId: currentUser.id, role: "member", responseState: "pending", joinedAt: new Date().toISOString() }),
          db.update(tripGroups).set({ status: "collecting", selectedCandidateId: null }).where(eq(tripGroups.id, group.id)),
          db.delete(candidateVotes).where(eq(candidateVotes.groupId, group.id)),
          db.delete(tripCandidates).where(eq(tripCandidates.groupId, group.id)),
        ]);
      }
      return Response.json({ ...(await detailByCode(code, currentUser.id)), currentUser });
    }

    if (!membership) return jsonError("請先加入旅團。", 403);

    if (action === "intent") {
      if (group.kind === "group" && group.status !== "collecting" && group.ownerId !== currentUser.id) {
        return jsonError("團主已經產生結果；團員目前只能查看、投票或退出旅團。", 403);
      }
      const input = body.intent as IntentInput | undefined;
      if (!input) return jsonError("缺少旅行條件。" );
      const origin = boundedText(input.origin, 4).toUpperCase();
      const windowStart = boundedText(input.windowStart, 10);
      const windowEnd = boundedText(input.windowEnd, 10);
      const minNights = Number(input.minNights);
      const maxNights = Number(input.maxNights);
      const budgetMax = Number(input.budgetMax);
      if (!/^[A-Z]{3}$/.test(origin)) return jsonError("請輸入三碼機場代碼，例如 TPE。" );
      if (!isDate(windowStart) || !isDate(windowEnd) || windowStart > windowEnd) return jsonError("日期區間不正確。" );
      if (!Number.isInteger(minNights) || !Number.isInteger(maxNights) || minNights < 2 || maxNights > 14 || minNights > maxNights) return jsonError("旅行天數請設定為 2 至 14 晚。" );
      if (!Number.isFinite(budgetMax) || budgetMax < 5000 || budgetMax > 200000) return jsonError("預算上限請設定在 NT$5,000 至 NT$200,000。" );
      const styles = Array.isArray(input.styles) ? input.styles.filter((style): style is string => typeof style === "string" && allowedStyleIds.has(style)).slice(0, 8) : [];
      const destinationPreferences = Array.isArray(input.destinations) ? input.destinations.filter((item): item is string => typeof item === "string" && allowedDestinationIds.has(item)).slice(0, 4) : [];
      const now = new Date().toISOString();
      const values = {
        id: crypto.randomUUID(), groupId: group.id, userId: currentUser.id,
        mode: boundedText(input.mode, 24) || "flexible",
        originsJson: JSON.stringify([origin]), destinationsJson: JSON.stringify(destinationPreferences),
        windowStart, windowEnd, minNights, maxNights,
        budgetMax: Math.round(budgetMax), baggageKg: Math.round(Math.max(0, Math.min(30, Number(input.baggageKg) || 0))),
        redEyeAllowed: Boolean(input.redEyeAllowed), maxStops: Math.max(0, Math.min(2, Number(input.maxStops) || 0)),
        stylesJson: JSON.stringify(styles), updatedAt: now,
      };
      await db.insert(travelIntents).values(values).onConflictDoUpdate({
        target: [travelIntents.groupId, travelIntents.userId],
        set: { ...values, id: undefined },
      });
      const ready = group.kind === "solo" || input.ready === true;
      await db.batch([
        db.update(groupMembers).set({ responseState: ready ? "complete" : "pending" }).where(and(eq(groupMembers.groupId, group.id), eq(groupMembers.userId, currentUser.id))),
        db.update(tripGroups).set({ status: "collecting", selectedCandidateId: null }).where(eq(tripGroups.id, group.id)),
        db.delete(candidateVotes).where(eq(candidateVotes.groupId, group.id)),
        db.delete(tripCandidates).where(eq(tripCandidates.groupId, group.id)),
      ]);
      if (group.kind === "solo") {
        const intents = await db.select().from(travelIntents).where(eq(travelIntents.groupId, group.id));
        await replaceCandidates(group.id, intents);
      }
      return Response.json({ ...(await detailByCode(code, currentUser.id)), currentUser });
    }

    if (action === "search") {
      if (group.ownerId !== currentUser.id) return jsonError("只有團主可以開始或重新搜尋共同航班。", 403);
      const memberships = await db.select().from(groupMembers).where(eq(groupMembers.groupId, group.id));
      if (!memberships.length || memberships.some((member) => member.responseState !== "complete")) {
        return jsonError("要等目前所有成員都勾選「我準備好了」，才能開始找票。", 409);
      }
      const intents = await db.select().from(travelIntents).where(eq(travelIntents.groupId, group.id));
      if (intents.length !== memberships.length) return jsonError("還有人尚未送出旅行條件。", 409);
      const latestStart = intents.map((intent) => intent.windowStart).sort().at(-1);
      const earliestEnd = intents.map((intent) => intent.windowEnd).sort().at(0);
      if (latestStart && earliestEnd && latestStart > earliestEnd) {
        return jsonError("大家的可旅行日期沒有交集，請至少一位成員修改日期並重新確認。", 409);
      }
      await replaceCandidates(group.id, intents);
      return Response.json({ ...(await detailByCode(code, currentUser.id)), currentUser });
    }

    if (action === "leave") {
      if (group.kind !== "group") return jsonError("個人搜尋不能退出。", 400);
      if (group.ownerId === currentUser.id) return jsonError("團主不能退出自己的旅團；如不再使用，請選擇解散旅團。", 409);
      await db.batch([
        db.delete(candidateVotes).where(eq(candidateVotes.groupId, group.id)),
        db.delete(tripCandidates).where(eq(tripCandidates.groupId, group.id)),
        db.delete(travelIntents).where(and(eq(travelIntents.groupId, group.id), eq(travelIntents.userId, currentUser.id))),
        db.delete(groupMembers).where(and(eq(groupMembers.groupId, group.id), eq(groupMembers.userId, currentUser.id))),
        db.update(tripGroups).set({ status: "collecting", selectedCandidateId: null }).where(eq(tripGroups.id, group.id)),
      ]);
      return Response.json({ success: true, action: "left" });
    }

    if (action === "disband") {
      if (group.kind !== "group") return jsonError("個人搜尋不能解散。", 400);
      if (group.ownerId !== currentUser.id) return jsonError("只有團主可以解散旅團。", 403);
      await db.batch([
        db.delete(candidateVotes).where(eq(candidateVotes.groupId, group.id)),
        db.delete(tripCandidates).where(eq(tripCandidates.groupId, group.id)),
        db.delete(travelIntents).where(eq(travelIntents.groupId, group.id)),
        db.delete(groupMembers).where(eq(groupMembers.groupId, group.id)),
        db.delete(tripGroups).where(eq(tripGroups.id, group.id)),
      ]);
      return Response.json({ success: true, action: "disbanded" });
    }

    if (action === "decide") {
      const candidateId = boundedText(body.candidateId, 90);
      const candidate = (await db.select().from(tripCandidates).where(and(eq(tripCandidates.id, candidateId), eq(tripCandidates.groupId, group.id))).limit(1))[0];
      if (!candidate) return jsonError("這個候選行程已不存在，請重新整理。", 404);
      if (group.kind === "group") {
        await db.insert(candidateVotes).values({ groupId: group.id, candidateId, userId: currentUser.id, createdAt: new Date().toISOString() }).onConflictDoNothing();
        await db.update(tripGroups).set({ status: "matching", selectedCandidateId: null }).where(eq(tripGroups.id, group.id));
        return Response.json({ ...(await detailByCode(code, currentUser.id)), currentUser });
      }
      await db.update(tripGroups).set({ status: "decided", selectedCandidateId: candidate.id }).where(eq(tripGroups.id, group.id));
      return Response.json({ ...(await detailByCode(code, currentUser.id)), currentUser });
    }

    if (action === "vote") {
      if (group.kind !== "group") return jsonError("個人搜尋請使用收藏功能。", 400);
      const candidateId = boundedText(body.candidateId, 90);
      const candidate = (await db.select().from(tripCandidates).where(and(eq(tripCandidates.id, candidateId), eq(tripCandidates.groupId, group.id))).limit(1))[0];
      if (!candidate) return jsonError("這個候選行程已不存在，請重新整理。", 404);
      const selected = body.selected === true;
      if (selected) {
        await db.insert(candidateVotes).values({ groupId: group.id, candidateId, userId: currentUser.id, createdAt: new Date().toISOString() }).onConflictDoNothing();
      } else {
        await db.delete(candidateVotes).where(and(eq(candidateVotes.groupId, group.id), eq(candidateVotes.candidateId, candidateId), eq(candidateVotes.userId, currentUser.id)));
      }
      await db.update(tripGroups).set({ status: "matching", selectedCandidateId: null }).where(eq(tripGroups.id, group.id));
      return Response.json({ ...(await detailByCode(code, currentUser.id)), currentUser });
    }

    return jsonError("不支援的操作。" );
  } catch (error) {
    console.error(JSON.stringify({ message: "groups POST failed", error: error instanceof Error ? error.message : String(error) }));
    return jsonError("操作沒有完成，請稍後再試。", 500);
  }
}
