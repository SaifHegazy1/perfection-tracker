import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import SessionCard from './SessionCard';
import LanguageToggle from './LanguageToggle';
import logo from '@/assets/logo.jpg';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// Demo session data with HW status
// hwStatus: 'complete' (empty), 'notDone' (1), 'partial' (2), 'cheated' (3)
const demoSessions = [
  { sessionNumber: 1, attended: true, payment: 150, examMark: 85, quizMark: 18, time: '10:30 AM', finishTime: '12:00 PM', hwStatus: 'complete' as const },
  { sessionNumber: 2, attended: true, payment: 150, examMark: 78, quizMark: 15, time: '10:45 AM', finishTime: '12:15 PM', hwStatus: 'partial' as const },
  { sessionNumber: 3, attended: false, payment: 0, examMark: null, quizMark: null, time: null, finishTime: null, hwStatus: null },
  { sessionNumber: 4, attended: true, payment: 150, examMark: 92, quizMark: 20, time: '10:20 AM', finishTime: '11:50 AM', hwStatus: 'complete' as const },
  { sessionNumber: 5, attended: true, payment: 150, examMark: 88, quizMark: 17, time: '10:35 AM', finishTime: '12:05 PM', hwStatus: 'notDone' as const },
  { sessionNumber: 6, attended: true, payment: 150, examMark: 75, quizMark: 14, time: '10:40 AM', finishTime: '12:10 PM', hwStatus: 'complete' as const },
  { sessionNumber: 7, attended: false, payment: 0, examMark: null, quizMark: null, time: null, finishTime: null, hwStatus: null },
  { sessionNumber: 8, attended: true, payment: 150, examMark: 90, quizMark: 19, time: '10:25 AM', finishTime: '11:55 AM', hwStatus: 'cheated' as const },
];

const StudentDashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const { user, logout } = useAuth();

  const totalPayment = demoSessions.reduce((sum, s) => sum + s.payment, 0);
  const attendedCount = demoSessions.filter(s => s.attended).length;

  // Quiz marks chart data
  const quizChartData = demoSessions
    .filter(s => s.quizMark !== null)
    .map(s => ({
      name: `S${s.sessionNumber}`,
      mark: s.quizMark,
    }));

  // HW status chart data
  const hwStatusCounts = {
    complete: demoSessions.filter(s => s.hwStatus === 'complete').length,
    partial: demoSessions.filter(s => s.hwStatus === 'partial').length,
    notDone: demoSessions.filter(s => s.hwStatus === 'notDone').length,
    cheated: demoSessions.filter(s => s.hwStatus === 'cheated').length,
  };

  const hwPieData = [
    { name: language === 'ar' ? 'مكتمل' : 'Complete', value: hwStatusCounts.complete, color: 'hsl(var(--success))' },
    { name: language === 'ar' ? 'جزئي' : 'Partial', value: hwStatusCounts.partial, color: 'hsl(var(--warning))' },
    { name: language === 'ar' ? 'لم يحل' : 'Not Done', value: hwStatusCounts.notDone, color: 'hsl(var(--destructive))' },
    { name: language === 'ar' ? 'غش' : 'Cheated', value: hwStatusCounts.cheated, color: 'hsl(var(--muted-foreground))' },
  ].filter(item => item.value > 0);

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
              <h2 className="text-2xl font-bold text-foreground">{user?.name}</h2>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Quiz Marks Chart */}
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

        {/* HW Status Chart */}
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
      </div>

      {/* Sessions Grid */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t('sessions')}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {demoSessions.map((session, index) => (
          <SessionCard key={session.sessionNumber} session={session} index={index} />
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;
