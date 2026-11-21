import { useState } from 'react';
import { apiRequest } from './api';

export default function AuthPage({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await apiRequest('/auth/register', 'POST', { name, email, password });
      }
      const res = await apiRequest('/auth/login', 'POST', { email, password });
      const token = res.access_token || res.token;
      if (!token) throw new Error('Token tidak ditemukan dari server');

      localStorage.setItem('token', token);
      onLoginSuccess();
    } catch (err) {
      setError(Array.isArray(err.message) ? err.message.join(', ') : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <h2>{isRegister ? 'Daftar Akun Baru' : 'Login Student Activity'}</h2>
        <p className="subtitle">Catat & pantau progres belajarmu</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label>Nama Lengkap</label>
              <input
                type="text"
                placeholder="Contoh: Angie"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Memproses...' : isRegister ? 'Daftar & Masuk' : 'Masuk'}
          </button>
        </form>

        <p className="switch-auth">
          {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
          >
            {isRegister ? 'Login di sini' : 'Daftar sekarang'}
          </button>
        </p>
      </div>
    </div>
  );
}