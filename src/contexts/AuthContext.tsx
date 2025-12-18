import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface AppUser {
  id: string;
  authId: string | null;
  phoneOrUsername: string;
  role: 'admin' | 'parent';
  mustChangePassword: boolean;
  name?: string;
  sheet?: string;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isLoading: boolean;
  login: (phoneOrUsername: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Defer fetching user data to avoid deadlock
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (authId: string) => {
    try {
      // Get user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, phone_or_username, must_change_password')
        .eq('auth_id', authId)
        .maybeSingle();

      if (userError || !userData) {
        console.error('Error fetching user data:', userError);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Get user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userData.id)
        .maybeSingle();

      // Get student info if parent
      let studentName: string | undefined;
      let sheetName: string | undefined;
      
      if (roleData?.role === 'parent') {
        const { data: studentLink } = await supabase
          .from('user_students')
          .select('student_id')
          .eq('user_id', userData.id)
          .maybeSingle();

        if (studentLink) {
          const { data: studentData } = await supabase
            .from('students')
            .select('name, sheet_id')
            .eq('id', studentLink.student_id)
            .maybeSingle();

          if (studentData) {
            studentName = studentData.name;
            
            const { data: sheetData } = await supabase
              .from('sheets')
              .select('name')
              .eq('id', studentData.sheet_id)
              .maybeSingle();

            sheetName = sheetData?.name;
          }
        }
      }

      setUser({
        id: userData.id,
        authId: authId,
        phoneOrUsername: userData.phone_or_username,
        role: (roleData?.role as 'admin' | 'parent') || 'parent',
        mustChangePassword: userData.must_change_password || false,
        name: studentName,
        sheet: sheetName
      });
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phoneOrUsername: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // First check if user exists in our users table
      const { data: existingUser, error: lookupError } = await supabase
        .from('users')
        .select('id, phone_or_username, must_change_password, auth_id')
        .eq('phone_or_username', phoneOrUsername)
        .maybeSingle();

      if (lookupError) {
        console.error('User lookup error:', lookupError);
        return { success: false, error: 'Login failed. Please try again.' };
      }

      if (!existingUser) {
        return { success: false, error: 'User not found. Please check your phone number or username.' };
      }

      // Check if user is admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', existingUser.id)
        .maybeSingle();

      const isAdmin = roleData?.role === 'admin';

      // Create email from phone/username for Supabase auth
      const email = `${phoneOrUsername.replace(/[^a-zA-Z0-9]/g, '')}@perfection.app`;

      // If user doesn't have auth_id, this is their first login - create auth account
      if (!existingUser.auth_id) {
        // For parents: first login password should be the phone number
        // For admins: accept the provided password directly
        if (!isAdmin) {
          const defaultPassword = phoneOrUsername;
          if (password !== defaultPassword) {
            return { success: false, error: 'Invalid password. For first login, use your phone number as password.' };
          }
        }

        // Create auth account with the provided password
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (signUpError) {
          console.error('Sign up error:', signUpError);
          
          // If user already exists in auth, try to sign in
          if (signUpError.message.includes('already registered')) {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password
            });

            if (signInError) {
              return { success: false, error: 'Invalid password.' };
            }

            // Update user with auth_id
            if (signInData.user) {
              await supabase
                .from('users')
                .update({ auth_id: signInData.user.id })
                .eq('id', existingUser.id);
            }

            return { success: true };
          }
          
          return { success: false, error: signUpError.message };
        }

        // Update user with auth_id
        if (signUpData.user) {
          await supabase
            .from('users')
            .update({ auth_id: signUpData.user.id })
            .eq('id', existingUser.id);
        }

        return { success: true };
      }

      // User has auth_id, try to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        return { success: false, error: 'Invalid password.' };
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred.' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const changePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) {
        return { success: false, error: error.message };
      }

      // Update must_change_password flag
      if (user) {
        await supabase
          .from('users')
          .update({ must_change_password: false })
          .eq('id', user.id);

        setUser({ ...user, mustChangePassword: false });
      }

      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: 'An unexpected error occurred.' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
