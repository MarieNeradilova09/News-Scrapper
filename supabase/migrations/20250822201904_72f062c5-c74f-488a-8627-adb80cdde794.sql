-- Allow localized categories in sources by removing restrictive CHECK constraint
ALTER TABLE public.sources
DROP CONSTRAINT IF EXISTS sources_category_check;