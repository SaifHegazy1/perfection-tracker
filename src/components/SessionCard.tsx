import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle2, XCircle, Clock, DollarSign, GraduationCap, BookOpen } from 'lucide-react';

interface SessionData {
  sessionNumber: number;
  attended: boolean;
  payment: number;
  examMark: number | null;
  quizMark: number | null;
  time: string | null;
  finishTime: string | null;
}

interface SessionCardProps {
  session: SessionData;
  index: number;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, index }) => {
  const { t } = useLanguage();

  return (
    <div 
      className="glass-card p-4 hover:scale-[1.02] transition-all duration-300 animate-slide-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Session Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg gradient-text">
          {t('session')} {session.sessionNumber}
        </h3>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
          session.attended 
            ? 'bg-success/20 text-success' 
            : 'bg-destructive/20 text-destructive'
        }`}>
          {session.attended ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              {t('present')}
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4" />
              {t('absent')}
            </>
          )}
        </div>
      </div>

      {/* Session Details Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Payment */}
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <DollarSign className="w-3 h-3" />
            {t('payment')}
          </div>
          <p className="font-semibold text-foreground">
            {session.payment} {t('egp')}
          </p>
        </div>

        {/* Exam Mark */}
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <GraduationCap className="w-3 h-3" />
            {t('examMark')}
          </div>
          <p className="font-semibold text-foreground">
            {session.examMark !== null ? `${session.examMark}%` : '-'}
          </p>
        </div>

        {/* Quiz Mark */}
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <BookOpen className="w-3 h-3" />
            {t('quizMark')}
          </div>
          <p className="font-semibold text-foreground">
            {session.quizMark !== null ? `${session.quizMark}%` : '-'}
          </p>
        </div>

        {/* Time */}
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Clock className="w-3 h-3" />
            {t('time')}
          </div>
          <p className="font-semibold text-foreground text-sm">
            {session.time || '-'}
          </p>
        </div>
      </div>

      {/* Finish Time */}
      {session.finishTime && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('finishTime')}:</span>
            <span className="text-foreground font-medium">{session.finishTime}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionCard;
