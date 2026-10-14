# Layers ❄️🎿

**AI‑integrated wardrobe. So you never dress too hot or too cold.**

## Try It Out

**Live:** [https://layers4.vercel.app/](https://layers4.vercel.app/)
**Github** [https://github.com/mjsipes/layers4](https://github.com/mjsipes/layers4)

Here’s a quick sequence to see the app in action:

### Demo Flow (Recommended)

1. Ask: "What is my location?"
2. Ask: "What is the weather?"
3. Ask: "What should I wear?" *(notice limited recommendations)*
4. Tell the AI: "I'm wearing \[your outfit] and I feel \[too hot/cold/perfect]"
5. Add layers: "I have \[list items] in my wardrobe"
6. Ask again: "What should I wear?" *(see improved recommendations)*

*Or try the pre‑populated demo account: **[mjsipes@gmail.com](mailto:mjsipes@gmail.com)** / **123456***

## The Journey Behind the Tech

One day last winter I was skiing in Lake Tahoe. As someone who grew up skiing maybe 10 days a year, I never dressed right for the mountains. Twenty degrees and thirty degrees both sound like "freezing" when you’re used to 60s and 70s, but that ten‑degree difference can be the difference between a perfect day and being too hot or too cold.

Then I had a thought: build an app that connects an LLM to a database of **Layers (articles of clothing)** and **Logs**, and see if it can give great recommendations based simply on prior days’ answers to:

* What did you wear today?
* Where are you?
* What day is it?
* Were you too hot, too cold, or perfect?

This was the start of **Layers**.

A summer ago I built a RAG solution to help an AI model give strong answers to support questions for RingCentral article writers. The common thread across projects: it’s now standard in CS to identify data that pairs well with LLMs so they can produce better output.

I can use Layers throughout the winter and measure accuracy. With as little as three previous days of experience, I believe it will work. I skied 25 days last season, so I’ll have \~30 days of great context to evaluate.

### Why LLM + Weather Alone Isn’t Enough

**If I ask ChatGPT:**

**User:** What is the weather?

**Model behavior:** it will web‑search and return the weather.

**Response example:**

> It’s clear and mild in Lake Tahoe right now, around 70 °F (21 °C). Tonight will cool into the low 50s °F (10–12 °C) with clear skies, and tomorrow morning will start sunny in the mid‑50s.

**If I ask ChatGPT:**

**User:** What should I wear?

**Model behavior:** it will web‑search and return the weather *and* reason about what you should wear, then give a detailed recommendation.

**Response example:**

> Tonight in Lake Tahoe it will be clear and cool, dipping into the low 50s °F (10–12 °C). A light jacket or sweater, long pants, and maybe a warmer layer if you’ll be out late will keep you comfortable.

**The problem:** it doesn’t know your wardrobe or your personal comfort profile.

I’ve gone to Giants games with friends wearing a hoodie and still felt freezing. I also have a friend who could go in a t‑shirt and be fine—and might even call the weather “nice.” Everyone is different. One recommendation won’t fit everybody. So the prompt “what should I wear?” shouldn’t be the same for every user. It must include context about **you**: what layers you own, examples of what you wore on certain days, what the weather was like, and whether you were too hot or too cold.

### My Hypothesis (Prompts & Tools)

If I create a prompt like the following, I will get much more accurate recommendations.

```
Context:
User owns the following layers (articles of clothing):
- USC Hoodie
- Tommy Trojan pajama pants
- "Fight On" bracelet

Here are relevant logs for similar conditions:
- 2025-01-18 — Lake Tahoe, CA — High 28°F / Low 12°F, wind 8 mph NNE. Wore: base layer top + snowboard shell, USC Hoodie midlayer, ski pants, wool socks, gloves, beanie. Feedback: felt slightly cold on chairlifts; would add thicker midlayer or neck gaiter next time.

User:
I'm in Lake Tahoe today. What should I wear?
```

Or:

```
Context:
The user will often ask you about weather recommendations: "What should I wear today?"
If a user uses this app, returning logs and layers will provide lots of context about the user’s previous behavior. Make those tool calls and reason over the results before responding. If the user has no logs to reason over, make your best guess. If the user has no layers to reason over—or not enough to make an effective outfit—ask whether they own the needed layers (and if not, recommend a purchase).

Continually, the user is encouraged to share information about their wardrobe and previous experiences; you can log those with add_log and add_layer. If a user brings up logs in conversation, do a quick wardrobe search with search_layers; we recommend search_layers first because it’s semantic and returns relevant results, but if you don’t get results it’s okay to call get_layers.

Tools:
- get_user_logs
- get_user_layers
- search_layers
- get_layers
- add_log
- add_layer

User:
I am in Lake Tahoe. What should I wear today?
```

The core loop of my app is two simple interactions:

1. **“What did you wear today?”**

2. **“What should I wear today?”** 

The project unfolded in that order.

## “What did you wear today?” — Collecting data via chat

I didnt want users to manually enter all their logs and layers. Instead, the AI should add logs and layers it learns from natural conversation.

This led to the first version of the AI agent—and to a key architectural choice. To connect the AI to my database, I needed a safe bridge so the model could call a small set of functions (e.g., get_user_logs, get_user_layers, add_log, add_layer) instead of touching the DB directly. There are two modern ways to expose those functions: **Tool Calling** and the newer **Model Context Protocol (MCP)**.

### Big Decisions: MCP vs Tool Calling

* **I spent two weeks trying to make it an MCP server.** I dove deep into the emerging MCP ecosystem:

  * How to structure MCP servers
  * Deploying to Vercel and Cloudflare Workers
  * OAuth authentication for MCP
  * Using the MCP inspector tools

  **Documentation I explored:**

  * Model Context Protocol: [https://modelcontextprotocol.io/docs/getting-started/intro](https://modelcontextprotocol.io/docs/getting-started/intro)
  * OpenAI’s MCP integration guides: [https://platform.openai.com/docs/guides/tools-connectors-mcp](https://platform.openai.com/docs/guides/tools-connectors-mcp)
  * Vercel’s MCP server deployment: [https://vercel.com/docs/mcp/deploy-mcp-servers-to-vercel](https://vercel.com/docs/mcp/deploy-mcp-servers-to-vercel)
  * Cloudflare’s remote MCP server guides: [https://developers.cloudflare.com/agents/guides/remote-mcp-server/](https://developers.cloudflare.com/agents/guides/remote-mcp-server/)


* **Tool calling:** I evaluated OpenAI API tool/function calling and the Vercel AI SDK tool calling:

  * OpenAI function calling: [https://platform.openai.com/docs/guides/function-calling](https://platform.openai.com/docs/guides/function-calling)
  * Vercel AI SDK tools: [https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling)

**Outcome:** I used **tool calling** for Layers. In trying to create the MPC server, I got stuck on figuring out how to handle user authentication in the MCP server. I thought at first an MCP server would be necessary for this app, but it turns out tool calling is not obsolete, and is actually the perfect, lightweight solution for this app.

## “What should I wear today?” — Presenting results to the user
   Once the plumbing worked, I asked: *Should the app present results purely as chat/Markdown, as a full UI, or both?* That became a major focus of the summer. Embodied in the following experiments:
   
### Experiment 1: Dual AI UI and Traditional UI

Layers uses a split‑screen, resizable layout where both the traditional UI and the AI interface can perform **identical operations** on the database. Both paths can do the same things, and the AI can **control the UI** through dynamic cards.

* The AI can dynamically surface components—displaying specific logs, layers, or immediately showing newly added items.
* When the AI adds layers, it can immediately display them for user review.
* Both the traditional interface and AI chat handle the same CRUD operations (select, insert, update, delete) on **Logs** and **Layers**.

### Experiment 2: Keyword Search vs Semantic Search vs Hybrid Search

The shadcn **Data Table** component caught my eye this summer. It made me ask: *When is it appropriate to graduate from a simple table to a full data table?* (A “data table” = table + select/sort/filter.)

**References:**

* Data Table: [https://ui.shadcn.com/docs/components/data-table](https://ui.shadcn.com/docs/components/data-table)
* Table: [https://ui.shadcn.com/docs/components/table](https://ui.shadcn.com/docs/components/table)

Under the hood, the data table uses **@tanstack/table**—an NPM package I’ve been curious about. (TanStack also offers a router, which I looked at while comparing React Router, TanStack Router, and Next.js file‑system routing.)

The data table’s **search filter** is great: it’s a **keyword search on the client in JavaScript**—wicked fast and snappy.

I wondered if I could enhance it with **semantic search**. What if you search for layers but misspell them? What if you search by a log’s description but don’t remember exact phrasing? Or you type “cold” and want all cold days even if “cold” isn’t literally in the log?

So I implemented it. On **every keystroke** in the search bar, the client sent a request to a **Supabase Edge Function** which would vector‑embed the query and match it to logs/layers in the **embedding columns** of those tables. I vector‑embedded **all** logs and layers using Supabase’s guide: [https://supabase.com/docs/guides/ai/semantic-search](https://supabase.com/docs/guides/ai/semantic-search)

I built a **hybrid search**:

* Keyword across multiple fields (for logs: date, place, outfits worn, description)
* Semantic via vector embeddings for fuzzy matching


**Problem I’m still looking for help on:** In RAG, there’s an “art” to how you embed data. I didn’t spend a lot of time tuning this.

For example, here’s my current DB schema for **logs**:

```ts
address: string | null
comfort_level: number | null
created_at: string
date: string | null
feedback: string | null
id: string
latitude: number | null
longitude: number | null
user_id: string | null
weather_id: string | null
```

At first, I simply embedded a **JSON-stringified version** of every row in the table.

Later, I tried another approach: concatenating values into a natural-language string, like:

```text
Log {id}: Weather was {weather}. 
User wore {layers}. 
Feedback: "{feedback}".
```

This got me wondering:

* Is implementation #2 (natural-language string) actually stronger than implementation #1 (raw JSON)?
* For a possible implementation #3: should I embed **multiple versions** of each log (one string per column for context), then link them all back to the same log ID?

I’d love thoughts from people with more experience tuning embeddings in RAG systems.

**Result:** The advantage of pure **client‑side keyword search** (instant results on every keystroke) outweighed server‑side hybrid search (always triggers a spinner, even if brief). My data isn’t that complex. Keyword search across **all** entries (date, location, outfits, description) feels smart *and* fast.

Worth noting: my app loads all of a user’s logs and layers to the client. In apps like Gmail or Google where the client doesn’t load everything up front, hybrid/server search makes more sense because keyword search must go to the server anyway—so combining AI + keyword search is appealing there.

### Intermission: Where the Project Stands

At this point, the project is at a checkpoint. I haven’t yet implemented Experiment 3 or the ideas that follow. Instead, I’m pausing to return back to school, but here is my key insight so far:

I’ve spent around 80% of my time on the traditional UI. When adding weather into my app, I created a get_weather function that took in date and location, and outputted weather information. Adding this functionality to the AI UI was a simple as adding that function to the list of tool calls for the model. On the other hand I spent week iterating on the weather card and finding its place in the UI.

This contrast highlighted just how rigid traditional UIs can be compared to the flexibility of AI interfaces—a glimpse, perhaps, into where the future of interaction is headed.

### Experiment 3: AI‑Powered Multiselect

When logging what you wore, the multiselect uses keyword search—but it can’t **add new layers** from that input. If the placeholder is “What did you wear today?” and a user types “I wore a blue shirt,” it won’t find anything if there’s no keyword match.

The log can contain an **array of layers**, and I need a good way to display and select them. Multiselect is cool, but since it’s keyword‑only there’s no way to add layers.

**Idea:** swap to a text box: “I wore a blue shirt and my green pants.” The AI parses this, **searches** for existing pieces and returns their IDs. If “blue shirt” exists, return it. If “green pants” don’t, the AI **suggests** adding them as a new layer.

Maybe the AI doesn’t auto‑add—just **suggests**. The client renders chips for “blue shirt” and “green pants.” The new/unknown one gets a subtle **confirmation checkbox**; once the user checks it, it becomes bold/confirmed and we insert it for real. First‑time users then get value immediately because they can add layers through this flow.

**Reason I haven’t implemented yet:** I’m mentally hung up on whether this belongs in **today’s log** view or as its **own view**.

### Experiment 4: Generative UI Exploration

This connects to the broader UI philosophy. If the future is AI‑first interfaces, how will that look? Today, AI generates Markdown (tables, bold, indentation). But **generative UI** is getting more interesting—like what ChatGPT is starting to do for shopping experiences.

The Vercel AI SDK supports **generative UI**: [https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces](https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces)

My current mobile design has **three panels** (chat, weather, wardrobe). It could be simplified to **just chat**, where the AI **invokes generative UI components** as functional calls—prebuilt React components that developers create, but the AI decides **when/how** to display them with the right data.

**Developer benefit:** you still create components/objects, but there’s no layout/positioning/spacing complexity relative to other components.

**Theoretical endpoint:** AI generates raw HTML/CSS/JS—or direct React components—combining data and code generation beyond current generative UI.

### Experiment 5: Image Input Integration

I’d love users to take a photo of their outfit, upload it, and have all the clothing pieces logged correctly.

## Final Conclusion

The entire scope of this project is only useful **until** LLMs’ context windows effectively hold our whole lives. Until then, I think Layers is a meaningful way to capture personal context and turn it into better, personalized recommendations.

I’d love for people to try it and share feedback.

## Tech Stack

* **Frontend:** [Next.js](https://nextjs.org/) with [TypeScript](https://www.typescriptlang.org/)
* **Backend:** [Supabase](https://supabase.com/) + [Next.js API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
* **AI:** [Vercel AI SDK](https://sdk.vercel.ai/) with [OpenAI API](https://openai.com/api/)
* **APIs:** [Google Maps API](https://developers.google.com/maps), [Visual Crossing Weather API](https://www.visualcrossing.com/weather-api/)
* **Hosting:** [Vercel](https://vercel.com/)

*This is a demo project exploring the intersection of AI and traditional user interfaces.*

