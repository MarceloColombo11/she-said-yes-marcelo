CREATE TYPE "public"."guest_status" AS ENUM('pending', 'confirmed', 'declined');--> statement-breakpoint
CREATE TYPE "public"."honor_category" AS ENUM('padrinhos', 'honra', 'damas');--> statement-breakpoint
CREATE TYPE "public"."media_source" AS ENUM('static', 'db');--> statement-breakpoint
CREATE TYPE "public"."photo_collection" AS ENUM('hero', 'historia');--> statement-breakpoint
CREATE TABLE "admin_login_attempts" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "admin_login_attempts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"ip_hash" text NOT NULL,
	"attempted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"success" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_seed" (
	"id" text PRIMARY KEY NOT NULL,
	"seeded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"pix" text,
	"suggested_value" text,
	"media_id" uuid,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guest_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" text NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"name_normalized" text NOT NULL,
	"group_id" uuid,
	"status" "guest_status" DEFAULT 'pending' NOT NULL,
	"responded_at" timestamp with time zone,
	"email" text,
	"companion_name" text,
	"microonibus" boolean,
	"message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "honor_people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" "honor_category" NOT NULL,
	"name" text NOT NULL,
	"text" text NOT NULL,
	"media_id" uuid,
	"photo_zoom" double precision,
	"photo_object_position" text,
	"photo_offset_y" double precision,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedule_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"time" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"location" text,
	"highlight" boolean DEFAULT false NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" "media_source" NOT NULL,
	"static_path" text,
	"mime" text NOT NULL,
	"byte_size" integer NOT NULL,
	"bytes" "bytea",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection" "photo_collection" NOT NULL,
	"media_id" uuid NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_text_blocks" (
	"key" text PRIMARY KEY NOT NULL,
	"payload" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unmatched_rsvps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"typed_name" text NOT NULL,
	"name_normalized" text NOT NULL,
	"attending" boolean NOT NULL,
	"email" text,
	"companion_name" text,
	"microonibus" boolean,
	"message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gifts" ADD CONSTRAINT "gifts_media_id_site_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."site_media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guests" ADD CONSTRAINT "guests_group_id_guest_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."guest_groups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "honor_people" ADD CONSTRAINT "honor_people_media_id_site_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."site_media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_photos" ADD CONSTRAINT "site_photos_media_id_site_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."site_media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "guests_name_normalized_idx" ON "guests" USING btree ("name_normalized");--> statement-breakpoint
CREATE UNIQUE INDEX "unmatched_rsvps_name_normalized_idx" ON "unmatched_rsvps" USING btree ("name_normalized");