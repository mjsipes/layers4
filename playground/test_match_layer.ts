// npx tsx playground/test_match_layer.ts "your query here"

import { createClient } from '@supabase/supabase-js';
import { pipeline } from '@xenova/transformers';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

console.log("🚀 Starting layer matching test...");

// Get query from command line arguments
const query = process.argv[2];
if (!query) {
  console.error("❌ Please provide a query as an argument");
  console.log("Usage: npx tsx playground/test_match_layer.ts \"your query here\"");
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

// Match layers using RPC function
async function matchLayers(embedding: number[]) {
  try {
    console.log("🔍 Matching layers...");
    
    const { data: matches, error } = await supabaseClient.rpc('match_layer', {
      query_embedding: embedding,
      match_threshold: 0.78,
      match_count: 5,
    });

    if (error) {
      console.error("❌ Error matching layers:", error);
      return null;
    }

    console.log(`✅ Found ${matches?.length || 0} matches`);
    return matches;
  } catch (error) {
    console.error("❌ Unexpected error matching layers:", error);
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
    console.log(`\n${index + 1}. ${match.name || 'Unnamed Layer'}`);
    console.log(`   ID: ${match.id}`);
    console.log(`   Description: ${match.description || 'No description'}`);
    console.log(`   Similarity: ${(match.similarity * 100).toFixed(2)}%`);
    console.log(`   Warmth: ${match.warmth || 'N/A'}`);
    console.log(`   Top: ${match.top ? 'Yes' : 'No'}`);
    console.log(`   Bottom: ${match.bottom ? 'Yes' : 'No'}`);
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
    
    // Match layers
    const matches = await matchLayers(embedding);
    if (!matches) {
      console.error("❌ Failed to match layers");
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