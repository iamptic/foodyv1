import React, { useState } from 'react';
import { Input } from '../components/Input';
import Button from '../components/Button';
import { AuthAPI } from '../lib/api';
import { setAccessToken, setRefreshToken } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import AddressForm from '../components/AddressForm';

export default function RegisterPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [addr, setAddr] = useState({ city: '', address: '', lat: '', lng: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null);
    try {
      const payload = { email, password, name, ...addr };
      const res: any = await AuthAPI.register(payload);
      setAccessToken(res.accessToken); setRefreshToken(res.refreshToken);
      nav('/lk');
    } catch (e: any) {
      setError(e.message || 'Ошибка регистрации');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Регистрация</h1>
      <form onSubmit={submit} className="space-y-3">
        <Input type="text" placeholder="Имя" value={name} onChange={e=>setName(e.target.value)} />
        <Input type="email" placeholder="email@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
        <Input type="password" placeholder="Пароль" value={password} onChange={e=>setPassword(e.target.value)} />
        <AddressForm value={addr} onChange={setAddr} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <Button type="submit" className="bg-indigo-600 text-white" loading={loading}>Создать аккаунт</Button>
      </form>
    </div>
  );
}
