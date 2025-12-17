import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

const translations: Translations = {
  title: { en: 'Perfection Follow Up', ar: 'متابعة الإتقان' },
  login: { en: 'Login', ar: 'تسجيل الدخول' },
  logout: { en: 'Logout', ar: 'تسجيل الخروج' },
  phoneNumber: { en: 'Phone Number', ar: 'رقم الهاتف' },
  password: { en: 'Password', ar: 'كلمة المرور' },
  newPassword: { en: 'New Password', ar: 'كلمة المرور الجديدة' },
  confirmPassword: { en: 'Confirm Password', ar: 'تأكيد كلمة المرور' },
  changePassword: { en: 'Change Password', ar: 'تغيير كلمة المرور' },
  firstLoginMessage: { en: 'Please change your password for first login', ar: 'يرجى تغيير كلمة المرور لأول تسجيل دخول' },
  session: { en: 'Session', ar: 'الحصة' },
  selectSession: { en: 'Select Session', ar: 'اختر الحصة' },
  attendance: { en: 'Attendance', ar: 'الحضور' },
  present: { en: 'Present', ar: 'حاضر' },
  absent: { en: 'Absent', ar: 'غائب' },
  payment: { en: 'Payment', ar: 'الدفع' },
  examMark: { en: 'Exam Mark', ar: 'درجة الامتحان' },
  quizMark: { en: 'Quiz Mark', ar: 'درجة الكويز' },
  time: { en: 'Time', ar: 'الوقت' },
  finishTime: { en: 'Finish Time', ar: 'وقت الانتهاء' },
  adminPanel: { en: 'Admin Panel', ar: 'لوحة الإدارة' },
  uploadExcel: { en: 'Upload Excel', ar: 'رفع ملف Excel' },
  selectSheet: { en: 'Select Sheet', ar: 'اختر الورقة' },
  student: { en: 'Student', ar: 'الطالب' },
  sessions: { en: 'Sessions', ar: 'الحصص' },
  dashboard: { en: 'Dashboard', ar: 'لوحة المتابعة' },
  welcomeBack: { en: 'Welcome back', ar: 'مرحباً بعودتك' },
  noData: { en: 'No data available', ar: 'لا توجد بيانات' },
  egp: { en: 'EGP', ar: 'ج.م' },
  admin: { en: 'Admin', ar: 'مدير' },
  parent: { en: 'Parent', ar: 'ولي الأمر' },
  loginAs: { en: 'Login as', ar: 'تسجيل الدخول كـ' },
  invalidCredentials: { en: 'Invalid phone number or password', ar: 'رقم الهاتف أو كلمة المرور غير صحيحة' },
  passwordMismatch: { en: 'Passwords do not match', ar: 'كلمات المرور غير متطابقة' },
  passwordChanged: { en: 'Password changed successfully', ar: 'تم تغيير كلمة المرور بنجاح' },
  enterPhone: { en: 'Enter parent phone number', ar: 'أدخل رقم هاتف ولي الأمر' },
  enterPassword: { en: 'Enter password', ar: 'أدخل كلمة المرور' },
  homework: { en: 'Homework', ar: 'الواجب' },
  hwComplete: { en: 'Completed', ar: 'مكتمل' },
  hwNotDone: { en: 'Not Done', ar: 'لم يُنجز' },
  hwPartial: { en: 'Partial', ar: 'جزئي' },
  hwCheated: { en: 'Cheated', ar: 'غش' },
  selectHwColumn: { en: 'Select HW Column', ar: 'اختر عمود الواجب' },
  enterFinishTime: { en: 'Enter Finish Time', ar: 'أدخل وقت الانتهاء' },
  enterQuizMark: { en: 'Enter Quiz Mark', ar: 'أدخل درجة الكويز' },
  updateSession: { en: 'Update Session', ar: 'تحديث الحصة' },
  marks: { en: 'marks', ar: 'درجة' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      <div dir={dir} className={language === 'ar' ? 'font-arabic' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
