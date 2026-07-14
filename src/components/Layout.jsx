import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, UploadCloud, Folder, Link as LinkIcon, Activity, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { name: 'Upload File', path: '/upload', icon: <UploadCloud size={20} /> },
    { name: 'My Files', path: '/files', icon: <Folder size={20} /> },
    { name: 'Shared Links', path: '/shared', icon: <LinkIcon size={20} /> },
    { name: 'Activity', path: '/activity', icon: <Activity size={20} /> },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to sign out', error);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo">
          <h2>SecureShare</h2>
        </div>
        <nav className="nav-menu">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', padding: '16px' }}>
          <button className="nav-item" onClick={handleSignOut} style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div className="user-profile">
            <div className="avatar">{getInitials(profile?.name || user?.user_metadata?.name || user?.email)}</div>
            <span>{profile?.name || user?.user_metadata?.name || user?.email || 'User'}</span>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
