# layers4.vercel.com 🎿⚡

**Live App: https://layers4.vercel.app/**  
Test Account:  
- Username: mjsipes@gmail.com  
- Password: 123456

## The Origin Story

I was skiing last winter when I got the idea for this app. As an intermediate skier who grew up skiing about 10 days a year, I never dressed right. It was either freezing cold out and I was freezing, or somehow it was not cold enough and I ended up really hot. 

If you've ever skied before, reflect on this thought—can you relate? If you haven't skied before, take it from me: it's impossible to dress right for the weather. 20 degrees and 30 degrees sound like the same type of cold when you grow up with most days being 60s and 70s. But 20 degrees and 30 degrees are very different types of cold.

ChatGPT alone knows the weather and can reason about good outfits to wear. Journal entries provide the perfect context for AI to reason about outfit recommendations. I believed connecting them would yield accurate recommendations for what to wear for a day of skiing.

That's when I thought of creating Layers—an app aimed at doing exactly this.

## The Architecture Evolution: A Deep Dive Into MCP

Initially, this was going to be an MCP app. I heard MCP is going to change the world—that MCP equals the future of how AI interacts with services on the internet. I decided I must create an app with it and did deep research.

### The MCP Rabbit Hole (2+ Weeks of Experimentation)

The emphasis here is on the depth of the rabbit hole. I spent well over 2 weeks of the project getting the MCP server to work because I thought it was essential. The future is services being accessible via websites but also as MCP servers for people's AIs to plug into. Like Nike has a storefront—they should also have an MCP server so your AI can go shopping on Nike.com for you.

Because unless web and browser use gets really good, the MCP server is going to be the best way for AI to directly interact with other services. So in the same way as Nike's future, I want my app to be used by people in the UI I made but also through anyone's individual MCP server.

**Original Architecture:**
- Server: Remote MCP server in Cloudflare worker
- Client: Supabase edge function calling OpenAI API with reference to Cloudflare server URL

This was a lot to manage across three separate directories.

**Second Architecture:** 
- Server: Remote MCP server in Next.js API route
- Client: Next.js API route calling OpenAI API with reference to server URL
- Benefit: All MCP logic in one project directory instead of three

### The Authentication Wall

When I added authentication to the app, I struggled with OAuth/passing user tokens/authentication with the MCP server. I realized I had jumped the gun on using MCP technology—function calling was all I needed to implement the app.

### OpenAI API vs Vercel AI SDK

I experimented with both:
- **OpenAI API**: More foundational approach for tool calling
- **Vercel AI SDK**: More abstract, incredibly easy

Vercel AI SDK was amazing—super easy for tool calling, streaming, and UI components. This became my final choice.

## The AI + Software Integration Experiment

In building Layers, my main focus was exploring how AI can integrate with traditional software. We're in a transitional period—software is no longer just static interfaces, and AI is beginning to reshape how people interact with applications.

### The Central Question: How Will AI Transform Software?

- Will it replace traditional interfaces entirely?
- Or will the future be a thoughtful integration of both?

Layers explores this tension with a **dual-interface approach**:

- **Traditional UI → Rigid** (explicitly designed interactions, predictable flows)
- **AI Interface → Flexible** (natural conversation, tool-calling to extend capabilities)

Both the chat and the UI can do everything in the app—they share the same backend for viewing, updating, inserting, and deleting logs/layers, as well as fetching weather, location, and recommendations.

### The Development Reality Check

I spent about **80% of my development time** building the traditional UI. Every button, toggle, and view had to be manually designed and coded, and responsive design made this even more complicated.

By contrast, the AI interface—powered by the **Vercel AI SDK's tool-calling**—made feature integration far faster. This contrast led me to fundamental questions:

- Is the future interface purely conversational?
- Will we always need visual UI for complex data?
- What happens when AI can generate UI components on demand?

## Mobile-First Design: A Hard-Learned Lesson

I learned the important lesson to start with phone and then build up to desktop. The app right now is not well designed for mobile—too many buttons to press. I didn't think about mobile-first design when making this app. I kept sharing it with friends and family, and they opened it on their phones, which looked horrible.

### Before vs After Mobile Optimization

| Before Mobile Friendly Design | Mobile Friendly Weather Panel | Mobile Friendly Chat Panel | Mobile Friendly Wardrobe Panel |
|------|---------|------|--------|
| ![](public/0.png) | ![](public/2.png) | ![](public/1.png) | ![](public/3.png) |

Before mobile friendly: https://layers4-r4mi3ac6w-mjsipes-projects.vercel.app/

