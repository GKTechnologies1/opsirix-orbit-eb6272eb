CREATE TABLE public.site_content_blocks (
  key text PRIMARY KEY,
  label text NOT NULL,
  kind text NOT NULL DEFAULT 'section' CHECK (kind IN ('section','faq','cta','pricing')),
  pages text[] NOT NULL DEFAULT '{}',
  published_version_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.site_content_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_key text NOT NULL REFERENCES public.site_content_blocks(key),
  version integer NOT NULL,
  body jsonb NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','superseded','discarded')),
  change_summary text NOT NULL,
  author_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  published_by uuid,
  UNIQUE (block_key, version)
);
GRANT SELECT ON public.site_content_blocks, public.site_content_versions TO authenticated;
GRANT ALL ON public.site_content_blocks, public.site_content_versions TO service_role;
ALTER TABLE public.site_content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read content blocks" ON public.site_content_blocks FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins read content versions" ON public.site_content_versions FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.content_assert_admin() RETURNS uuid LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v uuid := auth.uid();
BEGIN
  IF v IS NULL OR NOT public.has_role(v,'admin') THEN RAISE EXCEPTION 'Only Admin/CEO can manage website content' USING ERRCODE = '42501'; END IF;
  RETURN v;
END $$;

CREATE OR REPLACE FUNCTION public.content_validate(_body jsonb) RETURNS void LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
DECLARE k text; v text;
BEGIN
  IF coalesce(trim(_body->>'heading'),'') = '' OR coalesce(trim(_body->>'body'),'') = '' THEN
    RAISE EXCEPTION 'Heading and body are required' USING ERRCODE = 'check_violation'; END IF;
  IF length(_body->>'heading') > 160 OR length(_body->>'body') > 2000 THEN RAISE EXCEPTION 'Text is too long' USING ERRCODE = 'check_violation'; END IF;
  FOREACH k IN ARRAY ARRAY['cta_href','secondary_href'] LOOP
    v := _body->>k;
    IF v IS NOT NULL AND v <> '' AND NOT (v ~ '^/[A-Za-z0-9/_\-]*$' OR v ~ '^https://[A-Za-z0-9.\-]+(/[^\s]*)?$') THEN
      RAISE EXCEPTION 'Link % must be a site path like /nexus/help or an https address', v USING ERRCODE = 'check_violation'; END IF;
  END LOOP;
  IF (_body ? 'cta_href') <> (_body ? 'cta_label') THEN RAISE EXCEPTION 'A button needs both a label and a link' USING ERRCODE = 'check_violation'; END IF;
END $$;

CREATE OR REPLACE FUNCTION public.save_content_draft(_key text, _body jsonb, _summary text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_actor uuid := public.content_assert_admin(); v_id uuid; v_next int;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM site_content_blocks WHERE key = _key) THEN RAISE EXCEPTION 'Unknown content block'; END IF;
  IF coalesce(trim(_summary),'') = '' THEN RAISE EXCEPTION 'A change summary is required' USING ERRCODE = 'check_violation'; END IF;
  PERFORM public.content_validate(_body);
  UPDATE site_content_versions SET status = 'discarded' WHERE block_key = _key AND status = 'draft';
  SELECT coalesce(max(version),0)+1 INTO v_next FROM site_content_versions WHERE block_key = _key;
  INSERT INTO site_content_versions (block_key, version, body, change_summary, author_id) VALUES (_key, v_next, _body, trim(_summary), v_actor) RETURNING id INTO v_id;
  INSERT INTO audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary, metadata)
  VALUES (NULL, v_actor, 'content.draft_saved', 'site_content', _key, 'Website content draft saved.', jsonb_build_object('version', v_next));
  RETURN v_id;
END $$;

