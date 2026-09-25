CREATE OR REPLACE FUNCTION public.nexus_inquiry_mark_test() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.is_test := NEW.is_test OR public.nexus_is_test_email(NEW.email); RETURN NEW; END $$;
CREATE TRIGGER nexus_inquiry_mark_test BEFORE INSERT ON public.nexus_inquiries FOR EACH ROW EXECUTE FUNCTION public.nexus_inquiry_mark_test();