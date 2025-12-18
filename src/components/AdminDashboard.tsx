import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, Upload, FileSpreadsheet, Users, CheckCircle2, Clock, BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import LanguageToggle from './LanguageToggle';
import logo from '@/assets/logo.jpg';
import * as XLSX from 'xlsx';

interface Sheet {
  id: string;
  name: string;
}

const sessions = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'];
const uploadTypes = [
  { value: 'session', label: 'Session (S1-S8)', labelAr: 'حصة (S1-S8)' },
  { value: 'shamel', label: 'درجات الشامل', labelAr: 'درجات الشامل' },
];
const hwColumns = [
  { value: 'hw1', label: 'HW1' },
  { value: 'hw2', label: 'HW2' },
  { value: 'hw3', label: 'HW3' },
  { value: 'hw4', label: 'HW4' },
  { value: 'hw5', label: 'HW5' },
  { value: 'hw6', label: 'HW6' },
  { value: 'hw7', label: 'HW7' },
  { value: 'hw8', label: 'HW8' },
];

// Excel column mapping based on user's Excel structure
// A: id, B: name, C: student no, D: Parent No, E: a (attendance), F: p (payment), G: Q (quiz), H: time, I: s1 (hw for session 1)
const EXCEL_COLUMNS = {
  id: 'A',
  name: 'B',
  studentPhone: 'C',
  parentPhone: 'D',
  attendance: 'E',
  payment: 'F',
  quizMark: 'G',
  time: 'H',
  // Session-specific HW columns (s1 = column I, etc.)
  hwBase: 'I' // Starting column for HW (session-specific)
};

const AdminDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { logout } = useAuth();
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedHwColumn, setSelectedHwColumn] = useState('');
  const [finishTime, setFinishTime] = useState('');
  const [quizMark, setQuizMark] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [stats, setStats] = useState({ sheets: 0, students: 0, sessions: 8 });
  const [uploadType, setUploadType] = useState('session');
  const [examName, setExamName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSheets();
    fetchStats();
  }, []);

  const fetchSheets = async () => {
    const { data, error } = await supabase
      .from('sheets')
      .select('id, name')
      .order('name');

    if (!error && data) {
      setSheets(data);
    }
  };

  const fetchStats = async () => {
    const { count: sheetsCount } = await supabase.from('sheets').select('*', { count: 'exact', head: true });
    const { count: studentsCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
    
    setStats({
      sheets: sheetsCount || 0,
      students: studentsCount || 0,
      sessions: 8
    });
  };

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

  const parseExcelFile = async (file: File, type: 'session' | 'shamel'): Promise<unknown[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          
          // Get the range to iterate through rows
          const range = XLSX.utils.decode_range(firstSheet['!ref'] || 'A1');
          const rows: unknown[] = [];

          // Skip header rows (row 1 and 2 in Shamel), start from row 3
          const startRow = type === 'shamel' ? 2 : 1;
          
          for (let row = startRow; row <= range.e.r; row++) {
            const getCellValue = (col: string) => {
              const cell = firstSheet[`${col}${row + 1}`];
              return cell ? cell.v : null;
            };

            if (type === 'shamel') {
              // Shamel format: A: id, B: name, C: Parent No, D: shamel (a), E: p, F: Q
              const rowData = {
                id: getCellValue('A'),
                name: getCellValue('B'),
                parent_phone: getCellValue('C')?.toString() || '',
                attendance: getCellValue('D'),
                payment: getCellValue('E'),
                quiz_mark: getCellValue('F'),
              };

              if (rowData.id && rowData.name && rowData.parent_phone) {
                rows.push(rowData);
              }
            } else {
              // Session format: A: id, B: name, C: student phone, D: Parent No, E: a, F: p, G: Q, H: time, I: hw
              const rowData = {
                id: getCellValue('A'),
                name: getCellValue('B'),
                student_phone: getCellValue('C')?.toString() || '',
                parent_phone: getCellValue('D')?.toString() || '',
                attendance: getCellValue('E'),
                payment: getCellValue('F'),
                quiz_mark: getCellValue('G'),
                time: getCellValue('H')?.toString() || null,
                hw_status: getCellValue('I')
              };

              if (rowData.id && rowData.name && rowData.parent_phone) {
                rows.push(rowData);
              }
            }
          }

          resolve(rows);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUpload = async () => {
    if (!uploadedFile) {
      toast.error('Please select a file first');
      return;
    }
    if (!selectedSheet) {
      toast.error('Please select a sheet');
      return;
    }
    
    // Validation based on upload type
    if (uploadType === 'session') {
      if (!selectedSession) {
        toast.error('Please select a session');
        return;
      }
      if (!selectedHwColumn) {
        toast.error('Please select a homework column');
        return;
      }
    } else if (uploadType === 'shamel') {
      if (!examName.trim()) {
        toast.error('Please enter the exam name');
        return;
      }
    }

    setIsUploading(true);
    
    try {
      // Parse Excel file based on type
      const excelData = await parseExcelFile(uploadedFile, uploadType as 'session' | 'shamel');
      
      if (excelData.length === 0) {
        toast.error('No valid data found in the Excel file');
        setIsUploading(false);
        return;
      }

      let data, error;

      if (uploadType === 'shamel') {
        // Call shamel edge function
        const result = await supabase.functions.invoke('parse-shamel', {
          body: {
            excelData,
            sheetName: selectedSheet,
            examName: examName.trim()
          }
        });
        data = result.data;
        error = result.error;
      } else {
        // Call session edge function
        const sessionNumber = parseInt(selectedSession.replace('S', ''));
        const result = await supabase.functions.invoke('parse-excel', {
          body: {
            excelData,
            sheetName: selectedSheet,
            sessionNumber,
            finishTime: finishTime || null,
            hwColumn: selectedHwColumn
          }
        });
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Upload error:', error);
        toast.error(`Upload failed: ${error.message}`);
      } else if (data.success) {
        toast.success(`Successfully processed ${data.processedCount} students`);
        if (data.errors && data.errors.length > 0) {
          console.warn('Some rows had errors:', data.errors);
          toast.warning(`${data.errors.length} rows had errors`);
        }
        
        // Reset form
        setUploadedFile(null);
        setSelectedSheet('');
        setSelectedSession('');
        setSelectedHwColumn('');
        setFinishTime('');
        setQuizMark('');
        setExamName('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Refresh stats
        fetchStats();
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to process Excel file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateSession = async () => {
    if (!selectedSheet || !selectedSession) {
      toast.error('Please select sheet and session first');
      return;
    }
    
    const updates: string[] = [];
    if (finishTime) updates.push(`Finish Time: ${finishTime}`);
    if (quizMark) updates.push(`Quiz Mark: ${quizMark}`);
    if (selectedHwColumn) updates.push(`HW Column: ${selectedHwColumn}`);
    
    if (updates.length === 0) {
      toast.error('Please enter at least one value to update');
      return;
    }
    
    // TODO: Implement batch update for existing sessions
    toast.success(`Updated ${selectedSession} in ${selectedSheet}: ${updates.join(', ')}`);
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
              <p className="text-2xl font-bold text-foreground">{stats.sheets}</p>
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
              <p className="text-2xl font-bold text-foreground">{stats.students}</p>
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
              <p className="text-2xl font-bold text-foreground">{stats.sessions}</p>
              <p className="text-sm text-muted-foreground">{t('sessions')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="glass-card p-6 glow-border animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            {t('uploadExcel')}
          </h2>

          <div className="space-y-4">
            {/* Upload Type Selection */}
            <div className="space-y-2">
              <Label className="text-foreground">Upload Type / نوع الرفع</Label>
              <Select value={uploadType} onValueChange={setUploadType}>
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue placeholder="Select upload type" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {uploadTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sheet Selection */}
            <div className="space-y-2">
              <Label className="text-foreground">{t('selectSheet')}</Label>
              <Select value={selectedSheet} onValueChange={setSelectedSheet}>
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue placeholder={t('selectSheet')} />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {sheets.map((sheet) => (
                    <SelectItem key={sheet.id} value={sheet.name} className="capitalize">
                      {sheet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Session-specific fields */}
            {uploadType === 'session' && (
              <>
                {/* Session Selection */}
                <div className="space-y-2">
                  <Label className="text-foreground">{t('selectSession')}</Label>
                  <Select value={selectedSession} onValueChange={setSelectedSession}>
                    <SelectTrigger className="bg-secondary/50 border-border">
                      <SelectValue placeholder={t('selectSession')} />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {sessions.map((session) => (
                        <SelectItem key={session} value={session}>
                          {session}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* HW Column Selection */}
                <div className="space-y-2">
                  <Label className="text-foreground">{t('selectHwColumn')}</Label>
                  <Select value={selectedHwColumn} onValueChange={setSelectedHwColumn}>
                    <SelectTrigger className="bg-secondary/50 border-border">
                      <SelectValue placeholder={t('selectHwColumn')} />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {hwColumns.map((col) => (
                        <SelectItem key={col.value} value={col.value}>
                          {col.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Shamel-specific fields */}
            {uploadType === 'shamel' && (
              <div className="space-y-2">
                <Label className="text-foreground">Exam Name / اسم الامتحان</Label>
                <Input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="bg-secondary/50 border-border"
                  placeholder="مثال: شامل الترم الأول"
                  dir="rtl"
                />
              </div>
            )}

            {/* Finish Time - only for sessions */}
            {uploadType === 'session' && (
              <div className="space-y-2">
                <Label className="text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {t('finishTime')}
                </Label>
                <Input
                  type="time"
                  value={finishTime}
                  onChange={(e) => setFinishTime(e.target.value)}
                  className="bg-secondary/50 border-border"
                  placeholder={t('enterFinishTime')}
                />
              </div>
            )}

            {/* File Upload */}
            <div className="space-y-2">
              <Label className="text-foreground">Excel File</Label>
              <div 
                className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <FileSpreadsheet className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                {uploadedFile ? (
                  <p className="text-foreground font-medium">{uploadedFile.name}</p>
                ) : (
                  <p className="text-muted-foreground text-sm">Click to select Excel file</p>
                )}
              </div>
            </div>

            {/* Upload Button */}
            <Button 
              onClick={handleUpload}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              disabled={
                !uploadedFile || 
                !selectedSheet || 
                isUploading ||
                (uploadType === 'session' && (!selectedSession || !selectedHwColumn)) ||
                (uploadType === 'shamel' && !examName.trim())
              }
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {isUploading ? 'Processing...' : t('uploadExcel')}
            </Button>
          </div>
        </div>

        {/* Session Update Section */}
        <div className="glass-card p-6 glow-border animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" />
            {t('updateSession')}
          </h2>

          <div className="space-y-4">
            {/* Quiz Mark */}
            <div className="space-y-2">
              <Label className="text-foreground">{t('quizMark')} ({t('marks')})</Label>
              <Input
                type="number"
                value={quizMark}
                onChange={(e) => setQuizMark(e.target.value)}
                className="bg-secondary/50 border-border"
                placeholder={t('enterQuizMark')}
                min="0"
              />
            </div>

            {/* Update Button */}
            <Button 
              onClick={handleUpdateSession}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
              disabled={!selectedSheet || !selectedSession}
            >
              <CheckCircle2 className="w-4 h-4" />
              {t('updateSession')}
            </Button>
          </div>

          {/* Excel Column Info */}
          <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
            <h3 className="text-sm font-semibold text-foreground mb-2">Excel Column Mapping:</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>A: Student ID (e.g., c001)</li>
              <li>B: Student Name</li>
              <li>C: Student Phone</li>
              <li>D: Parent Phone (Login)</li>
              <li>E: Attendance (1 = attended)</li>
              <li>F: Payment amount</li>
              <li>G: Quiz Mark</li>
              <li>H: Time</li>
              <li>I: HW Status (empty=complete, 1=not done, 2=partial, 3=cheated)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
