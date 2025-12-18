import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExcelRow {
  id: string;
  name: string;
  student_phone: string;
  parent_phone: string;
  attendance: number | null;
  payment: number | null;
  quiz_mark: number | null;
  time: string | null;
  hw_status: number | null;
}

interface RequestBody {
  excelData: ExcelRow[];
  sheetName: string;
  sessionNumber: number;
  finishTime?: string;
  hwColumn: string; // hw1, hw2, etc.
}

// Convert numeric HW status to enum value
function getHwStatus(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'complete';
  const numValue = Number(value);
  if (isNaN(numValue) || numValue === 0) return 'complete';
  switch (numValue) {
    case 1: return 'not_done';
    case 2: return 'partial';
    case 3: return 'cheated';
    default: return 'complete';
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: RequestBody = await req.json();
    const { excelData, sheetName, sessionNumber, finishTime, hwColumn } = body;

    console.log('Received request:', { sheetName, sessionNumber, finishTime, hwColumn, rowCount: excelData.length });

    // Get the sheet ID
    const { data: sheetData, error: sheetError } = await supabase
      .from('sheets')
      .select('id')
      .eq('name', sheetName)
      .maybeSingle();

    if (sheetError) {
      console.error('Sheet error:', sheetError);
      throw new Error(`Failed to find sheet: ${sheetError.message}`);
    }

    if (!sheetData) {
      throw new Error(`Sheet "${sheetName}" not found`);
    }

    const sheetId = sheetData.id;
    console.log('Found sheet:', sheetId);

    let processedCount = 0;
    const errors: string[] = [];

    for (const row of excelData) {
      try {
        if (!row.id || !row.name || !row.parent_phone) {
          console.log('Skipping row with missing data:', row);
          continue;
        }

        // Upsert student
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .upsert({
            student_code: row.id,
            name: row.name,
            student_phone: row.student_phone || null,
            parent_phone: row.parent_phone,
            sheet_id: sheetId
          }, {
            onConflict: 'student_code,sheet_id'
          })
          .select('id')
          .single();

        if (studentError) {
          console.error('Student upsert error:', studentError);
          errors.push(`Student ${row.id}: ${studentError.message}`);
          continue;
        }

        const studentId = studentData.id;

        // Build session update object
        const hwColumnKey = `${hwColumn.toLowerCase()}_status`;
        const sessionUpdate: Record<string, unknown> = {
          student_id: studentId,
          session_number: sessionNumber,
          attended: row.attendance === 1,
          payment: row.payment || 0,
          quiz_mark: row.quiz_mark || null,
          time: row.time || null,
          finish_time: finishTime || null,
          [hwColumnKey]: getHwStatus(row.hw_status)
        };

        // Upsert session
        const { error: sessionError } = await supabase
          .from('sessions')
          .upsert(sessionUpdate, {
            onConflict: 'student_id,session_number'
          });

        if (sessionError) {
          console.error('Session upsert error:', sessionError);
          errors.push(`Session for ${row.id}: ${sessionError.message}`);
          continue;
        }

        // Check if user exists for this parent phone
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('phone_or_username', row.parent_phone)
          .maybeSingle();

        if (!existingUser) {
          // Create user record (without auth - will be created on first login)
          const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert({
              phone_or_username: row.parent_phone,
              must_change_password: true
            })
            .select('id')
            .single();

          if (!userError && newUser) {
            // Link user to student
            await supabase
              .from('user_students')
              .upsert({
                user_id: newUser.id,
                student_id: studentId
              }, {
                onConflict: 'user_id,student_id'
              });

            // Add parent role
            await supabase
              .from('user_roles')
              .upsert({
                user_id: newUser.id,
                role: 'parent'
              }, {
                onConflict: 'user_id,role'
              });
          }
        } else {
          // Link existing user to student if not already linked
          await supabase
            .from('user_students')
            .upsert({
              user_id: existingUser.id,
              student_id: studentId
            }, {
              onConflict: 'user_id,student_id'
            });
        }

        processedCount++;
      } catch (rowError: unknown) {
        console.error('Row processing error:', rowError);
        const errorMessage = rowError instanceof Error ? rowError.message : 'Unknown error';
        errors.push(`Row ${row.id}: ${errorMessage}`);
      }
    }

    console.log('Processing complete:', { processedCount, errorCount: errors.length });

    return new Response(
      JSON.stringify({
        success: true,
        processedCount,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
