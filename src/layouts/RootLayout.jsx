import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from '../components/navigation/Sidebar.jsx';
import Topbar from '../components/navigation/Topbar.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import BackNavigationButton from '../components/ui/BackNavigationButton.jsx';

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
        <main className="min-h-screen overflow-x-hidden bg-[#f5f6fa] pb-24 pt-28 sm:pt-20">
          <div className="erp-content-wrapper">
            <ErrorBoundary>
              <div className="pt-1">
                <BackNavigationButton />
                <Outlet />
              </div>
            </ErrorBoundary>
          </div>
        </main>
        <footer className="fixed bottom-0 left-0 z-30 flex h-[25px] w-full items-center justify-center border-t border-white/20 px-4 py-0 text-center text-[11px] text-white sm:px-6 md:left-[200px] md:w-[calc(100%-200px)] lg:px-8" style={{ background: 'linear-gradient(180deg, #3a241b 0%, #292625 48%, #171717 100%)' }}>
          © 2026 HARIDWAR UNIVERSITY - Campus Automation Partner
        </footer>
      </div>
    </div>
  );
}
