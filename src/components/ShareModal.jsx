import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Copy, Check } from 'lucide-react';

const ShareModal = ({ file, onClose }) => {
  const [expiryDays, setExpiryDays] = useState('7');
  const [password, setPassword] = useState('');
  const [generating, setGenerating] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateLink = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setError('');

    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(expiryDays));

      let passwordHash = null;
      if (password) {
        // In a real app, hash this on the server or edge function
        // For this demo, we'll store a simple hash or plain text just to demonstrate the flow
        // NEVER do this in production without proper backend hashing!
        passwordHash = btoa(password); 
      }

      const { error: updateError } = await supabase
        .from('files')
        .update({
          expiry_date: expiryDate.toISOString(),
          password_hash: passwordHash
        })
        .eq('id', file.id);

      if (updateError) throw updateError;

      // Generate the download link (this would typically point to a download page that checks password)
      const link = `${window.location.origin}/download/${file.id}`;
      setShareLink(link);
    } catch (err) {
      console.error(err);
      setError('Failed to generate link.');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Share File</h2>
          <button onClick={onClose} className="icon-btn"><X size={20} /></button>
        </div>
        
        <div className="modal-body">
          <div className="file-preview">
            <strong>{file.file_name}</strong>
          </div>

          {!shareLink ? (
            <form onSubmit={handleGenerateLink} className="share-form">
              <div className="form-group">
                <label>Expires In</label>
                <select value={expiryDays} onChange={(e) => setExpiryDays(e.target.value)}>
                  <option value="1">1 Day</option>
                  <option value="7">7 Days</option>
                  <option value="30">30 Days</option>
                  <option value="365">1 Year</option>
                </select>
              </div>

              <div className="form-group">
                <label>Password Protection (Optional)</label>
                <input 
                  type="password" 
                  placeholder="Leave blank for no password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <div className="error-text">{error}</div>}

              <button type="submit" className="btn-primary" disabled={generating}>
                {generating ? 'Generating...' : 'Generate Link'}
              </button>
            </form>
          ) : (
            <div className="share-result">
              <p>Your shareable link is ready!</p>
              <div className="link-box">
                <input type="text" readOnly value={shareLink} />
                <button onClick={copyToClipboard} className="copy-btn" title="Copy to clipboard">
                  {copied ? <Check size={20} className="success-icon" /> : <Copy size={20} />}
                </button>
              </div>
              <p className="helper-text">
                {password ? 'This link requires a password.' : 'Anyone with this link can download the file.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