Looking at it now, I think there are too many buttons/toggle areas. I have an idea to move more down to the bottom navbar to remove the tab lists at the top of the wardrobe section and the home weather section. If I had first created for mobile, I might have optimized for space early on and come to a better solution.

## Deep Dives Into Specific Features

### Search Implementation: Keyword vs Semantic vs Hybrid

I implemented a sophisticated data table using shadcn's DataTable component, which uses TanStack Query. One of the key features was search functionality.

**Initial Implementation: Keyword Search**
- Client-side JavaScript search
- Incredibly fast and snappy
- Instant results on every keystroke

**Semantic Search Experiment**
I was curious if it could be enhanced by semantic search. If you keyword searched for clothing but didn't spell it correctly, or wanted to type "cold" and get all logs from cold days even if that keyword wasn't specifically in the log.

I implemented it by:
1. Vector embedding all logs and layers using Supabase
2. On every keystroke, sending a request to a Supabase edge function
3. Vector embedding the query and matching to closest logs/layers
4. Creating a hybrid search combining keyword and semantic results

**The Reality Check**
The purely keyword search running instantly on the client far outweighed the benefits of hybrid search on the server. The keyword search was instantaneous, while hybrid search always triggered a spinner, even for just a second or two.

For my data complexity level, keyword search across date, location, outfits, and description made it feel really smart and fast. My app loads all user logs and layers to the client, so unlike Gmail or Google where the client doesn't load everything upfront, the instant keyword search was superior.

### AI Integration Decisions: Where I Used It, Where I Didn't

**Where AI Powers the Experience:**
- Dual interface capability (chat can do everything UI can do)
- Dynamic component rendering (AI can pull up different logs/layers in dynamic cards)
- Weather-based clothing recommendations
- Same CRUD operations (update, delete, select, insert) available through both interfaces

**Where I Decided Against AI Integration:**
The DataTable filter was a key area where I considered AI but chose against it. The instant keyword search experience was simply superior to any AI-enhanced search that would introduce latency.

### Planned AI Features (Not Yet Implemented)

**Multiselect → AI Enhancement**
Currently, multiselect uses keyword search and there's no way to add layers from it. The problem: if a user types "I wore a blue shirt," it won't pull up in the database because it's not a keyword match.

My vision: AI could take "I wore a blue shirt and my green pants" as input, search existing pieces, and either return IDs for existing items or suggest adding new ones. This would benefit first-time users who could add layers through natural language instead of getting no results.

**Generative User Interface Exploration**
The Vercel AI SDK supports generative UI components. Instead of three panels (chat, weather, wardrobe), what if I only had chat, and the chat could bring up generative UIs? These would be pre-built React components that AI could invoke and pass information to.

Benefits for developers: They still create objects, but there's no hassle about fitting them into the full layout of the app—centering, spacing, relation to other components. All that hassle is gone.

## The Future of AI-Software Integration

### The Temporal Window We're In

Layers highlights this unique moment:

1. **AI isn't perfect at memory** – logs of clothing preferences and comfort still improve recommendations
2. **Context windows are limited** – the app provides persistent wardrobe and weather context that AI alone cannot
3. **Users still prefer visual interfaces** for certain tasks

But this window is closing. As AI memory and context expand, apps like Layers may evolve into something even more powerful—where explicit storage and visual UI are optional rather than necessary.

### Open Questions This Project Raises

**Business Model Questions:**
- Could there be a successful business built on APIs alone—or even entirely around MCP servers?
- If chat interfaces become dominant, should I focus on products that are only exposed through API/MCP server? (It's infinitely easier because there's no rigid interface to build)

**Technical Architecture Questions:**
- Will AI outputs stay in **Markdown** (simple, universal), evolve into **generated objects** (structured calls), or move toward directly generating **UI code (HTML/CSS/React)** on demand?
- What services can I expose through MCP servers to bring value? What do AIs need?

**Interface Design Questions:**
If the UI becomes the best way to interact with a product, and AI unveils different ways to integrate with software to make user experience better, then companies that create interfaces that perfectly seamlessly enable AI integration will have a powerful advantage. Examples succeeding in this space: Lovable, Cursor, ChatGPT and Claude web apps with Canvas and beyond-simple-chat features.

## What I'm Proud Of & What's Next

**Current Achievements:**
- Feature-rich, sophisticated UI
- Vercel AI SDK integration
- Sign in with Google, Google Maps geolocation
- Weather API integration
- Dual interface architecture (traditional + AI)

