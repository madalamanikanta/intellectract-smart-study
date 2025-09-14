import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Submission {
  title: string;
  titleSlug: string;
  statusDisplay: string;
  lang: string;
}

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

    const { platform, username } = await req.json();

    if (!platform || !username) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: platform, username" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    let solvedProblems: Submission[] = [];
    let problemsCount = 0;

    if (platform === 'leetcode') {
      const response = await fetch(`https://leetcode-api-pied.vercel.app/user/${username}/submissions`);
      if (!response.ok) {
        throw new Error(`Failed to fetch LeetCode data for username: ${username}`);
      }
      const submissions: Submission[] = await response.json();

      const acceptedSubmissions = submissions.filter(sub => sub.statusDisplay === 'Accepted');
      const uniqueSolved = [...new Map(acceptedSubmissions.map(item => [item['titleSlug'], item])).values()];

      solvedProblems = uniqueSolved;
      problemsCount = uniqueSolved.length;
    } else {
      return new Response(
        JSON.stringify({ error: "Platform not supported" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Upsert data into the imports table
    const { data: importRecord, error: upsertError } = await supabaseClient
      .from('imports')
      .upsert({
        user_id: user.id,
        platform: platform,
        username: username,
        import_data: { problems: solvedProblems },
        problems_count: problemsCount,
        last_synced: new Date().toISOString(),
        status: 'active',
      }, { onConflict: 'user_id, platform' })
      .select()
      .single();

    if (upsertError) {
      console.error('Error upserting import data:', upsertError);
      throw new Error('Failed to save import data');
    }

    return new Response(
      JSON.stringify({ success: true, record: importRecord }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in import-scores function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
