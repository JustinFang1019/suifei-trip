CREATE INDEX `idx_group_members_user` ON `group_members` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_trip_candidates_group_score` ON `trip_candidates` (`group_id`,`fit_score`);--> statement-breakpoint
CREATE INDEX `idx_trip_groups_owner` ON `trip_groups` (`owner_id`);