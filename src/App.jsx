import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import UploadFile from './pages/UploadFile';
import MyFiles from './pages/MyFiles';
import SharedLinks from './pages/SharedLinks';
import Activity from './pages/Activity';
import DownloadFile from './pages/DownloadFile';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/download/:id" element={<DownloadFile />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="upload" element={<UploadFile />} />
              <Route path="files" element={<MyFiles />} />
              <Route path="shared" element={<SharedLinks />} />
              <Route path="activity" element={<Activity />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
