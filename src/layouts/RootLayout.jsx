import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from '../components/navigation/Sidebar.jsx';
import Topbar from '../components/navigation/Topbar.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';

export default function RootLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // lock body scroll when sidebar drawer is open on mobile
    document.body.style.overflow = isSidebarOpen ? 'hidden' : '';
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f6fa] text-slate-900">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="relative min-h-screen w-full overflow-x-hidden transition-all duration-200 md:ml-[200px] md:w-[calc(100%-200px)] bg-[#f5f6fa]">
        <Topbar onToggleSidebar={() => setSidebarOpen((s) => !s)} />
        <main className="min-h-screen overflow-x-hidden bg-[#f5f6fa] px-[10px] pb-6 pt-20">
          <div className="w-full min-w-0">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
        <footer className="border-t border-slate-200 bg-[#f8fafc] px-4 py-4 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
          © 2026 HARIDWAR UNIVERSITY - Campus Automation Partner
        </footer>
      </div>
    </div>
  );
}
