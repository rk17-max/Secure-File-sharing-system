import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { UploadCloud, Folder, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalFiles: 0,
    storageUsed: 0,
    activeLinks: 0
  });
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchDashboardStats();
  }, [user]);

  const fetchDashboardStats = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data) {
        const totalSize = data.reduce((acc, file) => acc + (file.file_size || 0), 0);
        const activeLinks = data.filter(file => file.expiry_date && new Date(file.expiry_date) > new Date()).length;

        setStats({
          totalFiles: data.length,
          storageUsed: totalSize,
          activeLinks: activeLinks
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
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
    return (
      <div>
        <h1>Dashboard</h1>
        <p>Loading overview...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Welcome back!</h1>
      <p>Here is an overview of your file sharing platform.</p>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">
            <Folder size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Files</h3>
            <h2>{stats.totalFiles}</h2>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--success)' }}>
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <h3>Storage Used</h3>
            <h2>{formatSize(stats.storageUsed)}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--danger)' }}>
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <h3>Active Links</h3>
            <h2>{stats.activeLinks}</h2>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/upload" className="action-card">
            <UploadCloud size={32} />
            <h3>Upload New File</h3>
            <p>Securely upload and share</p>
          </Link>
          <Link to="/files" className="action-card">
            <Folder size={32} />
            <h3>Manage Files</h3>
            <p>View all your uploads</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
