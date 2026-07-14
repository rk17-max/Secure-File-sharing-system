import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link as LinkIcon, Clock, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SharedLinks = () => {
  const [sharedFiles, setSharedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchSharedFiles();
  }, [user]);

  const fetchSharedFiles = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id)
        .not('expiry_date', 'is', null)
        .order('expiry_date', { ascending: true });

      if (error) throw error;
      setSharedFiles(data || []);
    } catch (error) {
      console.error('Error fetching shared files:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (fileId) => {
    const link = `${window.location.origin}/download/${fileId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(fileId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  if (loading) {
    return (
      <div className="shared-links">
        <h1>Shared Links</h1>
        <p>Loading your active links...</p>
      </div>
    );
  }

  return (
    <div className="shared-links">
      <h1>Shared Links</h1>
      <p>Manage your active shared links and their permissions.</p>

      {sharedFiles.length === 0 ? (
        <div className="empty-state">
          <LinkIcon size={48} />
          <h3>No shared links</h3>
          <p>Generate a link from the My Files page to share a file.</p>
        </div>
      ) : (
        <div className="links-list">
          {sharedFiles.map((file) => {
            const expired = isExpired(file.expiry_date);
            return (
              <div key={file.id} className={`link-item ${expired ? 'expired' : ''}`}>
                <div className="link-info">
                  <h3>{file.file_name}</h3>
                  <div className="link-meta">
                    <span className={`status ${expired ? 'status-expired' : 'status-active'}`}>
                      {expired ? 'Expired' : 'Active'}
                    </span>
                    <span>•</span>
                    <span className="expiry">
                      <Clock size={14} />
                      Expires: {new Date(file.expiry_date).toLocaleDateString()}
                    </span>
                    {file.password_hash && (
                      <>
                        <span>•</span>
                        <span>Password Protected</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="link-actions">
                  <button 
                    className="btn-secondary" 
                    onClick={() => copyToClipboard(file.id)}
                    disabled={expired}
                  >
                    {copiedId === file.id ? <Check size={16} /> : <Copy size={16} />}
                    {copiedId === file.id ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SharedLinks;