CREATE OR REPLACE FUNCTION public.publish_content_version(_version uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_actor uuid := public.content_assert_admin(); r site_content_versions; v_kind text;
BEGIN
  SELECT * INTO r FROM site_content_versions WHERE id = _version;
  IF r.id IS NULL THEN RAISE EXCEPTION 'Version not found'; END IF;
  SELECT kind INTO v_kind FROM site_content_blocks WHERE key = r.block_key;
  IF v_kind = 'pricing' THEN RAISE EXCEPTION 'Pricing stays hidden until the owner approves a reconciled pricing schedule' USING ERRCODE = 'check_violation'; END IF;
  PERFORM public.content_validate(r.body);
  UPDATE site_content_versions SET status = 'superseded' WHERE block_key = r.block_key AND status = 'published' AND id <> r.id;
  UPDATE site_content_versions SET status = 'published', published_at = now(), published_by = v_actor WHERE id = r.id;
  UPDATE site_content_blocks SET published_version_id = r.id, updated_at = now() WHERE key = r.block_key;
  INSERT INTO audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary, metadata)
  VALUES (NULL, v_actor, 'content.published', 'site_content', r.block_key, 'Website content published.', jsonb_build_object('version', r.version));
END $$;

CREATE OR REPLACE FUNCTION public.unpublish_content_block(_key text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_actor uuid := public.content_assert_admin();
BEGIN
  UPDATE site_content_versions SET status = 'superseded' WHERE block_key = _key AND status = 'published';
  UPDATE site_content_blocks SET published_version_id = NULL, updated_at = now() WHERE key = _key;
  INSERT INTO audit_events (organization_id, actor_id, event_type, subject_type, subject_id, summary)
  VALUES (NULL, v_actor, 'content.unpublished', 'site_content', _key, 'Website content unpublished; built-in text shows instead.');
END $$;

CREATE OR REPLACE FUNCTION public.restore_content_version(_version uuid, _summary text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r site_content_versions; v_id uuid;
BEGIN
  PERFORM public.content_assert_admin();
  SELECT * INTO r FROM site_content_versions WHERE id = _version;
  IF r.id IS NULL THEN RAISE EXCEPTION 'Version not found'; END IF;
  v_id := public.save_content_draft(r.block_key, r.body, coalesce(nullif(trim(_summary),''), 'Restored version ' || r.version));
  PERFORM public.publish_content_version(v_id);
  RETURN v_id;
END $$;

CREATE OR REPLACE FUNCTION public.published_site_content(_keys text[]) RETURNS TABLE(key text, body jsonb, version integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT b.key, v.body, v.version FROM site_content_blocks b JOIN site_content_versions v ON v.id = b.published_version_id
  WHERE b.key = ANY(_keys) AND b.kind <> 'pricing' AND v.status = 'published'
$$;
GRANT EXECUTE ON FUNCTION public.published_site_content(text[]) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_update_catalog_choice(_id text, _description text, _aliases text[], _client_label text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_actor uuid := public.content_assert_admin(); v_old text; v_ver int;
BEGIN
  IF coalesce(trim(_description),'') = '' THEN RAISE EXCEPTION 'A description is required' USING ERRCODE = 'check_violation'; END IF;
  SELECT label, catalog_version INTO v_old, v_ver FROM service_catalog WHERE id = _id;
  IF v_old IS NULL THEN RAISE EXCEPTION 'Choice not found'; END IF;
  UPDATE service_catalog SET description = trim(_description), search_aliases = coalesce(_aliases,'{}'), client_label = nullif(trim(_client_label),''), updated_at = now() WHERE id = _id;
  INSERT INTO service_catalog_changes (service_id, change_type, previous_label, new_label, changed_by, catalog_version) VALUES (_id, 'edited', v_old, v_old, v_actor, v_ver);
END $$;

CREATE OR REPLACE FUNCTION public.admin_move_catalog_choice(_id text, _direction int) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_actor uuid := public.content_assert_admin(); r service_catalog; n service_catalog;
BEGIN
  SELECT * INTO r FROM service_catalog WHERE id = _id;
  IF r.id IS NULL THEN RAISE EXCEPTION 'Choice not found'; END IF;
  SELECT * INTO n FROM service_catalog WHERE category_id = r.category_id AND id <> r.id
    AND CASE WHEN _direction < 0 THEN display_order <= r.display_order ELSE display_order >= r.display_order END
    ORDER BY CASE WHEN _direction < 0 THEN -display_order ELSE display_order END, id LIMIT 1;
  IF n.id IS NULL THEN RETURN; END IF;
  UPDATE service_catalog SET display_order = n.display_order + CASE WHEN n.display_order = r.display_order THEN sign(_direction)::int ELSE 0 END, updated_at = now() WHERE id = r.id;
  UPDATE service_catalog SET display_order = r.display_order, updated_at = now() WHERE id = n.id;
  INSERT INTO service_catalog_changes (service_id, change_type, changed_by, catalog_version) VALUES (_id, 'reordered', v_actor, r.catalog_version);
END $$;

CREATE OR REPLACE FUNCTION public.admin_set_catalog_retired(_id text, _retired boolean) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_actor uuid := public.content_assert_admin(); r service_catalog;
BEGIN
  SELECT * INTO r FROM service_catalog WHERE id = _id;
  IF r.id IS NULL THEN RAISE EXCEPTION 'Choice not found'; END IF;
  -- The permanent ID is never changed or deleted; existing selections keep pointing at it.
  UPDATE service_catalog SET is_active = NOT _retired, retired_at = CASE WHEN _retired THEN now() END, updated_at = now() WHERE id = _id;
  INSERT INTO service_catalog_changes (service_id, change_type, previous_label, new_label, changed_by, catalog_version)
  VALUES (_id, CASE WHEN _retired THEN 'retired' ELSE 'reactivated' END, r.label, r.label, v_actor, r.catalog_version);
END $$;

CREATE OR REPLACE FUNCTION public.admin_add_catalog_choice(_id text, _category text, _label text, _description text, _aliases text[]) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_actor uuid := public.content_assert_admin(); v_type text; v_ver int; v_ord int;
BEGIN
  IF _id !~ '^[a-z0-9]+(_[a-z0-9]+)*$' THEN RAISE EXCEPTION 'Permanent ID must use lowercase letters, numbers and underscores' USING ERRCODE = 'check_violation'; END IF;
  IF coalesce(trim(_label),'') = '' OR coalesce(trim(_description),'') = '' THEN RAISE EXCEPTION 'Label and description are required' USING ERRCODE = 'check_violation'; END IF;
  SELECT partner_type INTO v_type FROM service_categories WHERE id = _category;
  IF v_type IS NULL THEN RAISE EXCEPTION 'Category not found'; END IF;
  SELECT coalesce(max(catalog_version),1), coalesce(max(display_order),0)+10 INTO v_ver, v_ord FROM service_catalog WHERE category_id = _category;
  -- New choices start retired (not selectable) so they never go live without a separate activation step.
  INSERT INTO service_catalog (id, partner_type, category_id, label, description, search_aliases, display_order, is_active, catalog_version, retired_at)
  VALUES (_id, v_type, _category, trim(_label), trim(_description), coalesce(_aliases,'{}'), v_ord, false, v_ver, now());
  INSERT INTO service_catalog_changes (service_id, change_type, new_label, changed_by, catalog_version) VALUES (_id, 'added', trim(_label), v_actor, v_ver);
END $$;

REVOKE EXECUTE ON FUNCTION public.save_content_draft(text,jsonb,text), public.publish_content_version(uuid), public.unpublish_content_block(text), public.restore_content_version(uuid,text),
  public.admin_update_catalog_choice(text,text,text[],text), public.admin_move_catalog_choice(text,int), public.admin_set_catalog_retired(text,boolean), public.admin_add_catalog_choice(text,text,text,text,text[]) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.save_content_draft(text,jsonb,text), public.publish_content_version(uuid), public.unpublish_content_block(text), public.restore_content_version(uuid,text),
  public.admin_update_catalog_choice(text,text,text[],text), public.admin_move_catalog_choice(text,int), public.admin_set_catalog_retired(text,boolean), public.admin_add_catalog_choice(text,text,text,text,text[]) TO authenticated;