import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CodeforcesProblem {
  contestId: number;
  index: string;
  name: string;
  type: string;
  rating?: number;
  tags: string[];
}

interface CodeforcesSubmission {
  id: number;
  contestId: number;
  creationTimeSeconds: number;
  relativeTimeSeconds: number;
  problem: CodeforcesProblem;
  author: {
    members: Array<{ handle: string }>;
  };
  programmingLanguage: string;
  verdict: string;
  testset: string;
  passedTestCount: number;
  timeConsumedMillis: number;
  memoryConsumedBytes: number;
}

interface CodeforcesContest {
  id: number;
  contestId: number;
  creationTimeSeconds: number;
  relativeTimeSeconds: number;
  problem: CodeforcesProblem;
  author: {
    members: Array<{ handle: string }>;
  };
  rank: number;
  points: number;
  penalty: number;
  successfulHackCount: number;
  unsuccessfulHackCount: number;
}

async function fetchCodeforcesData(handle: string) {
  console.log(`Fetching data for handle: ${handle}`);
  
  try {
    // Fetch user submissions
    const submissionsResponse = await fetch(
      `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`
    );
    
    if (!submissionsResponse.ok) {
      throw new Error(`Failed to fetch submissions: ${submissionsResponse.status}`);
    }
    
    const submissionsData = await submissionsResponse.json();
    
    if (submissionsData.status !== 'OK') {
      throw new Error(`Codeforces API error: ${submissionsData.comment}`);
    }

    // Fetch user rating history
    const ratingsResponse = await fetch(
      `https://codeforces.com/api/user.rating?handle=${handle}`
    );
    
    let ratingsData = { result: [] };
    if (ratingsResponse.ok) {
      ratingsData = await ratingsResponse.json();
    }

    return {
      submissions: submissionsData.result as CodeforcesSubmission[],
      contests: ratingsData.result as CodeforcesContest[]
    };
  } catch (error) {
    console.error(`Error fetching data for ${handle}:`, error);
    throw error;
  }
}

async function syncStudentData(supabase: any, student: any) {
  console.log(`Syncing data for student: ${student.name} (${student.codeforces_handle})`);
  
  try {
    const { submissions, contests } = await fetchCodeforcesData(student.codeforces_handle);
    
    // Process submissions to get problems
    const problems = submissions
      .filter((sub: CodeforcesSubmission) => sub.verdict === 'OK')
      .map((sub: CodeforcesSubmission) => ({
        student_id: student.id,
        problem_id: `${sub.contestId}${sub.problem.index}`,
        name: sub.problem.name,
        rating: sub.problem.rating || null,
        solved_at: new Date(sub.creationTimeSeconds * 1000).toISOString(),
        verdict: sub.verdict,
        contest_id: sub.contestId.toString()
      }));

    // Remove duplicates (keep the earliest solve)
    const uniqueProblems = problems.reduce((acc: any[], current: any) => {
      const existing = acc.find(p => p.problem_id === current.problem_id);
      if (!existing || new Date(current.solved_at) < new Date(existing.solved_at)) {
        return acc.filter(p => p.problem_id !== current.problem_id).concat(current);
      }
      return acc;
    }, []);

    // Process contests
    const contestData = contests.map((contest: any) => ({
      student_id: student.id,
      contest_id: contest.contestId.toString(),
      name: contest.contestName || `Contest ${contest.contestId}`,
      date: new Date(contest.ratingUpdateTimeSeconds * 1000).toISOString(),
      rank: contest.rank,
      rating_change: contest.newRating - contest.oldRating,
      new_rating: contest.newRating,
      problems_solved: 0,
      total_problems: 0
    }));

    // Clear existing data for this student
    await supabase.from('problems').delete().eq('student_id', student.id);
    await supabase.from('contests').delete().eq('student_id', student.id);

    // Insert new problems
    if (uniqueProblems.length > 0) {
      const { error: problemsError } = await supabase
        .from('problems')
        .insert(uniqueProblems);
      
      if (problemsError) {
        console.error('Error inserting problems:', problemsError);
        throw problemsError;
      }
    }

    // Insert new contests
    if (contestData.length > 0) {
      const { error: contestsError } = await supabase
        .from('contests')
        .insert(contestData);
      
      if (contestsError) {
        console.error('Error inserting contests:', contestsError);
        throw contestsError;
      }
    }

    // Update student ratings and activity status
    const currentRating = contests.length > 0 ? contests[contests.length - 1].newRating : 0;
    const maxRating = contests.length > 0 ? Math.max(...contests.map((c: any) => c.newRating)) : 0;
    
    // Check if active (solved problems in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentProblems = uniqueProblems.filter(p => new Date(p.solved_at) >= sevenDaysAgo);
    const isActive = recentProblems.length > 0;

    const { error: updateError } = await supabase
      .from('students')
      .update({
        current_rating: currentRating,
        max_rating: maxRating,
        is_active: isActive,
        last_updated: new Date().toISOString()
      })
      .eq('id', student.id);

    if (updateError) {
      console.error('Error updating student:', updateError);
      throw updateError;
    }

    // Log successful sync
    await supabase.from('sync_logs').insert({
      student_id: student.id,
      sync_type: 'scheduled',
      status: 'success',
      contests_synced: contestData.length,
      problems_synced: uniqueProblems.length
    });

    console.log(`Successfully synced ${uniqueProblems.length} problems and ${contestData.length} contests for ${student.name}`);
    
    return {
      success: true,
      problemsSynced: uniqueProblems.length,
      contestsSynced: contestData.length
    };
    
  } catch (error) {
    console.error(`Error syncing student ${student.name}:`, error);
    
    // Log failed sync
    await supabase.from('sync_logs').insert({
      student_id: student.id,
      sync_type: 'scheduled',
      status: 'failed',
      error_message: error.message
    });
    
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { student_id } = await req.json()

    if (student_id) {
      // Sync specific student
      const { data: student, error } = await supabaseClient
        .from('students')
        .select('*')
        .eq('id', student_id)
        .single()

      if (error) throw error

      const result = await syncStudentData(supabaseClient, student)
      
      return new Response(
        JSON.stringify({ success: true, data: result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Sync all students
      const { data: students, error } = await supabaseClient
        .from('students')
        .select('*')

      if (error) throw error

      const results = []
      for (const student of students) {
        try {
          const result = await syncStudentData(supabaseClient, student)
          results.push({ student: student.name, ...result })
          
          // Add delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
          results.push({ 
            student: student.name, 
            success: false, 
            error: error.message 
          })
        }
      }

      // Update last sync time
      await supabaseClient
        .from('app_settings')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', (await supabaseClient.from('app_settings').select('id').single()).data.id)

      return new Response(
        JSON.stringify({ success: true, results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Error in sync-codeforces function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
