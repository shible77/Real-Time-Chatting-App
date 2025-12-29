ALTER TABLE `messages` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `room_members` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `room_members` MODIFY COLUMN `room_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `rooms` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;