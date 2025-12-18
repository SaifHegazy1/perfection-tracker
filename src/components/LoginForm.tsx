import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Shield, Phone, Lock, AlertCircle } from 'lucide-react';
import logo from '@/assets/logo.jpg';

const LoginForm: React.FC = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('parent');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(phone, password);
    
    if (!result.success) {
      setError(result.error || t('invalidCredentials'));
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto animate-slide-up">
      <div className="glass-card p-8 glow-border">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img 
            src={logo} 
            alt="Perfection Follow Up" 
            className="w-32 h-32 rounded-full object-cover border-4 border-primary/30 animate-pulse-glow"
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-2 gradient-text">
          {t('title')}
        </h1>
        <p className="text-muted-foreground text-center mb-6 text-sm">
          {t('loginAs')}
        </p>

        {/* Login Type Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
            <TabsTrigger value="parent" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <User className="w-4 h-4" />
              {t('parent')}
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Shield className="w-4 h-4" />
              {t('admin')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="parent" className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">{t('phoneNumber')}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('enterPhone')}
                    className="pl-10 bg-secondary/50 border-border focus:border-primary"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">{t('password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('enterPassword')}
                    className="pl-10 bg-secondary/50 border-border focus:border-primary"
                    required
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
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={loading}
              >
                {loading ? '...' : t('login')}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="admin" className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-user" className="text-foreground">Username</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="admin-user"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="admin"
                    className="pl-10 bg-secondary/50 border-border focus:border-primary"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password" className="text-foreground">{t('password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('enterPassword')}
                    className="pl-10 bg-secondary/50 border-border focus:border-primary"
                    required
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
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={loading}
              >
                {loading ? '...' : t('login')}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Demo credentials hint */}
        <div className="mt-4 p-3 bg-secondary/30 rounded-lg text-xs text-muted-foreground">
          <p className="font-medium mb-1">Demo Credentials:</p>
          <p>Parent: 01012345678 / 123456</p>
          <p>Admin: admin / admin123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
