// npx tsx playground/test_match_log.ts "your query here"

import { createClient } from '@supabase/supabase-js';
import { pipeline } from '@xenova/transformers';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

console.log("🚀 Starting log matching test...");

// Get query from command line arguments
const query = process.argv[2];
if (!query) {
  console.error("❌ Please provide a query as an argument");
  console.log("Usage: npx tsx playground/test_match_log.ts \"your query here\"");
  process.exit(1);
}

console.log(`🔍 Query: "${query}"`);

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables!");
  console.log("Please make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set");
  process.exit(1);
}

// Create Supabase client (using service role for RPC access)
const supabaseClient = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : createClient(supabaseUrl, supabaseAnonKey);

console.log("✅ Connected to Supabase");

// Initialize the embedding pipeline
let generateEmbedding: any = null;

async function initializeEmbedding() {
  try {
    console.log("🤖 Initializing embedding pipeline...");
    generateEmbedding = await pipeline('feature-extraction', 'Supabase/gte-small');
    console.log("✅ Embedding pipeline ready");
  } catch (error) {
    console.error("❌ Error initializing embedding pipeline:", error);
    throw error;
  }
}

// Generate embedding for the query
async function generateQueryEmbedding(query: string) {
  try {
    console.log(`📝 Generating embedding for query: "${query}"`);

    // Generate embedding
    const output = await generateEmbedding(query, {
      pooling: 'mean',
      normalize: true,
    });

    // Extract the embedding output
    const embedding = Array.from(output.data) as number[];
    
    console.log(`✅ Generated embedding with ${embedding.length} dimensions`);
    return embedding;
  } catch (error) {
    console.error("❌ Error generating embedding:", error);
    return null;
  }
}

// Extract temperature from weather data
function getWeatherTemp(log: any) {
  const weatherData = log.weather?.weather_data 
    ? (typeof log.weather.weather_data === 'string' 
        ? JSON.parse(log.weather.weather_data) 
        : log.weather.weather_data)
    : null;
  const currentWeather = weatherData?.days?.[0];
  return currentWeather?.temp || 0;
}

// Match logs using RPC function
async function matchLogs(embedding: number[]) {
  try {
    console.log("🔍 Matching logs...");
    
    const { data: matches, error } = await supabaseClient.rpc('match_log', {
      query_embedding: embedding,
      match_threshold: 0.78,
      match_count: 5,
    });

    if (error) {
      console.error("❌ Error matching logs:", error);
      return null;
    }

    console.log(`✅ Found ${matches?.length || 0} matches`);
    return matches;
  } catch (error) {
    console.error("❌ Unexpected error matching logs:", error);
    return null;
  }
}

// Display matches
function displayMatches(matches: any[]) {
  if (!matches || matches.length === 0) {
    console.log("No matches found");
    return;
  }

  console.log("\n🎯 Top Matches:");
  console.log("=".repeat(50));
  
  matches.forEach((match, index) => {
    const temperature = getWeatherTemp(match);
    const date = match.date || match.created_at;
    
    console.log(`\n${index + 1}. Log Entry`);
    console.log(`   ID: ${match.id}`);
    console.log(`   Date: ${date}`);
    console.log(`   Location: ${match.address || 'No address'}`);
    console.log(`   Temperature: ${temperature}°`);
    console.log(`   Feedback: ${match.feedback || 'No feedback'}`);
    console.log(`   Comfort Level: ${match.comfort_level || 'N/A'}`);
    console.log(`   Similarity: ${(match.similarity * 100).toFixed(2)}%`);
  });
}

// Main execution
async function main() {
  try {
    // Initialize embedding pipeline
    await initializeEmbedding();
    
    // Generate embedding for query
    const embedding = await generateQueryEmbedding(query);
    if (!embedding) {
      console.error("❌ Failed to generate embedding");
      return;
    }
    
    // Match logs
    const matches = await matchLogs(embedding);
    if (!matches) {
      console.error("❌ Failed to match logs");
      return;
    }
    
    // Display results
    displayMatches(matches);
    
    console.log("\n✅ Matching test completed!");
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

main().catch(console.error); 