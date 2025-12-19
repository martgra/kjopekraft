CREATE TABLE "credits_daily" (
	"user_id" text NOT NULL,
	"date_key" text NOT NULL,
	"used" integer DEFAULT 0 NOT NULL,
	"limit" integer DEFAULT 10 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credits_ledger" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "credits_ledger_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"date_key" text NOT NULL,
	"feature" text NOT NULL,
	"cost" integer NOT NULL,
	"request_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"timezone" text NOT NULL,
	"ai_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
