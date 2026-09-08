import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function Layout() {
  return (
    <div
      className="flex h-screen w-full overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: 'var(--color-content-bg)' }}
    >
      <Sidebar />
      <Outlet />
    </div>
  );
}

export default Layout;