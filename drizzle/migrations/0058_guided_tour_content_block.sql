ALTER TABLE public.site_content_blocks DROP CONSTRAINT site_content_blocks_kind_check;
ALTER TABLE public.site_content_blocks ADD CONSTRAINT site_content_blocks_kind_check CHECK (kind IN ('section','faq','cta','pricing','tour'));
INSERT INTO public.site_content_blocks (key, label, kind, pages)
VALUES ('app.guided_tours', 'Signed-in guided tours', 'tour', ARRAY['Signed-in workspaces']::text[])
ON CONFLICT (key) DO NOTHING;
COMMENT ON TABLE public.site_content_blocks IS 'Versioned website and signed-in guidance content; publishing remains a separate Admin/CEO action.';