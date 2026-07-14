import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { UploadCloud } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UploadFile = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !user) return;

    setUploading(true);
    setMessage('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`; // Group uploads by user in storage

      // 1. Upload file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('file-uploads')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // 2. Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('file-uploads')
        .getPublicUrl(filePath);

      const fileUrl = publicUrlData.publicUrl;

      // 3. Insert metadata into Database
      const { error: dbError } = await supabase
        .from('files')
        .insert([
          {
            file_name: file.name,
            file_url: fileUrl,
            file_size: file.size,
            storage_path: filePath,
            user_id: user.id
          }
        ]);

      if (dbError) {
        throw dbError;
      }

      setMessage('File uploaded successfully!');
      setFile(null);
    } catch (error) {
      console.error(error);
      setMessage(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <h1>Upload File</h1>
      <p>Securely upload and share your files.</p>
      
      <form onSubmit={handleUpload} className="upload-form">
        <div className="dropzone">
          <UploadCloud size={48} className="upload-icon" />
          <label htmlFor="file-input" className="file-label">
            {file ? file.name : 'Click to select a file or drag and drop'}
          </label>
          <input
            id="file-input"
            type="file"
            onChange={handleFileChange}
            className="file-input"
          />
        </div>
        
        {file && (
          <div className="file-details">
            <span>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
        )}

        <button 
          type="submit" 
          disabled={!file || uploading}
          className="btn-primary"
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>

        {message && <div className={`message ${message.includes('failed') ? 'error' : 'success'}`}>{message}</div>}
      </form>
    </div>
  );
};

export default UploadFile;
