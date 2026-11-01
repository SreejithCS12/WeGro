-- ==============================================================================
-- PERSONAL FITNESS TRACKER — ADD THEME COLOR TO PROFILES
-- Migration: 20261101000003_add_theme_color_to_profiles.sql
-- ==============================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT 'purple';
