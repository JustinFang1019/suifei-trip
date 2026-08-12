import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  lineUserId: text("line_user_id").notNull().unique(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  allowlisted: integer("allowlisted", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
});

export const tripGroups = sqliteTable("trip_groups", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => users.id),
  kind: text("kind", { enum: ["solo", "group"] }).notNull().default("group"),
  name: text("name").notNull(),
  inviteCode: text("invite_code").notNull().unique(),
  status: text("status", { enum: ["collecting", "matching", "decided", "archived"] }).notNull().default("collecting"),
  selectedCandidateId: text("selected_candidate_id"),
  createdAt: text("created_at").notNull(),
}, (table) => [index("idx_trip_groups_owner").on(table.ownerId)]);

export const groupMembers = sqliteTable("group_members", {
  groupId: text("group_id").notNull().references(() => tripGroups.id),
  userId: text("user_id").notNull().references(() => users.id),
  role: text("role", { enum: ["owner", "member"] }).notNull().default("member"),
  responseState: text("response_state", { enum: ["pending", "complete"] }).notNull().default("pending"),
  joinedAt: text("joined_at").notNull(),
}, (table) => [
  primaryKey({ columns: [table.groupId, table.userId] }),
  index("idx_group_members_user").on(table.userId),
]);

export const travelIntents = sqliteTable("travel_intents", {
  id: text("id").primaryKey(),
  groupId: text("group_id").notNull().references(() => tripGroups.id),
  userId: text("user_id").notNull().references(() => users.id),
  mode: text("mode").notNull(),
  originsJson: text("origins_json").notNull(),
  destinationsJson: text("destinations_json").notNull().default("[]"),
  windowStart: text("window_start").notNull(),
  windowEnd: text("window_end").notNull(),
  minNights: integer("min_nights").notNull(),
  maxNights: integer("max_nights").notNull(),
  budgetMax: integer("budget_max").notNull(),
  baggageKg: integer("baggage_kg").notNull().default(0),
  redEyeAllowed: integer("red_eye_allowed", { mode: "boolean" }).notNull().default(false),
  maxStops: integer("max_stops").notNull().default(0),
  stylesJson: text("styles_json").notNull().default("[]"),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  uniqueIndex("idx_travel_intents_group_user").on(table.groupId, table.userId),
]);

export const tripCandidates = sqliteTable("trip_candidates", {
  id: text("id").primaryKey(),
  groupId: text("group_id").notNull().references(() => tripGroups.id),
  destination: text("destination").notNull(),
  departureDate: text("departure_date").notNull(),
  returnDate: text("return_date").notNull(),
  totalPriceTwd: integer("total_price_twd").notNull(),
  fitScore: integer("fit_score").notNull(),
  verifiedAt: text("verified_at"),
  payloadJson: text("payload_json").notNull(),
}, (table) => [index("idx_trip_candidates_group_score").on(table.groupId, table.fitScore)]);

export const candidateVotes = sqliteTable("candidate_votes", {
  groupId: text("group_id").notNull().references(() => tripGroups.id),
  candidateId: text("candidate_id").notNull().references(() => tripCandidates.id),
  userId: text("user_id").notNull().references(() => users.id),
  createdAt: text("created_at").notNull(),
}, (table) => [
  primaryKey({ columns: [table.groupId, table.candidateId, table.userId] }),
  index("idx_candidate_votes_group_candidate").on(table.groupId, table.candidateId),
  index("idx_candidate_votes_group_user").on(table.groupId, table.userId),
]);
