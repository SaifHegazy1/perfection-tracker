import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/logo.jpg';

const ChangePasswordForm: React.FC = () => {
  const { t } = useLanguage();
  const { changePassword, user } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    changePassword(newPassword);
    toast.success(t('passwordChanged'));
  };

  return (
    <div className="w-full max-w-md mx-auto animate-slide-up">
      <div className="glass-card p-8 glow-border">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img 
            src={logo} 
            alt="Perfection Follow Up" 
            className="w-24 h-24 rounded-full object-cover border-4 border-primary/30"
          />
        </div>

        <div className="flex items-center justify-center gap-2 mb-4 text-warning">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">{t('firstLoginMessage')}</span>
        </div>

        <h2 className="text-xl font-bold text-center mb-6 text-foreground">
          {t('changePassword')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-foreground">{t('newPassword')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10 bg-secondary/50 border-border focus:border-primary"
                required
                minLength={6}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-foreground">{t('confirmPassword')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 bg-secondary/50 border-border focus:border-primary"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {t('changePassword')}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordForm;
