ALTER TABLE `trip_groups` ADD `kind` text DEFAULT 'group' NOT NULL;--> statement-breakpoint
UPDATE `trip_groups`
SET `kind` = 'solo'
WHERE `name` IN ('我的隨飛組合', '我的個人搜尋')
  AND (SELECT COUNT(*) FROM `group_members` WHERE `group_members`.`group_id` = `trip_groups`.`id`) = 1;
