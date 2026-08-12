CREATE TABLE `group_members` (
	`group_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`response_state` text DEFAULT 'pending' NOT NULL,
	`joined_at` text NOT NULL,
	PRIMARY KEY(`group_id`, `user_id`),
	FOREIGN KEY (`group_id`) REFERENCES `trip_groups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `travel_intents` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`user_id` text NOT NULL,
	`mode` text NOT NULL,
	`origins_json` text NOT NULL,
	`destinations_json` text DEFAULT '[]' NOT NULL,
	`window_start` text NOT NULL,
	`window_end` text NOT NULL,
	`min_nights` integer NOT NULL,
	`max_nights` integer NOT NULL,
	`budget_max` integer NOT NULL,
	`baggage_kg` integer DEFAULT 0 NOT NULL,
	`red_eye_allowed` integer DEFAULT false NOT NULL,
	`max_stops` integer DEFAULT 0 NOT NULL,
	`styles_json` text DEFAULT '[]' NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `trip_groups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_travel_intents_group_user` ON `travel_intents` (`group_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `trip_candidates` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`destination` text NOT NULL,
	`departure_date` text NOT NULL,
	`return_date` text NOT NULL,
	`total_price_twd` integer NOT NULL,
	`fit_score` integer NOT NULL,
	`verified_at` text,
	`payload_json` text NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `trip_groups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `trip_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`invite_code` text NOT NULL,
	`status` text DEFAULT 'collecting' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `trip_groups_invite_code_unique` ON `trip_groups` (`invite_code`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`line_user_id` text NOT NULL,
	`display_name` text NOT NULL,
	`avatar_url` text,
	`allowlisted` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_line_user_id_unique` ON `users` (`line_user_id`);