**Next Steps:**
- Simplify mobile app experience
- Integrate image model for input
- Implement semantic search strategically
- Create more intuitive UI, especially for new users
- More thoughtful AI-traditional UI integration
- Multiselect → AI enhancement

## Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Backend**: [Supabase](https://supabase.com/) + [Next.js API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **AI**: [Vercel AI SDK](https://sdk.vercel.ai/) with [OpenAI API](https://openai.com/api/)
- **APIs**: [Google Maps API](https://developers.google.com/maps), [Visual Crossing Weather API](https://www.visualcrossing.com/weather-api/)
- **Hosting**: [Vercel](https://vercel.com/)

---

*This project represents an ongoing exploration into the future of AI-software integration. The questions it raises about MCP servers, generative UI, and the balance between traditional and AI interfaces will continue shaping where I take the product next.*



okay i think that you need a little more information about it being an mcp app. the emphasisc of that section is to describe the depth of the rabbit hole. i spent well over 2 weeks of the project getting mcp server to work because i thought that was essential. 

the future is services being accessible via website but also as mcp server for people's ai's to plug into. like nike has a store front and they should also have an mcp server so you ai can go shopping on nike.com for you. because correct me if im wrong but unless web and browser use get really good the mcp server going to be the best way for ai to directly interact with other services. so in same way as nike future i want my app to be used by people in the ui i made but also the ui of the app and anyones individual mcp server. because then im interested if all existing services should create an mcp server and then allow peoples chatgpt to search for them. because this is also assuming web seaerch is going to drop and people will more completely interact with the ai agents. and forget about existing companiesm what about future companies. for me someone who would i would like to build ideas and would love to build one full time if i thought there would be financial reward, what spaces should i look into creating a service / solution / product for? like if i found from this experiment that chat bot use is going to be infinetly more important than maybe services that wrap chatgpt for visual areas is totally stupid. then it would be cool to build a product that is only exposed through api / mcp server. it is infinetly easier because there is no rigid interface to use. and i spent 80% of my time working on the user interface which is insane. like a solution should not have to focus that much on a web interface. 
the other option is that the ui becomes the best way to interact with a product, and ai unveils different ways that ai can integrate with software and it makes user experience so much better, and then people who create interfaces that perfectly seemlessly enable ai to integrate and immerse with sophware than that is a very powerful area to look towards. some companies i can think of that are seccessding from this building ai expereince is lovable, cursor, chatgpt and claude web apps stuff like the canvas and such. anything beyond the simple chat. then maybe for me it would be worth thinking about ways to immerse ai with ui because if i can think of a way to create such a great expereince for users that it superceded that what other people can enjoy than that would be a great place to look for ideas and spend thinking about in my free time. 

# i did do a lot of thinking about the way that ai will interact with my app.
 first off the ai can pull up different components in the dynamic card, like pull up different logs or layers or when it adds layers it can immediately pull it up to be seen. secondly the ai can also just do everythign the regualr interface can do. the same crud operations on the database logs/layers of update, delete, select, insert are built into both interfaces. 

list of steps:


# then  there are places where i thought hard about putting ai into the app there, but then decided against it (datatable filter)
then there are places where i thought hard about putting ai into the app there, but then decided against it (datatable filter)
searching the data

https://ui.shadcn.com/docs/components/data-table
this component struck my eye over the summer.
it had me wondering from a ui point of veiw when is it appropriate to graduate a table to a datatable. datatable = table with select, sort and filter functions
reference difference here:
https://ui.shadcn.com/docs/components/data-table
https://ui.shadcn.com/docs/components/table
i was also really curious to learn how to implement the datatable. it is pretty interesting and complicated, shadcn datatable doc had really great documentation on how to create one. it uses react-tan-stack-query, an npm package i have always been pretty interested about. tanstack provides other things like a router which i have heard about when i was learning about the difference between different router solutions and what they are like react router, tanstack router, and nextjs file system. it was a really interesting switch to be like which ones mattered this summer.

anyways one of the features of a database is search filter and it is really cool. it is a keyword search that runs on the client in js, it is very wicked fast and snappy.
i was curious if it could be enhanced by a semantic search as well, because if you key word searched for a type of clothing you put into the database but you did not spell it out correctly, or for a log via description but you did not know exactly the way you described the log, or you just wanted to type in "cold" and get all logs of days that were cold even if that keyword was not specifically in the log, it just figured out via keywords. and so i implemented it. i added so on every keystroke in the search bar, it sent a requesto to a supabase edge function which would vector embedd the query, and match the query to the closest logs/layers in the vector mebedding column of the log/layer table. oh also not to forget, i vector embedded all my logs and layers using supabase 
https://supabase.com/docs/guides/ai/semantic-search

and then i implemented a hybrid search where it would handle search based upon keywords for logs in the name and description and also the semantic embedding. logs would keyword offof date, place, outfits worn and description and then also ai embedding.

also a problem looking for help on : for my rag solution i know there is a lot of "art" in how you embedd a peice of data, and I did not spend a great amount of time working on that. 
[show example of a log date and my conversion to json for the rag] i also only did one. then ask for the opinion of an expert, what would they say is the best way to implement hybrid search on my database? or do we need hybrid search to sort by values or is there a way to embedd pretty hard knowledge like the temperature number so if a user types on 50 or fifty it would show up.

anyways long story short i found that the advantage of the purely keyword search to run instantanelsy on the client far outweight the benefits of running a hybrid search on the server because the keyword search was instantaneous with results coming in every keystroke, where is the hybrid search would always trigger a spinner even if it was just for a second or two. in the end of the day, my data is not that complex, and for example logs making keyword search across all entries in the table: date, location, outfits, and description. as opposed to just description. makes it feel really smart and fast. 
also last thing i forgot to mention my app loads all the users logs and layers to the client. i understand for apps like gmail or google where the client does not load all that upfront, a hybrid search makes sense beacuse keyword search anyways has to go to the server, and so doing ai and keyword search together would be very cool.


list of steps:








## then 
there are places where i have not yet experiemented with putting the ai yet, but i want to try it out

multiselect -> ai search:
reason i have not yet implemented, is because i was mentally hund up on down below: todays log or its own veiw?
but anyways, the log can contain an array of layers, and I wanted a good way to allow for displaying and selecting all the layers. multiselect is very cool, but problem is it is keyword search and there is no way to add layers from it. if i pose the question in place holder as "what did you wear today" and a user wrote "i wore a blue shirt" blue shirt will not pull up in the database because it is not longer a keyword match to blue shirt. i think ai could be very cool if it was a text box and the user types "i wore a blue shirt and my green pants". then the ai takes that as input and then has a tool to search, add the database, and based upon the search query it looks for existing peices of clothing and returns their id's so say blue shirt was in his database it returns, and if green pants are no where to be found from keyword/semantic search, the ai will add the green pants as a new layer and then return the new layer to add. but maybe the ai does not add it but rather it is just a suggestion to add it, so it send to the client and then the user sees he types "i wore a blue shirt and green pants " and sees next to it little chips for the blue shirt and green pants but maybe the green pants since it is a suggestion there is a little green checkbox that must be checked for it to become completely bolded and that user confirmation confirms. this might be really nice, and it will benefit from the fact that first time users will be able to add layers through this comcpoent as opposed to typing in what they wore for a day and recieving no results. this could be a good use of ai integration.


ai creates user-generated-objects:
(also not this infor should connect to something above)
back to the ui of the future question of ai ui vs tradiotional ui with integrated ai. if the answer is ai ui, than how will that ui look in the future. right now it is generating markdown on the flow which is amazing, created structured tables and great bolding and indentation to highlight information it is really wonderful. u lesser common feature i have not really approached in the wild is generative user interface. chat gpt is starting to do it especially when you shop it is really cool.
vercel ai sdk makes it easy with https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces
maybe the future ui is purely ai and the ai uses these user generated objects . like reference back to my mobile design, i currently have three panels, chat, weather and wardrobe, but what if i only had chat, and the chat could bring up generative ui's generative ui is invoked as a functional call, the ui is prebuilt by developers so same as react component, and ai can incoke it to and pass in information so it is brought up on the screen. for benefit of a devloper is they still create objects, but there is no hastle at all about how to fit it into the full layour of the app which includes where it goes, centering and spacing in relation to other comcponents , all that hastle is gone. so maybe the future we really strongly see more of the generative user interface by ai, that will be evident that best services are only exposed through mcp server and api.
then the last theoritical question is maybe future will be ai outputing straight html, css and js / outputting straight react or whatever, like the generative user interface it is generating the data and the code. because it doesnt generate the code in a user generative interface


my current future question is then going to be: what type of services can i expose through mcp server to bring values.
- question includes: what do ai's need?

## there is also a react dev theory question is was breaking myself over: home page be a veiw of todays log or its own veiw? this was back to the design choices of making add and veiw card looks differenct. 
i started the app with 
