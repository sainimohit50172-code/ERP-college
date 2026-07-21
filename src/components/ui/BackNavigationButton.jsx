import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

function getFallbackPath(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length <= 1) return '/';
  return `/${segments[0]}`;
}

export default function BackNavigationButton() {
  const location = useLocation();
  const navigate = useNavigate();

  const shouldShow = (() => {
    const pathname = location.pathname || '/';
    if (pathname === '/' || pathname.startsWith('/auth') || pathname === '/unauthorized') {
      return false;
    }

    const segments = pathname.split('/').filter(Boolean);
    return segments.length > 1;
  })();

  if (!shouldShow) {
    return null;
  }

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.state && window.history.state.idx > 0) {
      navigate(-1);
      return;
    }

    const fallbackPath = getFallbackPath(location.pathname);
    if (fallbackPath && fallbackPath !== location.pathname) {
      navigate(fallbackPath);
      return;
    }

    navigate('/');
  };

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={handleBack}
        title="Back"
        aria-label="Go Back"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 hover-gradient-border focus:outline-none focus:ring-2 focus:ring-sky-200"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
    </div>
  );
}
