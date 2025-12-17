import React from 'react';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import PhysicsBackground from '@/components/PhysicsBackground';
import LanguageToggle from '@/components/LanguageToggle';
import LoginForm from '@/components/LoginForm';
import ChangePasswordForm from '@/components/ChangePasswordForm';
import StudentDashboard from '@/components/StudentDashboard';
import AdminDashboard from '@/components/AdminDashboard';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  // Not logged in - show login form
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <PhysicsBackground />
        
        {/* Language Toggle */}
        <div className="absolute top-4 right-4 z-10">
          <LanguageToggle />
        </div>

        {/* Login Form */}
        <div className="flex-1 flex items-center justify-center p-4">
          <LoginForm />
        </div>

        {/* Footer */}
        <footer className="text-center py-4 text-muted-foreground text-sm">
          <p>© 2024 {t('title')} - Physics Tutoring</p>
        </footer>
      </div>
    );
  }

  // First login - show change password form
  if (user.isFirstLogin && !user.isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <PhysicsBackground />
        
        <div className="absolute top-4 right-4 z-10">
          <LanguageToggle />
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <ChangePasswordForm />
        </div>
      </div>
    );
  }

  // Admin dashboard
  if (user.isAdmin) {
    return (
      <div className="min-h-screen">
        <PhysicsBackground />
        <AdminDashboard />
      </div>
    );
  }

  // Student dashboard
  return (
    <div className="min-h-screen">
      <PhysicsBackground />
      <StudentDashboard />
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
};

export default Index;
