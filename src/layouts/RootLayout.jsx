import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from '../components/navigation/Sidebar.jsx';
import Topbar from '../components/navigation/Topbar.jsx';

export default function RootLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // lock body scroll when sidebar drawer is open on mobile
    document.body.style.overflow = isSidebarOpen ? 'hidden' : '';
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-transparent text-slate-900">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`min-w-0 transition-all duration-300 md:ml-72 xl:ml-72 ${isSidebarOpen ? 'pointer-events-none' : ''}`}>
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
