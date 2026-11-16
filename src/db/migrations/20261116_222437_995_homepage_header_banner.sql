-- Migration: homepage_header_banner
-- Singles: homepage
-- Entity scope: touched
-- Settings: homepage (single): fields.hero_tagline (added), fields.hero_headline (added), fields.hero_subheadline (added), fields.hero_cta_buttonText (added), fields.header_banner (added), fields.heroTagline (removed), fields.heroHeadline (removed), fields.heroSubheadline (removed), fields.heroCtaButtonText (removed)
-- Generated at: 2026-11-16T22:24:37.995Z
-- Dialect: PostgreSQL

-- UP
ALTER TABLE "single_homepage" ADD COLUMN "header_banner" text;

-- DOWN
ALTER TABLE "single_homepage" DROP COLUMN "header_banner";
