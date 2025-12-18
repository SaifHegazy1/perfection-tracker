-- Create enum for homework status
CREATE TYPE public.hw_status AS ENUM ('complete', 'not_done', 'partial', 'cheated');

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'parent');

-- Create sheets table (cam 1, cam 2, miami west, station 1-3)
CREATE TABLE public.sheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create students table
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_code TEXT NOT NULL, -- c001, c002, etc.
    name TEXT NOT NULL,
    student_phone TEXT,
    parent_phone TEXT NOT NULL,
    sheet_id UUID REFERENCES public.sheets(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(student_code, sheet_id)
);

-- Create sessions table (stores session data for each student)
CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    session_number INTEGER NOT NULL CHECK (session_number >= 1 AND session_number <= 8),
    attended BOOLEAN DEFAULT false,
    payment NUMERIC(10,2) DEFAULT 0,
    quiz_mark NUMERIC(5,2),
    time TEXT,
    finish_time TEXT,
    hw1_status hw_status,
    hw2_status hw_status,
    hw3_status hw_status,
    hw4_status hw_status,
    hw5_status hw_status,
    hw6_status hw_status,
    hw7_status hw_status,
    hw8_status hw_status,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(student_id, session_number)
);

-- Create users table for authentication
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_or_username TEXT NOT NULL UNIQUE,
    must_change_password BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Link users to students (for parent access)
CREATE TABLE public.user_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(user_id, student_id)
);

-- Enable RLS on all tables
ALTER TABLE public.sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_students ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.users u ON u.id = ur.user_id
    WHERE u.auth_id = _user_id
      AND ur.role = _role
  )
$$;

-- Function to get user_id from auth_id
CREATE OR REPLACE FUNCTION public.get_user_id(_auth_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.users WHERE auth_id = _auth_id LIMIT 1
$$;

-- RLS Policies for sheets (admins can do everything, parents can read)
CREATE POLICY "Admins can manage sheets" ON public.sheets FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Parents can view sheets" ON public.sheets FOR SELECT TO authenticated
USING (true);

-- RLS Policies for students
CREATE POLICY "Admins can manage students" ON public.students FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Parents can view their students" ON public.students FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_students us
    JOIN public.users u ON u.id = us.user_id
    WHERE us.student_id = students.id AND u.auth_id = auth.uid()
  )
);

-- RLS Policies for sessions
CREATE POLICY "Admins can manage sessions" ON public.sessions FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Parents can view their students sessions" ON public.sessions FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_students us
    JOIN public.users u ON u.id = us.user_id
    WHERE us.student_id = sessions.student_id AND u.auth_id = auth.uid()
  )
);

-- RLS Policies for users
CREATE POLICY "Users can view own data" ON public.users FOR SELECT TO authenticated
USING (auth_id = auth.uid());

CREATE POLICY "Admins can manage users" ON public.users FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = user_roles.user_id AND u.auth_id = auth.uid()
  )
);

-- RLS Policies for user_students
CREATE POLICY "Admins can manage user_students" ON public.user_students FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own links" ON public.user_students FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = user_students.user_id AND u.auth_id = auth.uid()
  )
);

-- Insert default sheets
INSERT INTO public.sheets (name) VALUES 
('cam 1'), ('cam 2'), ('miami west'), ('station 1'), ('station 2'), ('station 3');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for sessions updated_at
CREATE TRIGGER update_sessions_updated_at
BEFORE UPDATE ON public.sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();