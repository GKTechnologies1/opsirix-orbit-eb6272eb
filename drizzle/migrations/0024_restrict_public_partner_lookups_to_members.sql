REVOKE ALL ON FUNCTION public.public_partner_representatives() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.public_partner_services() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.public_partner_representatives() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.public_partner_services() TO authenticated, service_role;
REVOKE ALL ON public.nexus_inquiries, public.nexus_inquiry_assignments FROM anon;