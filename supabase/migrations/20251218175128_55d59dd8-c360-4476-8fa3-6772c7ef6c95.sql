-- Create exams table for custom exams like "درجات الشامل" (Shamel)
CREATE TABLE public.exams (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    exam_type TEXT NOT NULL DEFAULT 'shamel',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exam_results table to store student exam scores
CREATE TABLE public.exam_results (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    attendance BOOLEAN DEFAULT false,
    payment NUMERIC DEFAULT 0,
    quiz_mark NUMERIC DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(exam_id, student_id)
);

-- Enable RLS
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

-- Policies for exams table
CREATE POLICY "Admins can manage exams"
ON public.exams
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Parents can view exams"
ON public.exams
FOR SELECT
USING (true);

-- Policies for exam_results table
CREATE POLICY "Admins can manage exam_results"
ON public.exam_results
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Parents can view their students exam_results"
ON public.exam_results
FOR SELECT
USING (EXISTS (
    SELECT 1 FROM user_students us
    JOIN users u ON u.id = us.user_id
    WHERE us.student_id = exam_results.student_id AND u.auth_id = auth.uid()
));

-- Create trigger for updated_at
CREATE TRIGGER update_exam_results_updated_at
BEFORE UPDATE ON public.exam_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();