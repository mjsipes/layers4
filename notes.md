npx supabase gen types typescript --project-id zoyvqdccoilrpiwpzzym --schema public > lib/supabase/database.types.ts


**TODO:**

semantic search?

recomendations in ui, then inline object generation

what are you wearing today?
we should try to create an add log card that instead of the multi select and text area, it is two text areas, first with preveiw of what are you wearing today? and the second with how did you feel? (too hot, too cold, just right) then have ai parse it and link logs


get rid of comfort

clean up lat lon / real address logic. (chat tools) (google api) (read through all files)

make weather card able to search other places weather?

then add a history button

google lense/ image upload for app

what should i wear today?
i wore my uniqlo heat tech, my my orange pants, my patagonia shell, and i got hot by the time i finished the day.

little things: blue border around chips in grid dissapeared. weather card is not perfectly set at fixed pixels. is google api key safe to expose through the browser?


login with google:
https://supabase.com/docs/guides/auth/social-login/auth-google#google-pre-built
https://console.cloud.google.com/auth/clients?inv=1&invt=Ab2yVg&project=mymlproject-431919

when it comes to styling, what is the difference between a card and a badge? should i always try to use the shadcn classes? and then just override them?
read through the code
and logically how should i decide on my spacing and font sizes? ex (sortfilter bar versus weathercard first row)