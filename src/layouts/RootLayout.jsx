import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from '../components/navigation/Sidebar.jsx';
import Topbar from '../components/navigation/Topbar.jsx';
import { useERP } from '../services/ERPContext.jsx';

export default function RootLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { sidebarCollapsed } = useERP();

  useEffect(() => {
    // lock body scroll when sidebar drawer is open on mobile
    document.body.style.overflow = isSidebarOpen ? 'hidden' : '';
  }, [isSidebarOpen]);

  const marginLeft = sidebarCollapsed ? 72 : 240;

  return (
    <div className="min-h-screen overflow-x-hidden bg-transparent text-slate-900">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div
        className={`${isSidebarOpen ? 'pointer-events-none' : ''}`}
        style={{ transition: 'margin-left 0.25s ease', marginLeft: `${marginLeft}px` }}
      >
        <Topbar onToggleSidebar={() => setSidebarOpen((s) => !s)} />
        <main className="min-h-screen px-2 pb-6 pt-2 sm:px-3 md:px-4 lg:px-5 xl:px-6">
          <div className="mx-auto w-full max-w-7xl min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
