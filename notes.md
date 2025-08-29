npx supabase gen types typescript --project-id zoyvqdccoilrpiwpzzym --schema public > lib/supabase/database.types.ts

what are you wearing today?
what should i wear today?

**TODO:**
(read through all files) clean up lat lon / real address logic. (chat tools) (google api) (remove zustand?)
home.tsx->todays selectlog.tsx
investigate chatbot recomendations / object generation / ai what did you wear today?
integration with stripe
eliminate tabslist for mobile. maybe eliminate for web.
image upload - chatgpt image model + maybe segment image model or ai generation model
semantic search - on logs and layers... ?do i store embeddings in log/layer table or new database table.
get rid of comfort value
for responsive layout: weather card spacing. 


**other considerations**
make weather card able to search other places weather?
then add a history button
when it comes to styling, what is the difference between a card and a badge? should i always try to use the shadcn classes? and then just override them?