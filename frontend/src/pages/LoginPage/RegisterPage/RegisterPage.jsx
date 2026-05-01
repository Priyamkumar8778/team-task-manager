import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input, Select, Btn } from '../components/UI';
import './Auth.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
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
          <p>Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-msg">{error}</div>}
          <Input label="Name" value={form.name} onChange={set('name')} placeholder="Your name" required />
          <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" required />
          <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" required />
          <Select label="Role" value={form.role} onChange={set('role')}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </Select>
          <Btn type="submit" loading={loading} size="lg" style={{ width: '100%', justifyContent: 'center' }}>
            Create Account
          </Btn>
        </form>

        <div className="auth-hint">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}