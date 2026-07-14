import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Activity as ActivityIcon, DownloadCloud, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Activity = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchActivity();
  }, [user]);

  const fetchActivity = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id)
        .order('download_count', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalDownloads = files.reduce((sum, file) => sum + (file.download_count || 0), 0);
  const totalFiles = files.length;

  if (loading) {
    return (
      <div className="activity-page">
        <h1>Activity</h1>
        <p>Loading activity data...</p>
      </div>
    );
  }

  return (
    <div className="activity-page">
      <h1>Activity Dashboard</h1>
      <p>Monitor your file engagement and statistics.</p>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">
            <DownloadCloud size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Downloads</h3>
            <h2>{totalDownloads}</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Files</h3>
            <h2>{totalFiles}</h2>
          </div>
        </div>
      </div>

      <div className="activity-list">
        <h2>Top Downloaded Files</h2>
        {files.length === 0 ? (
          <div className="empty-state">
            <ActivityIcon size={48} />
            <h3>No activity yet</h3>
          </div>
        ) : (
          <table className="activity-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Downloads</th>
                <th>Upload Date</th>
              </tr>
            </thead>
            <tbody>
              {files.filter(f => f.download_count > 0).map(file => (
                <tr key={file.id}>
                  <td>{file.file_name}</td>
                  <td><span className="badge">{file.download_count}</span></td>
                  <td>{new Date(file.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {files.filter(f => f.download_count > 0).length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center">No downloads yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Activity;
