import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, Upload, FileSpreadsheet, Users, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import LanguageToggle from './LanguageToggle';
import logo from '@/assets/logo.jpg';

const sheets = ['cam 1', 'cam 2', 'miami west', 'station 1', 'station 2', 'station 3'];

const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { logout } = useAuth();
  const [selectedSheet, setSelectedSheet] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setUploadedFile(file);
        toast.success(`File selected: ${file.name}`);
      } else {
        toast.error('Please upload an Excel file (.xlsx or .xls)');
      }
    }
  };

  const handleUpload = () => {
    if (!uploadedFile) {
      toast.error('Please select a file first');
      return;
    }
    if (!selectedSheet) {
      toast.error('Please select a sheet');
      return;
    }
    
    // Simulate upload
    toast.success(`Uploaded ${uploadedFile.name} to ${selectedSheet}`);
    setUploadedFile(null);
    setSelectedSheet('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
              <p className="text-sm text-muted-foreground">{t('adminPanel')}</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">6</p>
              <p className="text-sm text-muted-foreground">Sheets</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">124</p>
              <p className="text-sm text-muted-foreground">Students</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">8</p>
              <p className="text-sm text-muted-foreground">{t('sessions')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="glass-card p-6 glow-border animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          {t('uploadExcel')}
        </h2>

        <div className="space-y-6">
          {/* Sheet Selection */}
          <div className="space-y-2">
            <Label className="text-foreground">{t('selectSheet')}</Label>
            <Select value={selectedSheet} onValueChange={setSelectedSheet}>
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue placeholder={t('selectSheet')} />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {sheets.map((sheet) => (
                  <SelectItem key={sheet} value={sheet} className="capitalize">
                    {sheet}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label className="text-foreground">Excel File</Label>
            <div 
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <FileSpreadsheet className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              {uploadedFile ? (
                <p className="text-foreground font-medium">{uploadedFile.name}</p>
              ) : (
                <p className="text-muted-foreground">Click to select Excel file</p>
              )}
            </div>
          </div>

          {/* Upload Button */}
          <Button 
            onClick={handleUpload}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            disabled={!uploadedFile || !selectedSheet}
          >
            <Upload className="w-4 h-4" />
            {t('uploadExcel')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
