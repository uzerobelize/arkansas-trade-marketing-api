-- Migration: add_homepage_update
-- Collections: bookings, categories, form-submissions, forms, posts, tags
-- Singles: homepage, navigation, site-settings
-- Entity scope: touched
-- Settings: bookings: added
-- Settings: categories: added
-- Settings: form-submissions: added
-- Settings: forms: added
-- Settings: posts: added
-- Settings: tags: added
-- Settings: homepage (single): added
-- Settings: navigation (single): added
-- Settings: site-settings (single): added
-- Generated at: 2026-11-12T19:26:52.289Z
-- Dialect: PostgreSQL

-- UP
CREATE TABLE "dc_bookings" (
  "id" text PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "slug" text NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "created_by" text,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text NOT NULL,
  "start_time" timestamp NOT NULL,
  "end_time" timestamp,
  "timezone" text,
  "notes" text,
  "status" text NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_dc_bookings_slug" ON "dc_bookings" ("slug");
CREATE INDEX IF NOT EXISTS "idx_dc_bookings_created_by" ON "dc_bookings" ("created_by");
CREATE INDEX IF NOT EXISTS "idx_dc_bookings_created_at" ON "dc_bookings" ("created_at");

CREATE TABLE "dc_categories" (
  "id" text PRIMARY KEY NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "created_by" text,
  "title" text NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "icon" text,
  "description" text
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_dc_categories_slug" ON "dc_categories" ("slug");
CREATE INDEX IF NOT EXISTS "idx_dc_categories_created_by" ON "dc_categories" ("created_by");
CREATE INDEX IF NOT EXISTS "idx_dc_categories_created_at" ON "dc_categories" ("created_at");

CREATE TABLE "dc_form_submissions" (
  "id" text PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "slug" text NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "created_by" text,
  "form" text,
  "data" jsonb NOT NULL,
  "status" text NOT NULL,
  "spam_reason" text,
  "notes" text,
  "ip_address" text,
  "user_agent" text,
  "submitted_at" timestamp NOT NULL,
  "edited_at" timestamp,
  "edited_by" text
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_dc_form_submissions_slug" ON "dc_form_submissions" ("slug");
CREATE INDEX IF NOT EXISTS "idx_dc_form_submissions_created_by" ON "dc_form_submissions" ("created_by");
CREATE INDEX IF NOT EXISTS "idx_dc_form_submissions_created_at" ON "dc_form_submissions" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_dc_form_submissions_form" ON "dc_form_submissions" ("form");
CREATE INDEX IF NOT EXISTS "idx_dc_form_submissions_status" ON "dc_form_submissions" ("status");
CREATE INDEX IF NOT EXISTS "idx_dc_form_submissions_submitted_at" ON "dc_form_submissions" ("submitted_at");

CREATE TABLE "dc_forms" (
  "id" text PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "created_by" text,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "description" text,
  "fields" jsonb NOT NULL,
  "settings" jsonb,
  "notifications" jsonb,
  "status" text NOT NULL,
  "went_live_at" timestamp,
  "closed_message" text
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_dc_forms_slug" ON "dc_forms" ("slug");
CREATE INDEX IF NOT EXISTS "idx_dc_forms_created_by" ON "dc_forms" ("created_by");
CREATE INDEX IF NOT EXISTS "idx_dc_forms_created_at" ON "dc_forms" ("created_at");

CREATE TABLE "dc_posts" (
  "id" text PRIMARY KEY NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "created_by" text,
  "status" varchar NOT NULL DEFAULT 'draft',
  "first_published_at" timestamp,
  "title" text NOT NULL,
  "slug" text NOT NULL,
  "content" text,
  "featured_image" text,
  "author" text,
  "categories" jsonb,
  "tags" jsonb,
  "excerpt" text,
  "published_at" timestamp,
  "featured" bool,
  "seo" jsonb,
  "reading_time" int4,
  "word_count" int4
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_dc_posts_slug" ON "dc_posts" ("slug");
CREATE INDEX IF NOT EXISTS "idx_dc_posts_created_by" ON "dc_posts" ("created_by");
CREATE INDEX IF NOT EXISTS "idx_dc_posts_created_at" ON "dc_posts" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_dc_posts_featured_image" ON "dc_posts" ("featured_image");
CREATE INDEX IF NOT EXISTS "idx_dc_posts_author" ON "dc_posts" ("author");

CREATE TABLE "dc_tags" (
  "id" text PRIMARY KEY NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "created_by" text,
  "title" text NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "description" text
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_dc_tags_slug" ON "dc_tags" ("slug");
CREATE INDEX IF NOT EXISTS "idx_dc_tags_created_by" ON "dc_tags" ("created_by");
CREATE INDEX IF NOT EXISTS "idx_dc_tags_created_at" ON "dc_tags" ("created_at");

CREATE TABLE "single_homepage" (
  "id" text PRIMARY KEY NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "title" text NOT NULL,
  "slug" text NOT NULL,
  "hero_tagline" text,
  "hero_headline" text NOT NULL,
  "hero_subheadline" text,
  "hero_cta_button_text" text,
  "show_featured_post" bool,
  "featured_section_title" text,
  "show_latest_posts" bool,
  "latest_section_title" text,
  "latest_posts_count" int4,
  "show_category_strip" bool,
  "show_newsletter_cta" bool,
  "newsletter_heading" text,
  "newsletter_subheading" text
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_single_homepage_slug" ON "single_homepage" ("slug");
CREATE INDEX IF NOT EXISTS "idx_single_homepage_created_at" ON "single_homepage" ("created_at");

CREATE TABLE "single_navigation" (
  "id" text PRIMARY KEY NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "title" text NOT NULL,
  "slug" text NOT NULL,
  "header_links" jsonb,
  "footer_read_links" jsonb,
  "show_theme_toggle" bool,
  "show_search_icon" bool
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_single_navigation_slug" ON "single_navigation" ("slug");
CREATE INDEX IF NOT EXISTS "idx_single_navigation_created_at" ON "single_navigation" ("created_at");

CREATE TABLE "single_site_settings" (
  "id" text PRIMARY KEY NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  "title" text NOT NULL,
  "slug" text NOT NULL,
  "site_name" text NOT NULL,
  "tagline" text,
  "site_description" text,
  "logo" text,
  "social" jsonb
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_single_site_settings_slug" ON "single_site_settings" ("slug");
CREATE INDEX IF NOT EXISTS "idx_single_site_settings_created_at" ON "single_site_settings" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_single_site_settings_logo" ON "single_site_settings" ("logo");

-- DOWN
DROP TABLE "single_site_settings" CASCADE;

DROP TABLE "single_navigation" CASCADE;

DROP TABLE "single_homepage" CASCADE;

DROP TABLE "dc_tags" CASCADE;

DROP TABLE "dc_posts" CASCADE;

DROP TABLE "dc_forms" CASCADE;

DROP TABLE "dc_form_submissions" CASCADE;

DROP TABLE "dc_categories" CASCADE;

DROP TABLE "dc_bookings" CASCADE;
