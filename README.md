# Layers - AI Wardrobe Assistant

**Never be too hot or too cold again.**

Layers is an intelligent wardrobe companion that uses AI to provide personalized outfit recommendations based on weather conditions and your comfort preferences. The app learns from your experiences to suggest the perfect combination of clothing layers for any situation.

## 🎯 Goal

The primary goal of Layers is to solve the universal problem of dressing appropriately for weather conditions. By combining real-time weather data, personal comfort tracking, and AI-powered recommendations, users can make informed decisions about what to wear to stay comfortable in any climate.

## 🧠 Core Philosophy

Layers operates on a simple but powerful principle: **Learn from experience to predict comfort**. The system works through three interconnected components:

1. **Logs**: Record your outfit choices and comfort levels in different weather conditions
2. **Layers**: Organize your wardrobe into individual clothing items with warmth ratings
3. **AI Recommendations**: Use machine learning to suggest optimal outfit combinations based on historical data and current weather

This creates a feedback loop where the more you use the app, the smarter it becomes at understanding your personal comfort preferences.

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom UI components
- **State Management**: Zustand with persistence
- **UI Components**: Radix UI primitives with custom styling
- **Real-time Updates**: Supabase real-time subscriptions

### Backend & Database
- **Database**: Supabase (PostgreSQL) with real-time capabilities
- **Authentication**: Supabase Auth with email/password
- **API**: Next.js API routes with streaming responses
- **AI Integration**: OpenAI GPT-4 with function calling
- **Embeddings**: Local embedding generation using Transformers.js

### AI/ML Components
- **Semantic Search**: Vector embeddings for layer and log matching
- **Recommendation Engine**: AI-powered outfit suggestions
- **Natural Language Interface**: Chat-based interaction with wardrobe assistant
- **Weather Integration**: Real-time weather data for context-aware recommendations

## 📊 Database Schema

### Core Tables

#### `layer` - Clothing Items
```sql
- id: UUID (Primary Key)
- name: String (Item name)
- description: String (Optional description)
- warmth: Integer 1-10 (Warmth rating)
- top: Boolean (Is it a top layer?)
- bottom: Boolean (Is it a bottom layer?)
- user_id: UUID (Foreign key to profiles)
- embedding: Vector (Semantic embedding)
```

#### `log` - Comfort Experiences
```sql
- id: UUID (Primary Key)
- date: Date (When worn)
- comfort_level: Integer 1-10 (How comfortable)
- feedback: String (User notes)
- weather_id: UUID (Foreign key to weather)
- latitude/longitude: Float (Location)
- user_id: UUID (Foreign key to profiles)
```

#### `weather` - Weather Data
```sql
- id: UUID (Primary Key)
- date: Date
- latitude/longitude: Float
- weather_data: JSON (Complete weather info)
```

#### Junction Tables
- `log_layer`: Links logs to worn layers
- `log_layer_recs`: Links logs to AI-recommended layers

### Database Functions
- `calculate_outfit_warmth()`: Computes total warmth of an outfit
- `get_logs_by_date()`: Retrieves logs for specific dates
- `match_layer()`: Semantic search for layers
- `match_log()`: Semantic search for logs
- `get_outfit_stats()`: Analytics for outfit performance

## 🔄 Data Flow

### 1. Layer Management
```
User Input → Layer Store → Supabase → Real-time Update → UI
```

### 2. Log Creation
```
Weather Data + Layer Selection → Log Store → Supabase → AI Training Data
```

### 3. AI Recommendations
```
Weather + User History → AI Analysis → Layer Suggestions → UI Display
```

## 🤖 AI Implementation

### Function Calling Tools
The AI assistant has access to 20+ tools for interacting with the system:

**Layer Management:**
- `select_layers`: Retrieve user's wardrobe
- `insert_layer`: Add new clothing item
- `update_layer`: Modify existing items
- `delete_layer`: Remove items
- `semantic_search_layer`: Find similar items

**Log Management:**
- `select_logs`: Get comfort history
- `insert_log`: Record new experience
- `update_log`: Modify existing logs
- `link_log_layer`: Connect logs to worn items
- `link_log_layer_rec`: Connect logs to AI recommendations

**Weather & Context:**
- `get_weather`: Fetch current weather
- `get_date`: Get current date
- `set_location`: Update user location

**UI Control:**
- `display_ui`: Navigate to specific views
- `get_current_ui`: Check current interface state

### Embedding System
- **Model**: Supabase/gte-small (384 dimensions)
- **Generation**: Local processing with Transformers.js
- **Storage**: Vector columns in PostgreSQL
- **Search**: Cosine similarity matching

### Recommendation Algorithm
1. **Context Analysis**: Current weather + user location
2. **Historical Pattern Matching**: Find similar past experiences
3. **Comfort Prediction**: Estimate comfort level for suggested outfits
4. **Layer Combination**: Optimize for warmth and style

## 🔌 Real-time Architecture

### Subscription System
```typescript
// Example: Layers subscription
const channel = supabase
  .channel("layers-channel")
  .on("postgres_changes", { 
    event: "*", 
    schema: "public", 
    table: "layer" 
  }, handleChange)
  .subscribe();
```

### State Management
- **Global Store**: Weather, location, UI state
- **Layer Store**: Wardrobe items with real-time sync
- **Log Store**: Comfort history with real-time sync

## 🚀 Development Setup

### Prerequisites
- Node.js 18+
- Supabase account
- OpenAI API key

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
OPENAI_API_KEY=your_openai_key
```

### Installation
```bash
npm install
npm run dev
```

### Database Setup
1. Create Supabase project
2. Run schema migrations
3. Enable vector extension
4. Set up real-time subscriptions

## 🧪 AI/ML Playground

The `playground/` directory contains experimental AI features:

- `gen_layer_embeddings.ts`: Generate semantic embeddings for clothing items
- `gen_log_embeddings.ts`: Generate embeddings for comfort logs
- `test_match_layer.ts`: Test semantic search for layers
- `test_match_log.ts`: Test semantic search for logs

## 📈 Performance Considerations

### Optimization Strategies
- **Lazy Loading**: Components load on demand
- **Real-time Caching**: Zustand with persistence
- **Vector Indexing**: Efficient semantic search
- **Streaming Responses**: Real-time AI chat
- **Background Processing**: Embedding generation

### Scalability
- **Database**: Supabase handles scaling
- **AI**: OpenAI API for processing
- **Frontend**: Next.js with static optimization
- **Real-time**: WebSocket connections for live updates

## 🔮 Future Enhancements

### Planned Features
- **Seasonal Analysis**: Long-term comfort patterns
- **Social Features**: Share outfits with friends
- **Advanced AI**: Multi-modal recommendations (images)
- **Mobile App**: Native iOS/Android applications
- **Wearable Integration**: Smartwatch compatibility

### Technical Roadmap
- **Edge Functions**: Serverless AI processing
- **Advanced Analytics**: Comfort prediction models
- **Multi-language Support**: International weather data
- **Offline Capability**: Local AI processing

---

*Layer smart, feel perfect.*
