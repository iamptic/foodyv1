import React, { useState } from 'react';
import { Input } from '../components/Input';
import Button from '../components/Button';
import { AuthAPI } from '../lib/api';
import { setAccessToken, setRefreshToken } from '../lib/auth';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res: any = await AuthAPI.login(email, password);
      setAccessToken(res.accessToken);
      setRefreshToken(res.refreshToken);
      nav('/lk');
    } catch (e: any) {
      setError(e.message || 'Ошибка входа');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Вход</h1>
      <form onSubmit={submit} className="space-y-3">
        <Input type="email" placeholder="email@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
        <Input type="password" placeholder="Пароль" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <Button type="submit" className="bg-indigo-600 text-white" loading={loading}>Войти</Button>
      </form>
      <div className="mt-3 text-sm">Нет аккаунта? <Link className="text-indigo-600" to="/register">Регистрация</Link></div>
    </div>
  );
}
