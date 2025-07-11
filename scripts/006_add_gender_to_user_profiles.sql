ALTER TABLE public.user_profiles
ADD COLUMN gender TEXT;

-- Optional: Add a policy to allow users to update their own gender
CREATE POLICY "Users can update their own gender."
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
