import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const toTitle = (pathname) => {
  const segment = pathname.split('/').filter(Boolean).pop() || 'Dashboard';
  return segment
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const toPath = (pathname) => {
  const segments = pathname
    .split('/')
    .filter(Boolean)
    .map((segment) => segment.replace(/[-_]+/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase()));

  return segments.length ? ['Dashboard', ...segments].join(' > ') : 'Dashboard';
};

const readPageIdentity = (pathname) => {
  const pageRoot = document.querySelector('.erp-page-shell') || document.querySelector('.erp-content-wrapper');
  const breadcrumb = pageRoot?.querySelector('nav[aria-label="Breadcrumb"]');
  const heading = pageRoot?.querySelector('h1, h2');
  const path = breadcrumb
    ? Array.from(breadcrumb.children)
        .map((item) => item.textContent?.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .join(' > ')
    : toPath(pathname);

  return {
    path,
    title: heading?.textContent?.replace(/\s+/g, ' ').trim() || '',
  };
};

export default function PageTitleStrip() {
  const location = useLocation();
  const navigate = useNavigate();
  const [identity, setIdentity] = useState(() => ({ path: 'Dashboard', title: 'Dashboard' }));
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const clockId = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(clockId);
  }, []);

  useEffect(() => {
    let frameId;
    const updateIdentity = () => {
      const nextIdentity = readPageIdentity(location.pathname);
      setIdentity({
        path: nextIdentity.path,
        title: nextIdentity.title || toTitle(location.pathname),
      });
    };

    frameId = window.requestAnimationFrame(updateIdentity);
    const observer = new MutationObserver(updateIdentity);
    const target = document.querySelector('.erp-content-wrapper');
    if (target) observer.observe(target, { childList: true, subtree: true, characterData: true });

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [location.pathname]);

  return (
    <div className="erp-page-title-strip" aria-label="Current page">
      {location.pathname !== '/' && (
        <button
          type="button"
          className="erp-page-title-strip__back"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          title="Go back"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
      <div className="erp-page-title-strip__content">
        <div className="erp-page-title-strip__path">{identity.path}</div>
        <div className="erp-page-title-strip__heading">{identity.title}</div>
      </div>
      <div className="erp-page-title-strip__clock" aria-label="Live date and time" aria-live="polite">
        <span className="erp-page-title-strip__clock-status">LIVE</span>
        <span className="erp-page-title-strip__clock-day">
          {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}
        </span>
        <span className="erp-page-title-strip__clock-date">
          {currentTime.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
        <span className="erp-page-title-strip__clock-time">
          {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
        </span>
      </div>
    </div>
  );
}
