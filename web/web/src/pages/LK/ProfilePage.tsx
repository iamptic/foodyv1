import React, { useEffect, useState } from 'react';
import { ProfileAPI } from '../../lib/api';
import ProfileForm from '../../components/ProfileForm';
import { User } from '../../types';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    const u = await ProfileAPI.get();
    setUser(u);
  };

  useEffect(() => { load(); }, []);

  if (!user) return <div>Загрузка…</div>;

  return (
    <div>
      <ProfileForm user={user} onSave={async (payload) => {
        await ProfileAPI.update(payload);
        setMsg('Сохранено');
        await load();
        setTimeout(()=>setMsg(null), 2000);
      }} />
      {msg && <div className="mt-3 text-green-700">{msg}</div>}
    </div>
  );
}
