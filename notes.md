npx supabase gen types typescript --project-id zoyvqdccoilrpiwpzzym --schema public > lib/supabase/database.types.ts


**TODO:**

integration with stripe
read the code / make chatbot good / inline recs / recomendations in ui, then inline object generation, make ai great again

if we want to make it so home.tsx can add info for the log, we need to switch back to the concept of home.tsx being a log for the day and just conditionally render the weather recommendations for it. other wise there is to much stuff going on.

for responsive layout: weather card spacing. 
intuitive when getting recomendations
log and layer move into bottom navbar to remove all tabslists in the app. add log/ add layer adds from the log / layer section respectively either as popup or inline or something. mobile must be able to edit inline from the page. no table veiw, just grid.

- experiment with vercel object generation
- discuss design trouble with having today be a log versus being its own veiw. the problem i face is the home screen is a veiw of a log. but the difference is that a log for any one day is optional. where as for today, i would need to have a log. 
work on get get-recomendations api route, or not, idk

image upload

what are you wearing today? and redo button for recomendations

semantic search?

what are you wearing today?

get rid of comfort

clean up lat lon / real address logic. (chat tools) (google api) (read through all files)

make weather card able to search other places weather?

then add a history button

google lense/ image upload for app

what should i wear today?
i wore my uniqlo heat tech, my my orange pants, my patagonia shell, and i got hot by the time i finished the day.

little things: blue border around chips in grid dissapeared. weather card is not perfectly set at fixed pixels. is google api key safe to expose through the browser?


when it comes to styling, what is the difference between a card and a badge? should i always try to use the shadcn classes? and then just override them?
read through the code
and logically how should i decide on my spacing and font sizes? ex (sortfilter bar versus weathercard first row)