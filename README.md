
# Layers ❄️🎿

**AI Integrated wardrobe. So you never dress too hot or too cold.**

## Try It Out - https://layers4.vercel.app/

Here's a recommended sequence of queries for the AI to see the app in action:

### Demo Flow (Recommended)
1. Ask: "What is my location?"
2. Ask: "What is the weather?" 
3. Ask: "What should I wear?" *(notice limited recommendations)*
4. Tell the AI: "I'm wearing [your outfit] and I feel [too hot/cold/perfect]"
5. Add clothing: "I have [list items] in my wardrobe"
6. Ask again: "What should I wear?" *(see improved recommendations)*

*Or try the pre-populated demo account: mjsipes@gmail.com / 123456*


## The Journey Behind the Tech

One day last winter I was skiing in Lake Tahoe. As someone who grew up skiing maybe 10 days a year, I never dressed right for the mountains. Twenty degrees and thirty degrees both sound like "freezing" when you're used to 60s and 70s, but that ten-degree difference can be the difference between a perfect day and being hot or cold.

Then I had the following thought: It would be a really interesting to create an app that connects LLM to a database of Clothing and Logs and see if it could give you amazing recomendations simply based on logs of previous days answers to the following questions : what did you wear today? where are you, what day is it, and were you too hot or too cold?

This was the start of my idea Layers.

A little more context: a summer ago I worked on creating a rag solution make an ai model give amazing responses to support questions for a ring central article writers. The common theme is it is really common in cs right now to be looking for types of data that would pair amazing with LLMs to be productive/have value/ be better. 

I think this  would be such an interesting problem because i can use it through the winter and then see how accurate the result are: becuase

explanaition:
If I ask chat gpt what the weather is? -> it will web search and return you the weather
If I ask what is the weather today? -> it will web seaerch and return you the weather and reason about what you should wear and then give you an amazigly detailed recomendation:

-> give result. 

now here is wher my first problem arises, and that is were i think layers is a good solution. 
i dont own this, i dot own that, but overall i rthnk i might be to hot in this.

Now I have gone to the giants game before with my friends and I broguth a hoodie and even in the hoodie i was still freexing cold, and I also havefreidn who could go in shirt and tshirt and literally be fine and maybe even say the weather was nice out, maybe they wil say it was cold. 

Poinnt = everyone is different, one recomendation would not fit everybody, and so everybodyies input prompt of what is the weather what should i wear should not be the same. The input prompt should inlude context about the user, what clothing they own, and specifical examples of what they wore on certain days, what was the weather liek on that day, and did they end up to hot or to cold?

And that is when I cam to my hypothesis: I trhink if you ask the following : 
If you create a prompt like this you would be amazing.

System 
Context:
Users Owns The following articles of clothing:
Black TShirt:
Green Pants: my luluemon pants.
Here are relevant logs for todays date:
202-5-43: Lake Tahoe , 6 degrees, Wore: ski jacket, ski helmet. this and that. User Feedback: I was just right today.
User:
I am in Lake Tahoe, what should i wear today?


or


System:
The user will often ask you about weather recomendations. "What should I wear today?" If a user uses this app, returning logs and layers will provide you lots of context about users previous behavior, . So make those tool calls and reason over the reults, before returning to the user. If the user does not have any logs to reason over, just make your best guess. If trhe user does not have any layers to reason over or not enough to make effective outfit, you can ask the user if they own a type of clothing to see if you can add with get add: If they dont have the clothing you can recomend for them to purchase.
Continually, the user is encouraged to share information about their wardrobe, about previous experiences, you can log those experiences and previous experiences with add_log and add_layer. if a user brings up logs in convesation, you can do quick search of the wardrobe with get_layers search_layers. We recomend you do search layers first because iti s semantic and will only return to you relevant erults, but if you do not get resutls it is okay to call get_layers. 
suggest new clothing for the user to return:
Tools:
get_user_logs:
get_user_layers:
User:
I am in Lake Tahoe, what should i wear today?

then i think that will result in a super accurate recomendation. It would be a great experiemnt for me to do because i ski a lot, and i think with as little as 3 previous days of experience it will work. And i skiied 25 days last season so I will have 30 days of great context.

Since this is LLM Plus design. (gpt wrapepr or cost plus in finance terms) My app is built around the interaction of :
What should I wear today?
What did you wear today?

I want this interaction to be as seamlesss as possible. 




I would not like users to have to enter in their logs and layers, I woudl like in conversation for the AI to add the logs and layers it lealrns about from you through natural convesation. 
# 1
{
User types in through natural language, 
User types in by hand, 
user uploads a photo
}

# 2
#half way through: i wanted the best way for the ai to be able to present this informatino to you. this launched the total next stetp of the progress: will my app bnring more value if it is puerly a chat response returning markdown, or if i architect a ui that the ai controls and can feed you results through. I can explore user generated objects and full on UI's. 
Then I wanted the best way f



