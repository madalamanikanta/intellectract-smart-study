import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// SM-2 algorithm implementation
const calculateSrsParameters = (
  quality: number,
  repetitions: number,
  easeFactor: number,
  intervalDays: number
) => {
  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      intervalDays = 1;
    } else if (repetitions === 2) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  return { repetitions, easeFactor, intervalDays };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const {
      item_id,
      quality, // A number from 0-5 representing performance
      time_taken_minutes,
      confidence
    } = await req.json();

    if (!item_id || quality === undefined) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: item_id, quality" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // 1. Fetch the spaced item
    const { data: spacedItem, error: itemError } = await supabaseClient
      .from('spaced_items')
      .select('*')
      .eq('id', item_id)
      .eq('user_id', user.id)
      .single();

    if (itemError || !spacedItem) {
      throw new Error('Spaced item not found or access denied');
    }

    // 2. Log the review in progress_logs
    const { error: logError } = await supabaseClient
      .from('progress_logs')
      .insert({
        user_id: user.id,
        item_id: spacedItem.id,
        concept_id: spacedItem.concept_id,
        activity_type: 'review',
        correctness: quality / 5, // Normalize quality to 0-1 scale
        time_taken_minutes: time_taken_minutes,
        confidence_after: confidence,
        metadata: {
          previous_ease_factor: spacedItem.ease_factor,
          previous_interval_days: spacedItem.interval_days,
        }
      });

    if (logError) {
      console.error('Error logging progress:', logError);
      // Non-critical, so we can continue
    }

    // 3. Calculate new SRS parameters
    const { repetitions, easeFactor, intervalDays } = calculateSrsParameters(
      quality,
      spacedItem.repetitions,
      spacedItem.ease_factor,
      spacedItem.interval_days
    );

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);

    // 4. Update the spaced item
    const { data: updatedItem, error: updateError } = await supabaseClient
      .from('spaced_items')
      .update({
        repetitions: repetitions,
        ease_factor: easeFactor,
        interval_days: intervalDays,
        next_review: nextReviewDate.toISOString(),
        last_reviewed: new Date().toISOString(),
      })
      .eq('id', item_id)
      .select()
      .single();

    if (updateError) {
      throw new Error('Failed to update spaced item');
    }

    return new Response(
      JSON.stringify({ success: true, item: updatedItem }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in srs-review function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
