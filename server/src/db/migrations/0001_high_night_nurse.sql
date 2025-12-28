ALTER TABLE `rooms` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT (UUID());--> statement-breakpoint
ALTER TABLE `messages` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT (UUID());--> statement-breakpoint
ALTER TABLE `room_members` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT (UUID());--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `id` varchar(36) NOT NULL DEFAULT (UUID());