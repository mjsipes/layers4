npx supabase gen types typescript --project-id zoyvqdccoilrpiwpzzym --schema public > lib/supabase/database.types.ts


**TODO:**
insert cards: must be able to add layer to outfit and add outfit to log
outfit card should show layers and log card should show outfit and layers
select cards: should be able to update everything
change lat and lon to real location / make weather card able to look at other places weather... then add a history button

google lense/ image upload for app

what did you wear today?
what should i wear today?
i wore my uniqlo heat tech, my my orange pants, my patagonia shell, and i got hot by the time i finished the day.


get rid of zustand?

get rid of outfits?
also log should have default date and location and should be set up to get weather via trigger


login with google:
https://supabase.com/docs/guides/auth/social-login/auth-google#google-pre-built
https://console.cloud.google.com/auth/clients?inv=1&invt=Ab2yVg&project=mymlproject-431919








alter table public.logs_clothing enable row level security;

-- Read policy: user can see rows tied to their own logs
create policy "select if owns log"
on public.logs_clothing
for select
using (
  exists (
    select 1 from logs
    where logs.id = logs_clothing.log_id
      and logs.user_id = auth.uid()
  )
);

-- Insert policy: user can only create links between their own logs and their own clothes
create policy "insert if owns both"
on public.logs_clothing
for insert
with check (
  exists (
    select 1 from logs
    where logs.id = logs_clothing.log_id
      and logs.user_id = auth.uid()
  ) and
  exists (
    select 1 from clothes
    where clothes.id = logs_clothing.clothing_id
      and clothes.user_id = auth.uid()
  )
);
