// npx tsx playground/gen_layer_embeddings.ts

import { createClient } from '@supabase/supabase-js';
import { pipeline } from '@xenova/transformers';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

console.log("🚀 Starting Supabase embedding experiment...");

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

// Generate embedding for a layer
async function generateLayerEmbedding(layer: any) {
  try {
    // Concatenate name and description with : separator
    const name = layer.name || '';
    const description = layer.description || '';
    const text = `${name}: ${description}`.trim();
    
    if (!text) {
      console.log(`⚠️  Layer ${layer.id} has no text to embed`);
      return null;
    }

    console.log(`📝 Generating embedding for layer ${layer.id}: "${text}"`);

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
    console.error(`❌ Error generating embedding for layer ${layer.id}:`, error);
    return null;
  }
}

// Update layer with embedding
async function updateLayerWithEmbedding(layerId: string, embedding: number[]) {
  try {
    if (!supabaseService) {
      console.error(`❌ Service role key not available`);
      return false;
    }

    const { data, error } = await supabaseService
      .from('layer')
      .update({ embedding })
      .eq('id', layerId)
      .select();

    if (error) {
      console.error(`❌ Error updating layer ${layerId}:`, error);
      return false;
    }

    console.log(`✅ Updated layer ${layerId} with embedding`);
    return true;
  } catch (error) {
    console.error(`❌ Unexpected error updating layer ${layerId}:`, error);
    return false;
  }
}

// Process all layers with embeddings
async function processLayersWithEmbeddings() {
  if (!supabaseService) {
    console.log("❌ Service role key required for updating embeddings");
    return;
  }

  try {
    console.log("\n📊 Fetching all layers with service role key...");
    
    const { data: layers, error } = await supabaseService
      .from('layer')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("❌ Error fetching layers:", error);
      return;
    }

    console.log(`✅ Found ${layers?.length || 0} layers to process`);
    
    if (!layers || layers.length === 0) {
      console.log("No layers found to process");
      return;
    }

    // Initialize embedding pipeline
    await initializeEmbedding();

    let processedCount = 0;
    let successCount = 0;

    for (const layer of layers) {
      console.log(`\n--- Processing Layer ${processedCount + 1}/${layers.length} ---`);
      console.log("ID:", layer.id);
      console.log("Name:", layer.name);
      console.log("Description:", layer.description);

      // Generate embedding
      const embedding = await generateLayerEmbedding(layer);
      
      if (embedding) {
        // Update layer with embedding
        const success = await updateLayerWithEmbedding(layer.id, embedding);
        if (success) {
          successCount++;
        }
      }

      processedCount++;
    }

    console.log(`\n🎉 Processing complete!`);
    console.log(`Processed: ${processedCount} layers`);
    console.log(`Successfully updated: ${successCount} layers`);

  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

// Main execution
async function main() {
  await processLayersWithEmbeddings();
  console.log("\n✅ Experiment completed!");
}

main().catch(console.error); 