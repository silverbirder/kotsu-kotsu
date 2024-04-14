DO $$ BEGIN
 CREATE TYPE "entryValueType" AS ENUM('number', 'string', 'boolean', 'array');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kotsu-kotsu_account" (
	"userId" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "kotsu-kotsu_account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kotsu-kotsu_notebookEntry" (
	"id" serial PRIMARY KEY NOT NULL,
	"notebookId" integer NOT NULL,
	"label" varchar(255) NOT NULL,
	"entryValueType" "entryValueType" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kotsu-kotsu_notebookEntryValueArray" (
	"id" serial PRIMARY KEY NOT NULL,
	"notebookEntryId" integer NOT NULL,
	"value" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kotsu-kotsu_notebook" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"remark" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"userId" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kotsu-kotsu_pageEntry" (
	"id" serial PRIMARY KEY NOT NULL,
	"pageId" integer NOT NULL,
	"notebookEntryId" integer NOT NULL,
	"stringValue" varchar(255),
	"numberValue" integer,
	"booleanValue" boolean
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kotsu-kotsu_page" (
	"id" serial PRIMARY KEY NOT NULL,
	"notebookId" integer NOT NULL,
	"remark" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"userId" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kotsu-kotsu_post" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256),
	"createdById" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kotsu-kotsu_session" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kotsu-kotsu_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"emailVerified" timestamp DEFAULT CURRENT_TIMESTAMP,
	"image" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kotsu-kotsu_verificationToken" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "kotsu-kotsu_verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "kotsu-kotsu_account" ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notebookEntry_notebookId_idx" ON "kotsu-kotsu_notebookEntry" ("notebookId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notebookEntryValueArray_notebookEntryId_idx" ON "kotsu-kotsu_notebookEntryValueArray" ("notebookEntryId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pageEntry_pageId_idx" ON "kotsu-kotsu_pageEntry" ("pageId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pageEntry_notebookEntryId_idx" ON "kotsu-kotsu_pageEntry" ("notebookEntryId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_notebookId_idx" ON "kotsu-kotsu_page" ("notebookId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_userId_idx" ON "kotsu-kotsu_page" ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "createdById_idx" ON "kotsu-kotsu_post" ("createdById");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "kotsu-kotsu_post" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "kotsu-kotsu_session" ("userId");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kotsu-kotsu_account" ADD CONSTRAINT "kotsu-kotsu_account_userId_kotsu-kotsu_user_id_fk" FOREIGN KEY ("userId") REFERENCES "kotsu-kotsu_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kotsu-kotsu_notebookEntry" ADD CONSTRAINT "kotsu-kotsu_notebookEntry_notebookId_kotsu-kotsu_notebook_id_fk" FOREIGN KEY ("notebookId") REFERENCES "kotsu-kotsu_notebook"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kotsu-kotsu_notebookEntryValueArray" ADD CONSTRAINT "kotsu-kotsu_notebookEntryValueArray_notebookEntryId_kotsu-kotsu_notebookEntry_id_fk" FOREIGN KEY ("notebookEntryId") REFERENCES "kotsu-kotsu_notebookEntry"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kotsu-kotsu_notebook" ADD CONSTRAINT "kotsu-kotsu_notebook_userId_kotsu-kotsu_user_id_fk" FOREIGN KEY ("userId") REFERENCES "kotsu-kotsu_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kotsu-kotsu_pageEntry" ADD CONSTRAINT "kotsu-kotsu_pageEntry_pageId_kotsu-kotsu_page_id_fk" FOREIGN KEY ("pageId") REFERENCES "kotsu-kotsu_page"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kotsu-kotsu_pageEntry" ADD CONSTRAINT "kotsu-kotsu_pageEntry_notebookEntryId_kotsu-kotsu_notebookEntry_id_fk" FOREIGN KEY ("notebookEntryId") REFERENCES "kotsu-kotsu_notebookEntry"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kotsu-kotsu_page" ADD CONSTRAINT "kotsu-kotsu_page_notebookId_kotsu-kotsu_notebook_id_fk" FOREIGN KEY ("notebookId") REFERENCES "kotsu-kotsu_notebook"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kotsu-kotsu_page" ADD CONSTRAINT "kotsu-kotsu_page_userId_kotsu-kotsu_user_id_fk" FOREIGN KEY ("userId") REFERENCES "kotsu-kotsu_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kotsu-kotsu_post" ADD CONSTRAINT "kotsu-kotsu_post_createdById_kotsu-kotsu_user_id_fk" FOREIGN KEY ("createdById") REFERENCES "kotsu-kotsu_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kotsu-kotsu_session" ADD CONSTRAINT "kotsu-kotsu_session_userId_kotsu-kotsu_user_id_fk" FOREIGN KEY ("userId") REFERENCES "kotsu-kotsu_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