This launched me into trying to set up the AI connected to the DB:
# Big Decisions:
mcp versus tool calling: the two options are something that is the future usb, or something that is old and janky:
# mcp
spent 2 weeks figuring this out.
learned the options were not new v old, but something simple and lightweight, versus something that expands across different chat interfaces. for the sake of my current project, tool calling was totally going to be fine.
# toolcalling
openai api versus vercel ai sdk
I spent two week learning and trying to make it an mcp.
I used tool calling.



Once this was working, i got to the second question, best way to present this? What should i wear today? And it was doing markdown output, but I wondered would it be better as a fully fledge ui. AI v UI v both v mixed.
This consumed my summer. 


-example 1

- example 2


- struggled with mobil design



why? 
because I see lots of value in this question. 
do i focus on this ore do i focus on mcp?

current answer: i spent 80% of my time on the ui. evidence for rigidness, i still have amazing ideas for making the ui better, but i need to spend a few months going back to improving on the ai purely partb of the app,(do i need to right now go back to the ai and make the changes i am thinking about? reasearch system prompt and how tool calling makes the user prompt?) so i do not slow to a halt on the ui, but doing all of this so i can go back to the ui because i promise thisis not done, i still have ideas about theb ui i want to do i want to do the following:




final conclusion: 
the entire scope of this proejct is only relevant until this is only usefull until llms context window takes up our entire life. 
i would love for people to try and for peopel to give feedback
























## The Central Question

I see two possible paths ahead:

**Path 1: AI-First Interfaces** - If chat becomes the dominant interface, should developers focus purely on APIs and MCP servers? No traditional UI at all—just services that AI can orchestrate on demand.

**Path 2: Traditional UI with AI Integration** - Companies like Cursor and Claude are succeeding with seamless AI integration into familiar interfaces. Maybe the future is about mastering this hybrid approach.

Through developing Layers, I tested these hypotheses with specific experiments/explorations.

## Experiment 1: Dual AI UI and Traditional UI

I designed Layers with a split screen, resizable window where both traditional and AI interfaces can perform identical operations on the database. Both can do the same thing, and the AI can actually control the UI through dynamic cards.

The AI can dynamically pull up different components—displaying specific logs, layers, or immediately showing newly added items. When the AI adds layers, it can immediately display them for user review. Both the traditional interface and AI chat handle the same CRUD operations (update, delete, select, insert) on the database's logs and layers.

## Experiment 2: The MCP Deep Dive (Two Weeks in the Wilderness)

One of my most significant technical challenges was spending two weeks trying to expose my app's AI functionality through a Model Context Protocol server instead of simple tool calling.

I dove deep into the emerging MCP ecosystem, spending two weeks exploring:
- How to structure MCP servers
- Deploying to Vercel and Cloudflare Workers  
- OAuth authentication for MCP
- The MCP inspector tools

