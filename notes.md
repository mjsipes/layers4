npx supabase gen types typescript --project-id zoyvqdccoilrpiwpzzym --schema public > lib/supabase/database.types.ts


**TODO:**


## important notes ---------------------
ai passed in .9 as similarity, so maybe dont let it control that value
probably will just want to create a getrelevantprevious logs function that simply gets previous logs with similar weather or similar place or similar time of year, proabily will not even need semantic search for that.
if we have embeddings in db then we do not want to get all with * because it will fill context of ai way to much.
## -------------------------------------
embedd logs and layers + create semantic search / keyword search and maybe datatable
^^^^THIS WOULD BE REALLY GOOD PRACTICE^^^






add todays recs:
when i open the app it should have my recomendations for today. it probably should store the computation. probably a logs_layers_recs join table or layer_recs and . i think one of the question we are fighting with is do we automatically generate a log for the day we are on? is weather a part of the same days log? if everything is one. then we will have logs_layers join. then we will ahve logs_layers_recs join table and a logs_recs_description join table or something like that. everything will be build around the concept of a log. then at the top we will have buttons for today, +log, and +layer.  think this will be a good direction to head into because then we will becoming more like calendar. people can store whatever they want in a day. it will become more diverse.

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