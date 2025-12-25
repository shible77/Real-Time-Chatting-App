CREATE TABLE `rooms` (
	`id` varchar(36) NOT NULL,
	`room_code` varchar(20) NOT NULL,
	`created_by` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rooms_id` PRIMARY KEY(`id`),
	CONSTRAINT `rooms_room_code_idx` UNIQUE(`room_code`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` varchar(36) NOT NULL,
	`room_id` varchar(36) NOT NULL,
	`sender_id` varchar(36) NOT NULL,
	`content` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `room_members` (
	`id` varchar(36) NOT NULL,
	`room_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`role` varchar(20) NOT NULL DEFAULT 'member',
	`joined_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `room_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `room_user_unique_idx` UNIQUE(`room_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_idx` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `rooms_created_by_idx` ON `rooms` (`created_by`);--> statement-breakpoint
CREATE INDEX `messages_room_idx` ON `messages` (`room_id`);--> statement-breakpoint
CREATE INDEX `messages_sender_idx` ON `messages` (`sender_id`);--> statement-breakpoint
CREATE INDEX `messages_room_time_idx` ON `messages` (`room_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `room_members_room_idx` ON `room_members` (`room_id`);--> statement-breakpoint
CREATE INDEX `room_members_user_idx` ON `room_members` (`user_id`);