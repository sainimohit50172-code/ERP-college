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

  const marginLeft = 200;

  return (
    <div className="min-h-screen overflow-hidden bg-transparent text-slate-900">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`${isSidebarOpen ? 'pointer-events-none' : ''}`} style={{ margin: 0, padding: 0, width: 'calc(100% - 200px)', marginLeft: '200px', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
        <Topbar onToggleSidebar={() => setSidebarOpen((s) => !s)} />
        <main className="min-h-screen overflow-hidden px-0 pb-6 pt-2" style={{ paddingTop: 60 }}>
          <div className="w-full min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
