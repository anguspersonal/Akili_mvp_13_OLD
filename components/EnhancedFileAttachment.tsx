import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Image, 
  FileText, 
  File, 
  X, 
  Eye, 
  Download, 
  Upload, 
  Camera,
  Paperclip,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  Zap
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner@2.0.3';

interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  previewUrl?: string;
  content?: string;
  analysis?: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress?: number;
}

interface EnhancedFileAttachmentProps {
  files: FileAttachment[];
  onFilesChange: (files: FileAttachment[]) => void;
  onFileSelect?: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  acceptedTypes?: string[];
  disabled?: boolean;
  compact?: boolean;
  showAnalysis?: boolean;
}

export function EnhancedFileAttachment({
  files,
  onFilesChange,
  onFileSelect,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/*', 'text/*', 'application/pdf', '.doc', '.docx'],
  disabled = false,
  compact = false,
  showAnalysis = true
}: EnhancedFileAttachmentProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileAttachment | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string, status: string) => {
    if (status === 'uploading' || status === 'processing') {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    if (status === 'error') {
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
    if (type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    }
    if (type.startsWith('text/') || type.includes('document')) {
      return <FileText className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading': return 'text-blue-500';
      case 'processing': return 'text-yellow-500';
      case 'ready': return 'text-green-500';
      case 'error': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const handleFileSelect = async (selectedFiles: File[]) => {
    if (disabled) return;

    // Validate file count
    if (files.length + selectedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of selectedFiles) {
      if (file.size > maxSize) {
        errors.push(`${file.name}: File too large (max ${formatFileSize(maxSize)})`);
        continue;
      }

      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      if (!isAccepted) {
        errors.push(`${file.name}: File type not supported`);
        continue;
      }

      validFiles.push(file);
    }

    if (errors.length > 0) {
      toast.error(`Upload errors:\n${errors.join('\n')}`);
    }

    if (validFiles.length === 0) return;

    // Create file attachments with uploading status
    const newAttachments: FileAttachment[] = validFiles.map(file => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      status: 'uploading',
      progress: 0
    }));

    // Add to files list
    const updatedFiles = [...files, ...newAttachments];
    onFilesChange(updatedFiles);

    // Process files (simulate upload and analysis)
    for (let i = 0; i < newAttachments.length; i++) {
      const attachment = newAttachments[i];
      const file = validFiles[i];
      
      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 200));
          
          onFilesChange(updatedFiles.map(f => 
            f.id === attachment.id 
              ? { ...f, progress, status: progress === 100 ? 'processing' : 'uploading' }
              : f
          ));
        }

        // Generate preview and extract content
        let previewUrl = attachment.url;
        let content = '';
        let analysis = '';

        if (file.type.startsWith('image/')) {
          previewUrl = attachment.url;
          analysis = `Image file (${file.type.split('/')[1].toUpperCase()}) - ${formatFileSize(file.size)}. Ready for AI vision analysis.`;
        } else if (file.type.startsWith('text/')) {
          content = await file.text();
          analysis = `Text document with ${content.length} characters. Content is ready for analysis.`;
        } else if (file.type === 'application/pdf') {
          analysis = `PDF document (${formatFileSize(file.size)}). Would require PDF parsing service for full text extraction.`;
        } else {
          analysis = `Document file (${file.type}). File uploaded successfully.`;
        }

        // Update with final status
        onFilesChange(updatedFiles.map(f => 
          f.id === attachment.id 
            ? { 
                ...f, 
                status: 'ready',
                progress: 100,
                previewUrl,
                content: content.substring(0, 1000), // Limit content preview
                analysis 
              }
            : f
        ));

      } catch (error) {
        console.error('File processing error:', error);
        onFilesChange(updatedFiles.map(f => 
          f.id === attachment.id 
            ? { ...f, status: 'error', progress: 0 }
            : f
        ));
      }
    }

    // Notify parent component
    onFileSelect?.(validFiles);
    
    if (validFiles.length > 0) {
      toast.success(`${validFiles.length} file(s) attached successfully`);
    }
  };

  const removeFile = (fileId: string) => {
    const fileToRemove = files.find(f => f.id === fileId);
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.url);
      if (fileToRemove.previewUrl && fileToRemove.previewUrl !== fileToRemove.url) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
    }
    
    const updatedFiles = files.filter(f => f.id !== fileId);
    onFilesChange(updatedFiles);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(Array.from(e.target.files));
    }
    e.target.value = '';
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(Array.from(e.dataTransfer.files));
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || files.length >= maxFiles}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        {files.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {files.length}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300
          ${dragActive 
            ? 'border-primary bg-primary/5 scale-105' 
            : 'border-border/50 hover:border-border'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${files.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={() => !disabled && files.length < maxFiles && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || files.length >= maxFiles}
        />
        
        <AnimatePresence mode="wait">
          {dragActive ? (
            <motion.div
              key="drag-active"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 rounded-full akilii-gradient-animated-button flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <p className="font-medium text-primary">Drop files here</p>
                <p className="text-sm text-muted-foreground">
                  Up to {maxFiles} files, {formatFileSize(maxSize)} each
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="drag-inactive"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 rounded-full akilii-glass flex items-center justify-center">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {files.length >= maxFiles 
                    ? 'Maximum files reached' 
                    : 'Click to attach files or drag & drop'
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Images, documents, text files • Max {formatFileSize(maxSize)}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">
                Attached Files ({files.length}/{maxFiles})
              </p>
              
              {files.some(f => f.status === 'ready') && (
                <Badge className="text-xs akilii-gradient-animated-button text-primary-foreground border-0">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ready
                </Badge>
              )}
            </div>
            
            <div className="space-y-2">
              {files.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.1 }}
                  className="akilii-glass p-3 rounded-xl border border-border/30"
                >
                  <div className="flex items-center gap-3">
                    {/* File Icon */}
                    <div className={`flex-shrink-0 ${getStatusColor(file.status)}`}>
                      {getFileIcon(file.type, file.status)}
                    </div>
                    
                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {formatFileSize(file.size)}
                          </Badge>
                          
                          {file.status === 'ready' && showAnalysis && file.analysis && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => setPreviewFile(file)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            onClick={() => removeFile(file.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {file.type.split('/')[0]} • {file.status}
                        </p>
                        
                        {file.status === 'ready' && file.analysis && (
                          <Badge className="text-xs akilii-gradient-accent text-primary-foreground border-0">
                            <Zap className="h-2 w-2 mr-1" />
                            AI Ready
                          </Badge>
                        )}
                      </div>
                      
                      {/* Progress Bar */}
                      {(file.status === 'uploading' || file.status === 'processing') && file.progress !== undefined && (
                        <div className="mt-2">
                          <Progress value={file.progress} className="h-1" />
                        </div>
                      )}
                    </div>
                    
                    {/* Preview Thumbnail */}
                    {file.type.startsWith('image/') && file.previewUrl && (
                      <div className="flex-shrink-0">
                        <img 
                          src={file.previewUrl}
                          alt={file.name}
                          className="w-10 h-10 object-cover rounded-lg border border-border/30"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Preview Dialog */}
      <Dialog open={previewFile !== null} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewFile && getFileIcon(previewFile.type, previewFile.status)}
              {previewFile?.name}
            </DialogTitle>
          </DialogHeader>
          
          {previewFile && (
            <div className="space-y-4">
              {/* Image Preview */}
              {previewFile.type.startsWith('image/') && previewFile.previewUrl && (
                <div className="text-center">
                  <img 
                    src={previewFile.previewUrl}
                    alt={previewFile.name}
                    className="max-w-full max-h-96 object-contain rounded-lg border border-border/30"
                  />
                </div>
              )}
              
              {/* File Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Size:</span> {formatFileSize(previewFile.size)}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {previewFile.type}
                </div>
              </div>
              
              {/* AI Analysis */}
              {previewFile.analysis && (
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    AI Analysis
                  </h4>
                  <p className="text-sm text-muted-foreground p-3 akilii-glass rounded-lg">
                    {previewFile.analysis}
                  </p>
                </div>
              )}
              
              {/* Text Content Preview */}
              {previewFile.content && (
                <div className="space-y-2">
                  <h4 className="font-medium">Content Preview</h4>
                  <div className="max-h-32 overflow-y-auto p-3 akilii-glass rounded-lg text-xs text-muted-foreground">
                    <pre className="whitespace-pre-wrap">{previewFile.content}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}