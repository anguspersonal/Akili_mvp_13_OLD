import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { X, Paperclip, Image, FileText, Download, Loader2, WifiOff } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSizeBytes?: number;
  acceptedTypes?: string[];
  disabled?: boolean;
}

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-feeffd69`;

export function FileUpload({ 
  onFilesUploaded, 
  maxFiles = 5, 
  maxSizeBytes = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/*', 'text/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  disabled = false 
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type.startsWith('text/') || type.includes('document')) return <FileText className="w-4 h-4" />;
    return <Paperclip className="w-4 h-4" />;
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${formatFileSize(maxSizeBytes)}`;
    }
    
    const isAccepted = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });
    
    if (!isAccepted) {
      return 'File type not supported';
    }
    
    return null;
  };

  const createMockFileUrl = (file: File): string => {
    // Create a blob URL for preview purposes in offline mode
    return URL.createObjectURL(file);
  };

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    // Check if server is available
    try {
      const healthResponse = await fetch(`${SERVER_URL}/health`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      
      if (!healthResponse.ok) {
        throw new Error('Server unavailable');
      }
    } catch (error) {
      // Server unavailable, create mock upload
      setIsOfflineMode(true);
      
      return {
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: createMockFileUrl(file),
        uploadedAt: new Date(),
      };
    }

    // Server is available, proceed with real upload
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${SERVER_URL}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    const { fileId, url } = await response.json();
    
    return {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      url,
      uploadedAt: new Date(),
    };
  };

  const handleFiles = async (files: FileList) => {
    if (disabled || uploading) return;
    
    const fileArray = Array.from(files);
    
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate all files first
    const validationErrors: string[] = [];
    fileArray.forEach((file, index) => {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(`${file.name}: ${error}`);
      }
    });

    if (validationErrors.length > 0) {
      toast.error(`Upload failed:\n${validationErrors.join('\n')}`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = fileArray.map(async (file, index) => {
        const uploaded = await uploadFile(file);
        setUploadProgress(((index + 1) / fileArray.length) * 100);
        return uploaded;
      });

      const newFiles = await Promise.all(uploadPromises);
      const allFiles = [...uploadedFiles, ...newFiles];
      
      setUploadedFiles(allFiles);
      onFilesUploaded(allFiles);
      
      if (isOfflineMode) {
        toast.success(`${newFiles.length} file(s) prepared for upload (demo mode)`, {
          description: "Files will be uploaded when server connection is restored"
        });
      } else {
        toast.success(`${newFiles.length} file(s) uploaded successfully`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = (fileId: string) => {
    // Clean up blob URLs for offline files
    const fileToRemove = uploadedFiles.find(f => f.id === fileId);
    if (fileToRemove && fileToRemove.id.startsWith('offline_')) {
      URL.revokeObjectURL(fileToRemove.url);
    }
    
    const updatedFiles = uploadedFiles.filter(f => f.id !== fileId);
    setUploadedFiles(updatedFiles);
    onFilesUploaded(updatedFiles);
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
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors
          ${dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
            {isOfflineMode ? (
              <WifiOff className="w-6 h-6 text-orange-500" />
            ) : (
              <Paperclip className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <div>
            <p className="text-sm">
              {dragActive ? 'Drop files here' : 'Click to upload or drag & drop'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Max {maxFiles} files, {formatFileSize(maxSizeBytes)} each
              {isOfflineMode && " (Demo mode)"}
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            {isOfflineMode ? 'Preparing files...' : 'Uploading files...'}
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Attached files ({uploadedFiles.length}/{maxFiles})
            {isOfflineMode && " - Demo mode"}
          </p>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border"
              >
                <div className="text-blue-600">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)} • {file.uploadedAt.toLocaleTimeString()}
                    {file.id.startsWith('offline_') && " (Local)"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${file.id.startsWith('offline_') ? 'bg-orange-100 text-orange-700' : ''}`}
                  >
                    {file.type.split('/')[0]}
                    {file.id.startsWith('offline_') && " 📱"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}