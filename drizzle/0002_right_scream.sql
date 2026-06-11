ALTER TABLE `aiRecommendations` MODIFY COLUMN `recommendedPoseIds` json;--> statement-breakpoint
ALTER TABLE `moodBoards` MODIFY COLUMN `poseIds` json;--> statement-breakpoint
ALTER TABLE `poses` MODIFY COLUMN `tags` json;--> statement-breakpoint
ALTER TABLE `poses` MODIFY COLUMN `steps` json;--> statement-breakpoint
ALTER TABLE `poses` MODIFY COLUMN `cameraSettings` json;