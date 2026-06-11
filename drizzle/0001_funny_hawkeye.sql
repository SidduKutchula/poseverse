CREATE TABLE `aiRecommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`occasion` varchar(100),
	`location` varchar(100),
	`people` varchar(100),
	`style` varchar(100),
	`experience` varchar(100),
	`timeOfDay` varchar(100),
	`recommendedPoseIds` json DEFAULT ('[]'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiRecommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`icon` varchar(50),
	`unsplashKeyword` varchar(100),
	`poseCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `moodBoards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`poseIds` json DEFAULT ('[]'),
	`isPublic` boolean NOT NULL DEFAULT false,
	`shareToken` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `moodBoards_id` PRIMARY KEY(`id`),
	CONSTRAINT `moodBoards_shareToken_unique` UNIQUE(`shareToken`)
);
--> statement-breakpoint
CREATE TABLE `poses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` text NOT NULL,
	`thumbnailUrl` text,
	`difficulty` enum('Beginner','Easy','Intermediate','Pro') NOT NULL,
	`occasion` varchar(100),
	`people` enum('Solo','Couple','Group') NOT NULL,
	`cameraAngle` varchar(100),
	`lighting` varchar(100),
	`bodyPosition` text,
	`equipmentNeeded` text,
	`tags` json DEFAULT ('[]'),
	`steps` json DEFAULT ('[]'),
	`cameraSettings` json DEFAULT ('{}'),
	`matchScore` decimal(3,1) DEFAULT '0',
	`views` int NOT NULL DEFAULT 0,
	`saves` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `poses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `savedPoses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`poseId` int NOT NULL,
	`savedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `savedPoses_id` PRIMARY KEY(`id`)
);