I explored the following documentation:
- [Model Context Protocol documentation](https://modelcontextprotocol.io/docs/getting-started/intro)
- [OpenAI's MCP integration guides](https://platform.openai.com/docs/guides/tools-connectors-mcp)
- [Vercel's MCP server deployment](https://vercel.com/docs/mcp/deploy-mcp-servers-to-vercel)
- [Cloudflare's remote MCP server guides](https://developers.cloudflare.com/agents/guides/remote-mcp-server/)

## Experiment 3: Keyword Search vs Semantic Search vs Hybrid Search

The shadcn datatable component struck my eye over the summer. It had me wondering from a UI point of view when is it appropriate to graduate a table to a datatable. Datatable = table with select, sort and filter functions.

References: [shadcn datatable docs](https://ui.shadcn.com/docs/components/data-table) vs [shadcn table docs](https://ui.shadcn.com/docs/components/table)

I was also really curious to learn how to implement the datatable. It is pretty interesting and complicated - the shadcn datatable docs had really great documentation on how to create one. It uses react-tanstack-table, an npm package I have always been pretty interested about. TanStack provides other things like a router which I had heard about when I was learning about the difference between different router solutions like React Router, TanStack Router, and Next.js file system routing.

The datatable's search filter feature is really cool. It's a keyword search that runs on the client in JavaScript - very wicked fast and snappy.

I was curious if it could be enhanced by semantic search as well. What if you keyword searched for a type of clothing you put into the database but you didn't spell it correctly? Or searched for a log via description but you didn't know exactly the way you described the log? Or you just wanted to type in "cold" and get all logs of days that were cold even if that keyword wasn't specifically in the log?

So I implemented it. On every keystroke in the search bar, it sent a request to a Supabase edge function which would vector embed the query and match the query to the closest logs/layers in the vector embedding column of the log/layer table. I vector embedded all my logs and layers using Supabase: https://supabase.com/docs/guides/ai/semantic-search

I implemented a hybrid search where it would handle search based upon keywords for logs in the name and description and also the semantic embedding. Logs would keyword off of date, place, outfits worn and description and then also AI embedding.

**Problem I'm still looking for help on**: For my RAG solution I know there is a lot of "art" in how you embed a piece of data, and I did not spend a great amount of time working on that. What would an expert say is the best way to implement hybrid search on my database? Do we need hybrid search to sort by values or is there a way to embed pretty hard knowledge like the temperature number so if a user types "50" or "fifty" it would show up?

**The brutal reality**: I found that the advantage of the purely keyword search to run instantaneously on the client far outweighed the benefits of running a hybrid search on the server. The keyword search was instantaneous with results coming in every keystroke, where the hybrid search would always trigger a spinner even if it was just for a second or two. 

At the end of the day, my data is not that complex. Making keyword search across all entries in the table: date, location, outfits, and description (as opposed to just description) makes it feel really smart and fast.

Also worth noting: my app loads all the user's logs and layers to the client. I understand for apps like Gmail or Google where the client doesn't load all that upfront, a hybrid search makes sense because keyword search anyway has to go to the server, and so doing AI and keyword search together would be very cool.

## The Ongoing Experiments

Several experiments remain in progress:

### AI-Powered Multiselect

The multiselect component presents an interesting opportunity. Currently, when logging what you wore, the multiselect uses keyword search—but there's no way to add new layers through it. If I set the placeholder to "what did you wear today?" and a user types "I wore a blue shirt," it won't find anything because there's no keyword match.

The log can contain an array of layers, and I wanted a good way to allow for displaying and selecting all the layers. Multiselect is very cool, but the problem is it's keyword search and there's no way to add layers from it.

I think AI could be very cool if it was a text box and the user types "I wore a blue shirt and my green pants." Then the AI takes that as input and has a tool to search/add the database. Based upon the search query it looks for existing pieces of clothing and returns their IDs. So if blue shirt was in the database it returns it, and if green pants are nowhere to be found from keyword/semantic search, the AI could add the green pants as a new layer.

But maybe the AI doesn't add it automatically but rather it's just a suggestion. So it sends to the client and then the user sees they typed "I wore a blue shirt and green pants" and sees next to it little chips for the blue shirt and green pants. But maybe the green pants since it's a suggestion has a little green checkbox that must be checked for it to become completely bolded and that user confirmation confirms.

This might be really nice, and it will benefit from the fact that first-time users will be able to add layers through this component as opposed to typing in what they wore for a day and receiving no results. This could be a good use of AI integration.

Reason I have not yet implemented: I was mentally hung up on whether this should be today's log or its own view.

### Generative UI Exploration

This connects to the broader UI philosophy question. If the future is AI-first interfaces, how will that actually look? AI currently generates Markdown with structured tables, bolding, and indentation. But generative user interfaces are becoming more interesting—like what ChatGPT is starting to do with shopping experiences.

The Vercel AI SDK makes this possible with their generative UI features: https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces

My mobile design currently has three panels (chat, weather, wardrobe). It could be simplified to just chat, where the AI invokes generative UI components as functional calls—prebuilt React components that developers create, but the AI decides when and how to display them with the appropriate data.

The developer benefit: you still create objects, but there's no layout, positioning, centering, or spacing complexity in relation to other components.

The theoretical endpoint might be AI generating raw HTML, CSS, and JavaScript—or direct React components—combining data and code generation beyond current generative UI approaches.

### Image Input Integration

I would love for a user to be able to take a photo of them and their outfit for the day, upload it and have all the clothing pieces be logged correctly.

## Important Takeaways

Perhaps the most telling insight: I spent about 80% of development time on the traditional UI. When added weather into my app, I created a get_weather function that took in date and location, and outputted weather information. Adding this functionality to the AI UI was a simple as adding that function to the list of tool calls for the model. On the other hand I racked my brain for a week over biulding the weather card, and deciding where it should fit into the app.

Aside from that, non of my other takeaways are concrete, rather I think these experiements gave me valuable insight into these question about ui, and the devloper side of building . In terms of which are better for users , that is now up to you guys to say, so try the app!

## Remaining Questions


 really i just have one main one which is about will user generated ovjects become popoular and then will ai maybe even create those user generated objects themselve,s and then will people only interact with the chatbot, and the chatbot will be able to connect with apps through mcp to share data and pregenerated generative objects or even maybe generate the veiws of the data on the fly itself? so maybe 4 questions, make sure you order them correctly so they buil on each other


## Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Backend**: [Supabase](https://supabase.com/) + [Next.js API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **AI**: [Vercel AI SDK](https://sdk.vercel.ai/) with [OpenAI API](https://openai.com/api/)
- **APIs**: [Google Maps API](https://developers.google.com/maps), [Visual Crossing Weather API](https://www.visualcrossing.com/weather-api/)
- **Hosting**: [Vercel](https://vercel.com/)


*This is a demo project exploring the intersection of AI and traditional user interfaces.*



the first thing i gave you is the new outline i want my readme post to follow: pure chronological order story telling
the second thing i gave you are the peices of the previous readme which i want you to copy into the appropriate sections and make it flow. the previous readme i just did not like my organization of the story. the tone and level of detail should not change. 
please fill in all the missing information from the readme into the new readme so i have a final draft. remember my personal tone, i appreciate specificity, honesty, clarity. do not change my tone, keep the same tone and level of detai from the original readme, just filter all of the sections correctly into their new sections to follow a true chronological order story