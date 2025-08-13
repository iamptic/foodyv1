import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LKLayout from './pages/LK';
import ProfilePage from './pages/LK/ProfilePage';
import ArchivePage from './pages/LK/ArchivePage';

export const router = createBrowserRouter([
  { path: '/', element: <LoginPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    path: '/lk',
    element: <LKLayout />,
    children: [
      { path: '/lk', element: <ProfilePage /> },
      { path: '/lk/profile', element: <ProfilePage /> },
      { path: '/lk/archive', element: <ArchivePage /> },
    ],
  },
]);
