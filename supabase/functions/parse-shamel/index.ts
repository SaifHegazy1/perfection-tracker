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
  parent_phone: string;
  attendance: number | null;
  payment: number | null;
  quiz_mark: number | null;
}

interface RequestBody {
  excelData: ExcelRow[];
  sheetName: string;
  examName: string;
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
    const { excelData, sheetName, examName } = body;

    console.log('Received Shamel request:', { sheetName, examName, rowCount: excelData.length });

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

    // Create or get exam
    const { data: existingExam } = await supabase
      .from('exams')
      .select('id')
      .eq('name', examName)
      .eq('exam_type', 'shamel')
      .maybeSingle();

    let examId: string;
    if (existingExam) {
      examId = existingExam.id;
      console.log('Using existing exam:', examId);
    } else {
      const { data: newExam, error: examError } = await supabase
        .from('exams')
        .insert({ name: examName, exam_type: 'shamel' })
        .select('id')
        .single();

      if (examError) {
        console.error('Exam creation error:', examError);
        throw new Error(`Failed to create exam: ${examError.message}`);
      }
      examId = newExam.id;
      console.log('Created new exam:', examId);
    }

    let processedCount = 0;
    const errors: string[] = [];

    for (const row of excelData) {
      try {
        if (!row.id || !row.name || !row.parent_phone) {
          console.log('Skipping row with missing data:', row);
          continue;
        }

        // Find student by student_code and sheet_id
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('id')
          .eq('student_code', row.id)
          .eq('sheet_id', sheetId)
          .maybeSingle();

        if (studentError || !studentData) {
          // Student doesn't exist, create them
          const { data: newStudent, error: createError } = await supabase
            .from('students')
            .insert({
              student_code: row.id,
              name: row.name,
              parent_phone: row.parent_phone,
              sheet_id: sheetId
            })
            .select('id')
            .single();

          if (createError) {
            console.error('Student creation error:', createError);
            errors.push(`Student ${row.id}: ${createError.message}`);
            continue;
          }

          // Upsert exam result
          const { error: resultError } = await supabase
            .from('exam_results')
            .upsert({
              exam_id: examId,
              student_id: newStudent.id,
              attendance: row.attendance === 1,
              payment: row.payment || 0,
              quiz_mark: row.quiz_mark || null
            }, {
              onConflict: 'exam_id,student_id'
            });

          if (resultError) {
            console.error('Exam result upsert error:', resultError);
            errors.push(`Exam result for ${row.id}: ${resultError.message}`);
            continue;
          }
        } else {
          // Upsert exam result for existing student
          const { error: resultError } = await supabase
            .from('exam_results')
            .upsert({
              exam_id: examId,
              student_id: studentData.id,
              attendance: row.attendance === 1,
              payment: row.payment || 0,
              quiz_mark: row.quiz_mark || null
            }, {
              onConflict: 'exam_id,student_id'
            });

          if (resultError) {
            console.error('Exam result upsert error:', resultError);
            errors.push(`Exam result for ${row.id}: ${resultError.message}`);
            continue;
          }
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
