ALTER TABLE "credits_daily"
  ADD COLUMN "feature" text DEFAULT 'global';
--> statement-breakpoint
UPDATE "credits_daily"
  SET "feature" = 'global'
  WHERE "feature" IS NULL;
--> statement-breakpoint
ALTER TABLE "credits_daily"
  ALTER COLUMN "feature" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "credits_daily"
  ALTER COLUMN "limit" SET DEFAULT 100;
--> statement-breakpoint
UPDATE "credits_daily"
  SET "limit" = 100;
--> statement-breakpoint
ALTER TABLE "credits_daily"
  ADD CONSTRAINT "credits_daily_unique" UNIQUE ("user_id", "date_key", "feature");
