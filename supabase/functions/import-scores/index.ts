import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImportResult {
  problems_count: number;
  contest_rating: number;
  badges: any[];
  raw_data: any;
}

// --- LeetCode Helper ---
async function fetchLeetCodeData(username: string): Promise<ImportResult> {
  const response = await fetch(`https://leetcode-api-pied.vercel.app/user/${username}/submissions`);
  if (!response.ok) throw new Error(`Failed to fetch LeetCode data for username: ${username}`);
  const submissions = await response.json();

  const accepted = submissions.filter((s: any) => s.statusDisplay === 'Accepted');
  const unique = [...new Map(accepted.map((item: any) => [item.titleSlug, item])).values()];

  const profileResponse = await fetch(`https://leetcode-api-pied.vercel.app/user/${username}`);
  const profile = await profileResponse.json();

  return {
    problems_count: unique.length,
    contest_rating: profile.contestBadge?.name ? 1 : 0, // LeetCode API doesn't provide rating directly, using badge as a proxy
    badges: profile.profile?.skillTags?.map((tag: string) => ({ name: tag })) || [],
    raw_data: { submissions, profile },
  };
}

// --- HackerRank Helper ---
async function fetchHackerRankData(username: string): Promise<ImportResult> {
  const response = await fetch(`https://www.hackerrank.com/rest/contests/master/hackers/${username}/profile`);
  if (!response.ok) throw new Error(`Failed to fetch HackerRank data for username: ${username}`);
  const data = await response.json();

  return {
    problems_count: data.model.solved_challenges_count || 0,
    contest_rating: 0, // Not available in this endpoint
    badges: data.model.badges?.map((b: any) => ({ name: b.badge_name })) || [],
    raw_data: data.model,
  };
}

// --- Codeforces Helper ---
async function fetchCodeforcesData(username: string): Promise<ImportResult> {
  const response = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
  if (!response.ok) throw new Error(`Failed to fetch Codeforces data for username: ${username}`);
  const data = await response.json();
  if (data.status !== 'OK') throw new Error(data.comment);

  const user = data.result[0];
  const submissionsResponse = await fetch(`https://codeforces.com/api/user.status?handle=${username}&from=1&count=10000`);
  const submissionsData = await submissionsResponse.json();
  if (submissionsData.status !== 'OK') throw new Error(submissionsData.comment);
  const solved = new Set(submissionsData.result.filter((s: any) => s.verdict === 'OK').map((s: any) => s.problem.name));

  return {
    problems_count: solved.size,
    contest_rating: user.rating || 0,
    badges: [{ name: user.rank, value: user.rating }],
    raw_data: {user, submissions: submissionsData.result},
  };
}

// --- CodeChef Helper ---
async function fetchCodeChefData(username: string): Promise<ImportResult> {
    const response = await fetch(`https://www.codechef.com/users/${username}`);
    if (!response.ok) throw new Error(`Failed to fetch CodeChef data for username: ${username}`);
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (!doc) throw new Error("Failed to parse CodeChef profile page");

    const ratingText = doc.querySelector(".rating-number")?.textContent || "0";
    const problemsText = doc.querySelector(".problems-solved h3")?.textContent || "0";

    const problems_count = parseInt(problemsText.replace(/\D/g, ''), 10) || 0;
    const contest_rating = parseInt(ratingText, 10) || 0;
    const badges = Array.from(doc.querySelectorAll('.badge__title')).map(b => ({ name: b.textContent.trim() }));

    return { problems_count, contest_rating, badges, raw_data: {} };
}


// --- AtCoder Helper ---
async function fetchAtCoderData(username: string): Promise<ImportResult> {
    const response = await fetch(`https://atcoder.jp/users/${username}/history/json`);
    if (!response.ok) throw new Error(`Failed to fetch AtCoder data for username: ${username}`);
    const history = await response.json();

    const rating = history.length > 0 ? history[history.length - 1].NewRating : 0;

    // AtCoder does not provide a simple solved count, so we leave it as 0 for now.
    return {
        problems_count: 0,
        contest_rating: rating,
        badges: [],
        raw_data: history,
    };
}


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) throw new Error('Unauthorized');

    const { platform, username } = await req.json();
    if (!platform || !username) {
      return new Response(JSON.stringify({ error: "Platform and username are required" }), { status: 400 });
    }

    let result: ImportResult;
    switch (platform) {
      case 'leetcode':
        result = await fetchLeetCodeData(username);
        break;
      case 'hackerrank':
        result = await fetchHackerRankData(username);
        break;
      case 'codeforces':
        result = await fetchCodeforcesData(username);
        break;
      case 'codechef':
        result = await fetchCodeChefData(username);
        break;
      case 'atcoder':
        result = await fetchAtCoderData(username);
        break;
      default:
        return new Response(JSON.stringify({ error: "Platform not supported" }), { status: 400 });
    }

    const { data: importRecord, error: upsertError } = await supabaseClient
      .from('imports')
      .upsert({
        user_id: user.id,
        platform: platform,
        username: username,
        problems_count: result.problems_count,
        contest_rating: result.contest_rating,
        badges: result.badges,
        import_data: result.raw_data,
        last_synced: new Date().toISOString(),
        status: 'active',
      }, { onConflict: 'user_id, platform' })
      .select()
      .single();

    if (upsertError) {
      console.error('Error upserting import data:', upsertError);
      throw new Error('Failed to save import data');
    }

    return new Response(JSON.stringify({ success: true, record: importRecord }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error('Error in import-scores function:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
