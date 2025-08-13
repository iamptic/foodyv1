import React, { useState } from 'react';
import { Input } from './Input';
import Button from './Button';
import { User } from '../types';

export default function ProfileForm({ user, onSave }: { user: User; onSave: (payload: Partial<User>) => Promise<void> }) {
  const [form, setForm] = useState<Partial<User>>({
    name: user.name || '',
    city: user.city || '',
    address: user.address || '',
    lat: user.lat ?? undefined,
    lng: user.lng ?? undefined,
  });
  const [loading, setLoading] = useState(false);

  const handle = (k: keyof User) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(form);
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="max-w-xl space-y-2">
      <Input label="Имя" value={String(form.name || '')} onChange={handle('name')} placeholder="Иван"/>
      <Input label="Город" value={String(form.city || '')} onChange={handle('city')} placeholder="Москва"/>
      <Input label="Адрес" value={String(form.address || '')} onChange={handle('address')} placeholder="ул. Пушкина, д. 1"/>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Широта (lat)" value={String(form.lat ?? '')} onChange={handle('lat')} placeholder="55.751244"/>
        <Input label="Долгота (lng)" value={String(form.lng ?? '')} onChange={handle('lng')} placeholder="37.618423"/>
      </div>
      <Button type="submit" className="bg-indigo-600 text-white">Сохранить</Button>
    </form>
  );
}
