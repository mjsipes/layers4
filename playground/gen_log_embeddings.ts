// npx tsx playground/gen_log_embeddings.ts

import { createClient } from '@supabase/supabase-js';
import { pipeline } from '@xenova/transformers';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

console.log("🚀 Starting Supabase log embedding experiment...");

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables!");
  console.log("Please make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set");
  process.exit(1);
}

// Create Supabase clients
const supabaseService = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

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

// Generate embedding for a log
async function generateLogEmbedding(log: any) {
  try {
    // Extract data for concatenation
    const date = log.date || log.created_at || '';
    const address = log.address || '';
    const feedback = log.feedback || '';
    const temperature = getWeatherTemp(log);
    
    // Concatenate with descriptive prefixes for better semantic meaning
    const text = `Date: ${date} | Location: ${address} | Temperature: ${temperature}° | Feedback: ${feedback}`.trim();
    
    if (!text || text === 'Date:  | Location:  | Temperature: 0° | Feedback: ') {
      console.log(`⚠️  Log ${log.id} has no meaningful text to embed`);
      return null;
    }

    console.log(`📝 Generating embedding for log ${log.id}: "${text}"`);

    // Generate embedding
    const output = await generateEmbedding(text, {
      pooling: 'mean',
      normalize: true,
    });

    // Extract the embedding output
    const embedding = Array.from(output.data) as number[];
    
    console.log(`✅ Generated embedding with ${embedding.length} dimensions`);
    return embedding;
  } catch (error) {
    console.error(`❌ Error generating embedding for log ${log.id}:`, error);
    return null;
  }
}

// Update log with embedding
async function updateLogWithEmbedding(logId: string, embedding: number[]) {
  try {
    if (!supabaseService) {
      console.error(`❌ Service role key not available`);
      return false;
    }

    const { data, error } = await supabaseService
      .from('log')
      .update({ embedding })
      .eq('id', logId)
      .select();

    if (error) {
      console.error(`❌ Error updating log ${logId}:`, error);
      return false;
    }

    console.log(`✅ Updated log ${logId} with embedding`);
    return true;
  } catch (error) {
    console.error(`❌ Unexpected error updating log ${logId}:`, error);
    return false;
  }
}

// Process all logs with embeddings
async function processLogsWithEmbeddings() {
  if (!supabaseService) {
    console.log("❌ Service role key required for updating embeddings");
    return;
  }

  try {
    console.log("\n📊 Fetching all logs with service role key...");
    
    const { data: logs, error } = await supabaseService
      .from('log')
      .select(`
        *,
        weather:weather_id (*)
      `)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error("❌ Error fetching logs:", error);
      return;
    }

    console.log(`✅ Found ${logs?.length || 0} logs to process`);
    
    if (!logs || logs.length === 0) {
      console.log("No logs found to process");
      return;
    }

    // Initialize embedding pipeline
    await initializeEmbedding();

    let processedCount = 0;
    let successCount = 0;

    for (const log of logs) {
      console.log(`\n--- Processing Log ${processedCount + 1}/${logs.length} ---`);
      console.log("ID:", log.id);
      console.log("Date:", log.date || log.created_at);
      console.log("Address:", log.address);
      console.log("Feedback:", log.feedback);
      console.log("Temperature:", getWeatherTemp(log));

      // Generate embedding
      const embedding = await generateLogEmbedding(log);
      
      if (embedding) {
        // Update log with embedding
        const success = await updateLogWithEmbedding(log.id, embedding);
        if (success) {
          successCount++;
        }
      }

      processedCount++;
    }

    console.log(`\n🎉 Processing complete!`);
    console.log(`Processed: ${processedCount} logs`);
    console.log(`Successfully updated: ${successCount} logs`);

  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

// Main execution
async function main() {
  await processLogsWithEmbeddings();
  console.log("\n✅ Experiment completed!");
}

main().catch(console.error); 