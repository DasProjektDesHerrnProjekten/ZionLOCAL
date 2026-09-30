import { useState, useEffect } from 'react';
import { Upload, Download, Trash2, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface ApkFile {
  id: string;
  filename: string;
  original_name: string;
  file_size: number;
  uploaded_at: string;
  uploaded_by: string;
  download_url: string;
}

const ZionianPlusPage = () => {
  useDocumentTitle('ELYONPLUS - APK Management');
  const { admin } = useAdminAuth();

  const [apkFiles, setApkFiles] = useState<ApkFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchApkFiles();
  }, []);

  const checkBucketExists = async () => {
    try {
      // Try to list files to check if bucket exists
      const { data, error } = await supabase.storage
        .from('elyonplus-uploads')
        .list('', { limit: 1 });

      if (error && error.message.includes('not found')) {
        return false;
      }
      return !error;
    } catch (error) {
      return false;
    }
  };

  const fetchApkFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if bucket exists first
      const bucketExists = await checkBucketExists();
      if (!bucketExists) {
        setError('ELYONPLUS storage bucket not found. Please contact your administrator to create the "elyonplus-uploads" bucket in Supabase Storage.');
        setApkFiles([]);
        return;
      }

      // Get list of files from Supabase storage
      const { data: files, error: storageError } = await supabase.storage
        .from('elyonplus-uploads')
        .list('', {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (storageError) {
        console.error('Error fetching APK files:', storageError);
        setError('Failed to load APK files');
        return;
      }

      // Convert storage files to our format
      const apkFilesData: ApkFile[] = files
        .filter(file => file.name.endsWith('.apk'))
        .map(file => ({
          id: file.id || file.name,
          filename: file.name,
          original_name: file.name,
          file_size: file.metadata?.size || 0,
          uploaded_at: file.created_at || new Date().toISOString(),
          uploaded_by: admin?.name || 'Unknown',
          download_url: supabase.storage
            .from('elyonplus-uploads')
            .getPublicUrl(file.name).data.publicUrl
        }));

      setApkFiles(apkFilesData);
    } catch (err) {
      console.error('Error in fetchApkFiles:', err);
      setError('Failed to load APK files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.apk')) {
      alert('Only .APK files are allowed');
      return;
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      alert('File size must be less than 100MB');
      return;
    }

    // Check if bucket exists
    const bucketExists = await checkBucketExists();
    if (!bucketExists) {
      alert('ELYONPLUS storage bucket not found. Please contact your administrator to create the "elyonplus-uploads" bucket in Supabase Storage.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      // Upload file to Supabase storage
      const fileName = `${Date.now()}_${file.name}`;

      // Create a new File object with the correct MIME type
      const apkFile = new File([file], file.name, {
        type: 'application/vnd.android.package-archive'
      });

      const { data, error: uploadError } = await supabase.storage
        .from('elyonplus-uploads')
        .upload(fileName, apkFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        setError('Failed to upload APK file');
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('elyonplus-uploads')
        .getPublicUrl(fileName);

      // Add to our files list
      const newApkFile: ApkFile = {
        id: data.path,
        filename: data.path,
        original_name: file.name,
        file_size: file.size,
        uploaded_at: new Date().toISOString(),
        uploaded_by: admin?.name || 'Unknown',
        download_url: urlData.publicUrl
      };

      setApkFiles(prev => [newApkFile, ...prev]);
      alert(`✅ ${file.name} uploaded successfully!`);

      // Clear the input
      event.target.value = '';

    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload APK file');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteFile = async (apkFile: ApkFile) => {
    if (!confirm(`Are you sure you want to delete "${apkFile.original_name}"?`)) {
      return;
    }

    // Check if bucket exists
    const bucketExists = await checkBucketExists();
    if (!bucketExists) {
      alert('ELYONPLUS storage bucket not found. Please contact your administrator.');
      return;
    }

    try {
      const { error: deleteError } = await supabase.storage
        .from('elyonplus-uploads')
        .remove([apkFile.filename]);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        alert('Failed to delete APK file');
        return;
      }

      // Remove from our list
      setApkFiles(prev => prev.filter(f => f.id !== apkFile.id));
      alert(`✅ ${apkFile.original_name} deleted successfully!`);

    } catch (err) {
      console.error('Error deleting file:', err);
      alert('Failed to delete APK file');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading APK files...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ELYONPLUS - APK Management</h1>
          <p className="text-muted-foreground">Upload and manage APK files for student downloads</p>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Upload className="h-5 w-5 text-primary mr-2" />
          Upload New APK
        </h2>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
            <Upload size={16} />
            <span>Choose APK File</span>
            <input
              type="file"
              accept=".apk"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>

          {isUploading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
              <span>Uploading... {uploadProgress}%</span>
            </div>
          )}
        </div>

        <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Requirements:</strong> Only .APK files allowed, maximum size 100MB
          </p>
        </div>
      </div>

      {/* Files List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground flex items-center">
            <FileText className="h-5 w-5 text-primary mr-2" />
            Available APK Files ({apkFiles.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          {apkFiles.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No APK files uploaded yet</p>
              <p className="text-sm mt-1">Upload your first APK file above</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-secondary/50 border-b border-border">
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">File Name</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Size</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Uploaded</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">By</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apkFiles.map((apkFile, index) => (
                  <tr
                    key={apkFile.id}
                    className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">{apkFile.original_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatFileSize(apkFile.file_size)}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatDate(apkFile.uploaded_at)}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {apkFile.uploaded_by}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={apkFile.download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1 bg-success/10 text-success rounded hover:bg-success/20 transition-colors"
                        >
                          <Download size={14} />
                          <span className="text-sm">Download</span>
                        </a>
                        <button
                          onClick={() => handleDeleteFile(apkFile)}
                          className="flex items-center gap-1 px-3 py-1 bg-destructive/10 text-destructive rounded hover:bg-destructive/20 transition-colors"
                        >
                          <Trash2 size={14} />
                          <span className="text-sm">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZionianPlusPage;
