import { Zap, ArrowRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function ComingSoonPage() {
  const location = useLocation();
  
  // Extract a readable name from the path
  const getPageName = () => {
    const path = location.pathname;
    const lastSegment = path.split('/').filter(Boolean).pop() || 'This feature';
    
    // Convert kebab-case to Title Case
    return lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
        <Zap className="h-8 w-8 text-blue-600" />
      </div>
      
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Coming Soon
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          {getPageName()} is under construction
        </p>
      </div>

      <p className="max-w-md text-sm text-slate-500">
        We're working hard to bring you this feature. Check back soon for updates!
      </p>

      <div className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-600">
        <span>Coming to your dashboard</span>
        <ArrowRight className="h-4 w-4" />
      </div>
    </div>
  );
}
