import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut, User, Loader2 } from 'lucide-react';
import SessionCard from './SessionCard';
import LanguageToggle from './LanguageToggle';
import logo from '@/assets/logo.jpg';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface SessionData {
  sessionNumber: number;
  attended: boolean;
  payment: number;
  examMark: number | null;
  quizMark: number | null;
  time: string | null;
  finishTime: string | null;
  hwStatus: 'complete' | 'notDone' | 'partial' | 'cheated' | null;
}

const StudentDashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentName, setStudentName] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchStudentSessions();
    }
  }, [user]);

  const fetchStudentSessions = async () => {
    if (!user) return;

    try {
      // Get student ID linked to this user
      const { data: studentLink, error: linkError } = await supabase
        .from('user_students')
        .select('student_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (linkError || !studentLink) {
        console.error('Error fetching student link:', linkError);
        setIsLoading(false);
        return;
      }

      // Get student info
      const { data: studentData } = await supabase
        .from('students')
        .select('name')
        .eq('id', studentLink.student_id)
        .maybeSingle();

      if (studentData) {
        setStudentName(studentData.name);
      }

      // Get all sessions for this student
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('student_id', studentLink.student_id)
        .order('session_number');

      if (sessionError) {
        console.error('Error fetching sessions:', sessionError);
        setIsLoading(false);
        return;
      }

      // Map HW status from database enum to frontend format
      const mapHwStatus = (status: string | null): 'complete' | 'notDone' | 'partial' | 'cheated' | null => {
        if (!status) return null;
        switch (status) {
          case 'complete': return 'complete';
          case 'not_done': return 'notDone';
          case 'partial': return 'partial';
          case 'cheated': return 'cheated';
          default: return null;
        }
      };

      // Build sessions array (1-8)
      const allSessions: SessionData[] = [];
      for (let i = 1; i <= 8; i++) {
        const dbSession = sessionData?.find(s => s.session_number === i);
        
        // Get the first non-null HW status from hw1-hw8
        let hwStatus: 'complete' | 'notDone' | 'partial' | 'cheated' | null = null;
        if (dbSession) {
          for (let j = 1; j <= 8; j++) {
            const hwKey = `hw${j}_status` as keyof typeof dbSession;
            if (dbSession[hwKey]) {
              hwStatus = mapHwStatus(dbSession[hwKey] as string);
              break;
            }
          }
        }

        allSessions.push({
          sessionNumber: i,
          attended: dbSession?.attended || false,
          payment: Number(dbSession?.payment) || 0,
          examMark: null, // Not in current schema
          quizMark: dbSession?.quiz_mark ? Number(dbSession.quiz_mark) : null,
          time: dbSession?.time || null,
          finishTime: dbSession?.finish_time || null,
          hwStatus
        });
      }

      setSessions(allSessions);
    } catch (error) {
      console.error('Error in fetchStudentSessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPayment = sessions.reduce((sum, s) => sum + s.payment, 0);
  const attendedCount = sessions.filter(s => s.attended).length;

  // Quiz marks chart data
  const quizChartData = sessions
    .filter(s => s.quizMark !== null)
    .map(s => ({
      name: `S${s.sessionNumber}`,
      mark: s.quizMark,
    }));

  // HW status chart data
  const hwStatusCounts = {
    complete: sessions.filter(s => s.hwStatus === 'complete').length,
    partial: sessions.filter(s => s.hwStatus === 'partial').length,
    notDone: sessions.filter(s => s.hwStatus === 'notDone').length,
    cheated: sessions.filter(s => s.hwStatus === 'cheated').length,
  };

  const hwPieData = [
    { name: language === 'ar' ? 'مكتمل' : 'Complete', value: hwStatusCounts.complete, color: 'hsl(var(--success))' },
    { name: language === 'ar' ? 'جزئي' : 'Partial', value: hwStatusCounts.partial, color: 'hsl(var(--warning))' },
    { name: language === 'ar' ? 'لم يحل' : 'Not Done', value: hwStatusCounts.notDone, color: 'hsl(var(--destructive))' },
    { name: language === 'ar' ? 'غش' : 'Cheated', value: hwStatusCounts.cheated, color: 'hsl(var(--muted-foreground))' },
  ].filter(item => item.value > 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="glass-card p-4 mb-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img 
              src={logo} 
              alt="Logo" 
              className="w-12 h-12 rounded-full object-cover border-2 border-primary/50"
            />
            <div>
              <h1 className="text-xl font-bold gradient-text">{t('title')}</h1>
              <p className="text-sm text-muted-foreground">{t('dashboard')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2"
            >
              <LogOut className="w-4 h-4" />
              {t('logout')}
            </Button>
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <div className="glass-card p-6 mb-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">{t('welcomeBack')}</p>
              <h2 className="text-2xl font-bold text-foreground">{studentName || user?.name || user?.phoneOrUsername}</h2>
              <p className="text-xs text-muted-foreground capitalize">{user?.sheet}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center p-3 bg-secondary/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">{attendedCount}/8</p>
              <p className="text-xs text-muted-foreground">{t('attendance')}</p>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-lg">
              <p className="text-2xl font-bold text-accent">{totalPayment}</p>
              <p className="text-xs text-muted-foreground">{t('payment')} ({t('egp')})</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      {(quizChartData.length > 0 || hwPieData.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Quiz Marks Chart */}
          {quizChartData.length > 0 && (
            <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {language === 'ar' ? 'درجات الكويز' : 'Quiz Marks'}
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={quizChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }} 
                    />
                    <Bar dataKey="mark" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* HW Status Chart */}
          {hwPieData.length > 0 && (
            <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {language === 'ar' ? 'حالة الواجبات' : 'Homework Status'}
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={hwPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {hwPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sessions Grid */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t('sessions')}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sessions.map((session, index) => (
          <SessionCard key={session.sessionNumber} session={session} index={index} />
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;
