CREATE POLICY "Admins can update credential reviews"
ON public.partner_credentials
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY "Users delete own pending credential files" ON storage.objects;
CREATE POLICY "Users delete own pending credential files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'partner-credentials'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND EXISTS (
    SELECT 1
    FROM public.partner_credentials credential
    WHERE credential.storage_path = name
      AND credential.user_id = auth.uid()
      AND credential.status = 'pending'
  )
);