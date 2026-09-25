CREATE OR REPLACE FUNCTION public.content_validate(_body jsonb)
 RETURNS void LANGUAGE plpgsql IMMUTABLE SET search_path TO 'public'
AS $function$
DECLARE k text; v text; it jsonb; n int;
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
  IF _body ? 'items' THEN
    IF jsonb_typeof(_body->'items') <> 'array' THEN RAISE EXCEPTION 'Questions must be a list' USING ERRCODE = 'check_violation'; END IF;
    n := jsonb_array_length(_body->'items');
    IF n < 1 OR n > 12 THEN RAISE EXCEPTION 'Add between 1 and 12 questions' USING ERRCODE = 'check_violation'; END IF;
    FOR it IN SELECT * FROM jsonb_array_elements(_body->'items') LOOP
      IF coalesce(trim(it->>'q'),'') = '' OR coalesce(trim(it->>'a'),'') = '' THEN RAISE EXCEPTION 'Every question needs a question and an answer' USING ERRCODE = 'check_violation'; END IF;
      IF length(it->>'q') > 200 OR length(it->>'a') > 1200 THEN RAISE EXCEPTION 'A question or answer is too long' USING ERRCODE = 'check_violation'; END IF;
    END LOOP;
  END IF;
  IF _body::text LIKE '%—%' THEN RAISE EXCEPTION 'Please replace long dashes with commas, periods or colons' USING ERRCODE = 'check_violation'; END IF;
END $function$;