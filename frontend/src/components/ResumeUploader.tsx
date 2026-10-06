import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

interface ParsedResumeData {
  skills: string;
  completedCourseworks: string;
  projects: string;
  bio: string;
}

interface ResumeUploaderProps {
  onProfileAutoFill: (data: ParsedResumeData) => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onProfileAutoFill }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && !file.type.includes('text')) {
      setError('Please upload a PDF or plain text resume.');
      return;
    }

    setFileName(file.name);
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Call Python AI Resume Parser API directly
      const response = await axios.post<ParsedResumeData>('http://localhost:5000/api/parse-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data) {
        onProfileAutoFill(response.data);
        setSuccess(true);
      }
    } catch (err: any) {
      console.error('Resume parsing failed:', err);
      setError('Failed to parse resume automatically. You can fill details manually.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-xl p-6 bg-gradient-to-br from-indigo-50/50 to-white text-center transition cursor-pointer relative group">
      <input
        type="file"
        accept=".pdf,.txt"
        onChange={handleFileUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center group-hover:scale-110 transition">
          {loading ? (
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          ) : success ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          ) : (
            <UploadCloud className="w-6 h-6 text-indigo-600" />
          )}
        </div>

        <div>
          <h4 className="text-sm font-bold text-gray-900">
            {loading ? 'AI Parsing Resume...' : success ? `Resume Parsed: ${fileName}` : 'Upload Resume PDF to Auto-Fill Profile'}
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            AI automatically extracts your Skills, Projects, Coursework & Bio.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </div>
        )}

        {success && (
          <div className="text-xs font-semibold text-emerald-600 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200">
            ✓ Profile fields auto-populated by AI!
          </div>
        )}
      </div>
    </div>
  );
};
