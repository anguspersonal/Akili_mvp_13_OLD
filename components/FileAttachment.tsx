import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Card, CardContent } from "./ui/card";
import { 
  Paperclip, 
  Upload, 
  X, 
  File, 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet,
  FileCode,
  Camera,
  Download,
  Eye,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Zap
} from "lucide-react";

interface AttachedFile {
  id: string;
  file: File;
  type: 'image' | 'document' | 'pdf' | 'spreadsheet' | 'code' | 'other';
  url: string;
  uploadProgress: number;
  uploaded: boolean;
  error?: string;
  preview?: string;
}

interface FileAttachmentProps {
  onFilesChange: (files: AttachedFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
}

export function FileAttachment({ 
  onFilesChange, 
  maxFiles = 10, 
  maxFileSize = 50,
  acceptedTypes = [
    'image/*',
    'application/pdf',
    '.doc,.docx',
    '.xls,.xlsx',
    '.txt,.md',
    '.json,.csv'
  ],
  className = "" 
}: FileAttachmentProps) {
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine file type and icon
  const getFileTypeInfo = (file: File) => {
    const { type, name } = file;
    const extension = name.split('.').pop()?.toLowerCase() || '';

    if (type.startsWith('image/')) {
      return { type: 'image' as const, icon: ImageIcon, color: 'from-green-500 to-emerald-500' };
    }
    
    if (type === 'application/pdf' || extension === 'pdf') {
      return { type: 'pdf' as const, icon: FileText, color: 'from-red-500 to-pink-500' };
    }
    
    if (type.includes('spreadsheet') || ['xls', 'xlsx', 'csv'].includes(extension)) {
      return { type: 'spreadsheet' as const, icon: FileSpreadsheet, color: 'from-green-600 to-green-500' };
    }
    
    if (['txt', 'md', 'doc', 'docx'].includes(extension)) {
      return { type: 'document' as const, icon: FileText, color: 'from-blue-500 to-cyan-500' };
    }
    
    if (['json', 'js', 'tsx', 'jsx', 'py', 'html', 'css'].includes(extension)) {
      return { type: 'code' as const, icon: FileCode, color: 'from-purple-500 to-indigo-500' };
    }
    
    return { type: 'other' as const, icon: File, color: 'from-gray-500 to-gray-400' };
  };

  // Create file preview for images
  const createPreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  // Simulate file upload with progress
  const simulateUpload = (fileId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 25;
        
        setAttachedFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, uploadProgress: Math.min(progress, 100) } : f
        ));

        if (progress >= 100) {
          clearInterval(interval);
          
          // Random chance of success/failure for demo
          if (Math.random() > 0.1) {
            setAttachedFiles(prev => prev.map(f => 
              f.id === fileId ? { ...f, uploaded: true, uploadProgress: 100 } : f
            ));
            resolve();
          } else {
            setAttachedFiles(prev => prev.map(f => 
              f.id === fileId ? { ...f, error: "Upload failed", uploadProgress: 0 } : f
            ));
            reject(new Error("Upload failed"));
          }
        }
      }, 200);
    });
  };

  // Process and add files
  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Validate file count
    if (attachedFiles.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setIsUploading(true);

    const newFiles: AttachedFile[] = [];

    for (const file of fileArray) {
      // Validate file size
      if (file.size > maxFileSize * 1024 * 1024) {
        alert(`File "${file.name}" exceeds ${maxFileSize}MB limit`);
        continue;
      }

      const fileInfo = getFileTypeInfo(file);
      const preview = await createPreview(file);
      
      const attachedFile: AttachedFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        type: fileInfo.type,
        url: URL.createObjectURL(file),
        uploadProgress: 0,
        uploaded: false,
        preview
      };

      newFiles.push(attachedFile);
    }

    const updatedFiles = [...attachedFiles, ...newFiles];
    setAttachedFiles(updatedFiles);
    onFilesChange(updatedFiles);

    // Start uploads
    const uploadPromises = newFiles.map(file => simulateUpload(file.id));
    
    try {
      await Promise.allSettled(uploadPromises);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [attachedFiles.length, maxFiles, maxFileSize]);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [attachedFiles.length, maxFiles, maxFileSize]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Remove file
  const removeFile = (fileId: string) => {
    const updatedFiles = attachedFiles.filter(f => f.id !== fileId);
    setAttachedFiles(updatedFiles);
    onFilesChange(updatedFiles);
    
    // Cleanup object URL
    const file = attachedFiles.find(f => f.id === fileId);
    if (file) {
      URL.revokeObjectURL(file.url);
    }
  };

  // Open file picker
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Area */}
      <motion.div
        className={`
          relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 cursor-pointer
          ${isDragging 
            ? "border-blue-400 bg-blue-500/10 scale-105" 
            : "border-white/30 hover:border-white/50 hover:bg-white/5"
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFilePicker}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="text-center">
          <motion.div
            animate={isDragging ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0 }}
            className="w-16 h-16 mx-auto mb-4 akilii-gradient-accent rounded-full flex items-center justify-center"
          >
            {isDragging ? (
              <Download className="h-8 w-8 text-white" />
            ) : (
              <Upload className="h-8 w-8 text-white" />
            )}
          </motion.div>
          
          <h3 className="text-white font-medium mb-2 text-fit">
            {isDragging ? "Drop files here" : "Upload files"}
          </h3>
          
          <p className="text-white/60 text-fit-sm mb-4">
            Drag & drop files or click to browse
          </p>
          
          <div className="flex items-center justify-center gap-4 text-xs text-white/50">
            <span>Max {maxFiles} files</span>
            <span>•</span>
            <span>Up to {maxFileSize}MB each</span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex justify-center gap-2 mt-4">
          <Button
            size="sm"
            variant="ghost"
            className="text-white/60 hover:text-white btn-responsive"
            onClick={(e) => {
              e.stopPropagation();
              // Trigger camera on mobile devices
              const input = fileInputRef.current;
              if (input) {
                input.accept = "image/*";
                input.capture = "environment" as any;
                input.click();
                setTimeout(() => {
                  input.accept = acceptedTypes.join(',');
                  input.removeAttribute('capture');
                }, 100);
              }
            }}
          >
            <Camera className="h-4 w-4 mr-2" />
            Camera
          </Button>
        </div>
      </motion.div>

      {/* Attached Files List */}
      <AnimatePresence>
        {attachedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-white font-medium text-fit">
                Attached Files ({attachedFiles.length})
              </h4>
              
              {isUploading && (
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 badge-text-fit">
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Uploading...
                </Badge>
              )}
            </div>

            <div className="grid gap-3">
              {attachedFiles.map((file) => {
                const fileInfo = getFileTypeInfo(file.file);
                const FileIcon = fileInfo.icon;

                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    layout
                  >
                    <Card className="akilii-glass border-white/20">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          
                          {/* File Preview/Icon */}
                          <div className="relative flex-shrink-0">
                            {file.preview ? (
                              <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/20">
                                <img 
                                  src={file.preview} 
                                  alt={file.file.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${fileInfo.color} flex items-center justify-center`}>
                                <FileIcon className="h-6 w-6 text-white" />
                              </div>
                            )}
                            
                            {/* Status Indicator */}
                            <div className="absolute -top-1 -right-1">
                              {file.uploaded ? (
                                <CheckCircle className="h-4 w-4 text-green-400" />
                              ) : file.error ? (
                                <AlertCircle className="h-4 w-4 text-red-400" />
                              ) : (
                                <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                              )}
                            </div>
                          </div>

                          {/* File Info */}
                          <div className="flex-1 min-w-0">
                            <h5 className="text-white font-medium text-fit-sm truncate">
                              {file.file.name}
                            </h5>
                            <p className="text-white/60 text-xs">
                              {formatFileSize(file.file.size)} • {file.file.type || 'Unknown type'}
                            </p>
                            
                            {/* Upload Progress */}
                            {!file.uploaded && !file.error && (
                              <div className="mt-2">
                                <Progress 
                                  value={file.uploadProgress} 
                                  className="h-1 bg-white/10"
                                />
                                <span className="text-xs text-white/50">
                                  {Math.round(file.uploadProgress)}%
                                </span>
                              </div>
                            )}
                            
                            {/* Error Message */}
                            {file.error && (
                              <p className="text-red-300 text-xs mt-1">{file.error}</p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {file.preview && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-white/60 hover:text-white w-8 h-8 p-0"
                                onClick={() => window.open(file.preview, '_blank')}
                                title="Preview file"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-white/60 hover:text-red-400 w-8 h-8 p-0"
                              onClick={() => removeFile(file.id)}
                              title="Remove file"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}