import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Download, Lock, AlertCircle } from 'lucide-react';

const DownloadFile = () => {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchFileDetails();
  }, [id]);

  const fetchFileDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('files')
        .select('id, file_name, file_size, expiry_date, password_hash, file_url, download_count')
        .eq('id', id)
        .single();

      if (error) throw error;
      setFile(data);
    } catch (err) {
      console.error(err);
      setError('File not found or has been deleted.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (e) => {
    if (e) e.preventDefault();
    
    // Check expiry
    if (file.expiry_date && new Date(file.expiry_date) < new Date()) {
      setError('This link has expired.');
      return;
    }

    // Check password if exists
    if (file.password_hash) {
      if (!password) {
        setPasswordError('Password is required');
        return;
      }
      // Extremely basic client-side check just for demo.
      // In production, NEVER send password_hash to client. Validate on server.
      if (btoa(password) !== file.password_hash) {
        setPasswordError('Incorrect password');
        return;
      }
    }

    setPasswordError('');
    setDownloading(true);

    try {
      // Increment download count
      await supabase
        .from('files')
        .update({ download_count: (file.download_count || 0) + 1 })
        .eq('id', file.id);

      // Trigger download
      window.open(file.file_url, '_blank');
    } catch (err) {
      console.error(err);
      setError('Failed to download file.');
    } finally {
      setDownloading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return <div className="download-page">Loading...</div>;
  }

  if (error) {
    return (
      <div className="download-page">
        <div className="download-card error">
          <AlertCircle size={48} />
          <h2>Oops!</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const isExpired = file.expiry_date && new Date(file.expiry_date) < new Date();

  return (
    <div className="download-page">
      <div className="download-card">
        <div className="file-icon large">
          <Download size={48} />
        </div>
        
        <h2>{file.file_name}</h2>
        <p className="file-size">{formatSize(file.file_size)}</p>

        {isExpired ? (
          <div className="expired-message">
            <AlertCircle size={20} />
            <span>This secure link has expired.</span>
          </div>
        ) : (
          <form onSubmit={handleDownload} className="download-form">
            {file.password_hash && (
              <div className="password-prompt">
                <label>
                  <Lock size={16} />
                  This file is password protected
                </label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={passwordError ? 'input-error' : ''}
                />
                {passwordError && <span className="error-text">{passwordError}</span>}
              </div>
            )}

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={downloading}
            >
              {downloading ? 'Downloading...' : 'Download File'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default DownloadFile;
