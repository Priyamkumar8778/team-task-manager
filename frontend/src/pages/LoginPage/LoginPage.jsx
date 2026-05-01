import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input, Btn } from '../components/UI';
import './Auth.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-icon">▲</span>
          <h1>TaskFlow</h1>
          <p>Sign in to your workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-msg">{error}</div>}
          <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" required />
          <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required />
          <Btn type="submit" loading={loading} size="lg" style={{ width: '100%', justifyContent: 'center' }}>
            Sign In
          </Btn>
        </form>

        <div className="auth-hint">
          <p>No account? <Link to="/register">Create one</Link></p>
          <p className="demo-hint">Demo: admin@demo.com / password123</p>
        </div>
      </div>
    </div>
  );
}