CREATE TABLE `candidate_votes` (
	`group_id` text NOT NULL,
	`candidate_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`group_id`, `candidate_id`, `user_id`),
	FOREIGN KEY (`group_id`) REFERENCES `trip_groups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`candidate_id`) REFERENCES `trip_candidates`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_candidate_votes_group_candidate` ON `candidate_votes` (`group_id`,`candidate_id`);--> statement-breakpoint
CREATE INDEX `idx_candidate_votes_group_user` ON `candidate_votes` (`group_id`,`user_id`);--> statement-breakpoint
INSERT OR IGNORE INTO `candidate_votes` (`group_id`, `candidate_id`, `user_id`, `created_at`)
SELECT `id`, `selected_candidate_id`, `owner_id`, `created_at`
FROM `trip_groups`
WHERE `kind` = 'group'
  AND `selected_candidate_id` IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM `trip_candidates`
    WHERE `trip_candidates`.`id` = `trip_groups`.`selected_candidate_id`
  );--> statement-breakpoint
UPDATE `trip_groups`
SET `status` = 'matching', `selected_candidate_id` = NULL
WHERE `kind` = 'group' AND `selected_candidate_id` IS NOT NULL;--> statement-breakpoint
PRAGMA optimize;
