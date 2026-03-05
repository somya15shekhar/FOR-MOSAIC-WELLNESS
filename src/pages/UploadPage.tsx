import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  X,
  CheckCircle,
  AlertTriangle,
  Loader2,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

import { API_URL } from '@/config';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: any;
  error?: string;
}

export default function UploadPage() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
    e.target.value = ''; // Reset input
  }, []);

  const handleFiles = (files: File[]) => {
    files.forEach((file) => {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: Invalid file type. Only PDF, PNG, JPG, and WEBP are allowed.`);
        return;
      }

      // Validate file size
      if (file.size > maxSize) {
        toast.error(`${file.name}: File too large. Maximum size is 10MB.`);
        return;
      }

      const fileId = Math.random().toString(36).substring(7);
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0,
      };

      setUploadedFiles((prev) => [newFile, ...prev]);
      uploadFile(file, fileId);
    });
  };

  const uploadFile = async (file: File, fileId: string) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId && f.progress < 90
              ? { ...f, progress: f.progress + 10 }
              : f
          )
        );
      }, 200);

      const response = await fetch(`${API_URL}/invoices/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      clearInterval(progressInterval);

      const data = await response.json();

      if (response.ok) {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, status: 'completed', progress: 100, result: data }
              : f
          )
        );
        toast.success(`${file.name} processed successfully!`);
      } else {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, status: 'error', progress: 0, error: data.error }
              : f
          )
        );
        toast.error(data.error || `Failed to process ${file.name}`);
      }
    } catch (error) {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: 'error', progress: 0, error: 'Network error' }
            : f
        )
      );
      toast.error(`Network error while uploading ${file.name}`);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type === 'application/pdf') return <FileText className="w-5 h-5 text-[#EF4444]" />;
    return <ImageIcon className="w-5 h-5 text-[#2F8E92]" />;
  };

  return (
    <div className="min-h-screen bg-[#F6F7FA]">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

      <main
        className={`transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}
      >
        {/* Header */}
        <header className="h-16 bg-white border-b border-[rgba(11,13,16,0.12)] flex items-center justify-between px-6 sticky top-0 z-30">
          <div>
            <h1 className="text-xl font-display font-semibold text-[#0B0D10]">Upload Invoices</h1>
            <p className="text-xs text-[#6B7280]">Drag and drop or select files to audit</p>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 max-w-4xl mx-auto">
          {/* Upload Zone */}
          <Card className="mb-6">
            <CardContent className="p-0">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`dropzone ${isDragOver ? 'dragover' : ''}`}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragOver ? 'bg-[rgba(47,142,146,0.15)]' : 'bg-[rgba(47,142,146,0.08)]'
                    }`}>
                    <Upload className={`w-8 h-8 ${isDragOver ? 'text-[#2F8E92]' : 'text-[#6B7280]'}`} />
                  </div>
                  <p className="text-lg font-medium text-[#0B0D10] mb-2">
                    {isDragOver ? 'Drop files here' : 'Drag & drop your invoices'}
                  </p>
                  <p className="text-sm text-[#6B7280] mb-4">
                    or click to browse files
                  </p>
                  <label className="btn-primary cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      multiple
                      onChange={handleFileInput}
                      className="hidden"
                    />
                    Select Files
                  </label>
                  <p className="text-xs text-[#9CA3AF] mt-4">
                    Supported: PDF, PNG, JPG, WEBP (max 10MB each)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Guidelines */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-[rgba(11,13,16,0.08)]">
              <div className="w-8 h-8 bg-[rgba(47,142,146,0.1)] rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-[#2F8E92]" />
              </div>
              <div>
                <p className="font-medium text-sm text-[#0B0D10]">PDF Support</p>
                <p className="text-xs text-[#6B7280]">Multi-page invoices are fully supported</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-[rgba(11,13,16,0.08)]">
              <div className="w-8 h-8 bg-[rgba(16,185,129,0.1)] rounded-lg flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-4 h-4 text-[#10B981]" />
              </div>
              <div>
                <p className="font-medium text-sm text-[#0B0D10]">Image OCR</p>
                <p className="text-xs text-[#6B7280]">Scanned invoices are processed with AI</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-[rgba(11,13,16,0.08)]">
              <div className="w-8 h-8 bg-[rgba(245,158,11,0.1)] rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <div>
                <p className="font-medium text-sm text-[#0B0D10]">Auto-Detection</p>
                <p className="text-xs text-[#6B7280]">Overcharges, duplicates & errors flagged</p>
              </div>
            </div>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-display font-semibold text-[#0B0D10] mb-4">
                  Uploaded Files
                </h3>
                <div className="space-y-4">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-4 p-4 bg-[rgba(11,13,16,0.02)] rounded-xl"
                    >
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        {getFileIcon(file.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm text-[#0B0D10] truncate">
                            {file.name}
                          </p>
                          {file.status === 'completed' && (
                            <CheckCircle className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                          )}
                          {file.status === 'error' && (
                            <AlertTriangle className="w-4 h-4 text-[#EF4444] flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-[#6B7280]">
                          {formatFileSize(file.size)}
                        </p>

                        {file.status === 'uploading' && (
                          <div className="mt-2">
                            <Progress value={file.progress} className="h-1.5" />
                          </div>
                        )}

                        {file.status === 'processing' && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-[#2F8E92]">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Processing with AI...
                          </div>
                        )}

                        {file.status === 'completed' && file.result && (
                          <div className="mt-2">
                            <div className="flex items-center gap-4 text-xs">
                              <span className="text-[#6B7280]">
                                Vendor: {file.result.invoice.vendor_name}
                              </span>
                              <span className="text-[#6B7280]">
                                Amount: ₹{file.result.invoice.total_amount?.toLocaleString()}
                              </span>
                              {file.result.audit.issue_count > 0 ? (
                                <span className="badge badge-warning text-xs">
                                  {file.result.audit.issue_count} issues
                                </span>
                              ) : (
                                <span className="badge badge-success text-xs">Clean</span>
                              )}
                            </div>
                            {file.result.audit.issues && file.result.audit.issues.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {file.result.audit.issues.map((issue: any, idx: number) => {
                                  const severityColors: Record<string, string> = {
                                    CRITICAL: '#EF4444',
                                    HIGH: '#F59E0B',
                                    MEDIUM: '#3B82F6',
                                    LOW: '#6B7280',
                                  };
                                  const color = severityColors[issue.severity] || '#6B7280';
                                  return (
                                    <div
                                      key={idx}
                                      className="rounded-md p-3 text-xs"
                                      style={{
                                        borderLeft: `3px solid ${color}`,
                                        backgroundColor: `${color}0D`,
                                      }}
                                    >
                                      <span
                                        className="font-semibold uppercase tracking-wide"
                                        style={{ color, fontSize: '10px' }}
                                      >
                                        {issue.severity} — {issue.rule.replace(/_/g, ' ')}
                                      </span>
                                      <p className="text-[#374151] mt-1 leading-relaxed">
                                        {issue.explanation || issue.description}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {file.status === 'error' && file.error && (
                          <p className="mt-2 text-xs text-[#EF4444]">
                            {file.error}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-2 text-[#6B7280] hover:text-[#EF4444] hover:bg-[rgba(239,68,68,0.08)] rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {uploadedFiles.some(f => f.status === 'completed') && (
                  <div className="mt-6 flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setUploadedFiles([])}
                    >
                      Clear All
                    </Button>
                    <Button
                      onClick={() => navigate('/reports')}
                      className="bg-[#2F8E92] hover:bg-[#3BA3A7]"
                    >
                      View Reports
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
