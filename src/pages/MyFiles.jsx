import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { File, Download, Link as LinkIcon, Trash2 } from 'lucide-react';
import ShareModal from '../components/ShareModal';
import { useAuth } from '../context/AuthContext';

const MyFiles = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharingFile, setSharingFile] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchFiles();
  }, [user]);

  const fetchFiles = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (file) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('file-uploads')
        .remove([file.storage_path]);
        
      if (storageError) throw storageError;

      // Delete from DB
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      setFiles(files.filter(f => f.id !== file.id));
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file.');
    }
  };

  const handleDownload = async (file) => {
    // Increment download count
    try {
      await supabase
        .from('files')
        .update({ download_count: (file.download_count || 0) + 1 })
        .eq('id', file.id);
      
      window.open(file.file_url, '_blank');
      fetchFiles(); // Refresh count
    } catch (error) {
      console.error('Error updating download count', error);
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="my-files">
        <h1>My Files</h1>
        <p>Loading your files...</p>
      </div>
    );
  }

  return (
    <div className="my-files">
      <h1>My Files</h1>
      <p>Manage all your uploaded files.</p>

      {files.length === 0 ? (
        <div className="empty-state">
          <File size={48} />
          <h3>No files yet</h3>
          <p>Upload some files to see them here.</p>
        </div>
      ) : (
        <div className="files-grid">
          {files.map((file) => (
            <div key={file.id} className="file-card">
              <div className="file-icon">
                <File size={32} />
              </div>
              <div className="file-info">
                <h3 title={file.file_name}>{file.file_name}</h3>
                <div className="file-meta">
                  <span>{formatSize(file.file_size)}</span>
                  <span>•</span>
                  <span>{formatDate(file.created_at)}</span>
                  <span>•</span>
                  <span>{file.download_count || 0} DLs</span>
                </div>
              </div>
              <div className="file-actions">
                <button className="action-btn" title="Download" onClick={() => handleDownload(file)}>
                  <Download size={18} />
                </button>
                <button className="action-btn" title="Share" onClick={() => setSharingFile(file)}>
                  <LinkIcon size={18} />
                </button>
                <button className="action-btn danger" title="Delete" onClick={() => handleDelete(file)}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {sharingFile && (
        <ShareModal 
          file={sharingFile} 
          onClose={() => setSharingFile(null)} 
        />
      )}
    </div>
  );
};

export default MyFiles;
