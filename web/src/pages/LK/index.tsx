import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthAPI } from '../../lib/api';
import { getAccessToken } from '../../lib/auth';

export default function LKLayout() {
  const nav = useNavigate();
  const loc = useLocation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      nav('/login');
      return;
    }
    setReady(true);
  }, [nav]);

  const isActive = (path: string) => (loc.pathname === path ? 'font-semibold text-indigo-600' : 'text-gray-700');

  if (!ready) return null;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Личный кабинет</h1>
      <nav className="flex gap-4 mb-6 border-b pb-3">
        <Link className={isActive('/lk/profile')} to="/lk/profile">Профиль</Link>
        <Link className={isActive('/lk/archive')} to="/lk/archive">Архив</Link>
        <button className="ml-auto text-red-600" onClick={() => AuthAPI.logout().then(()=>nav('/login'))}>Выйти</button>
      </nav>
      <Outlet />
    </div>
  );
}
