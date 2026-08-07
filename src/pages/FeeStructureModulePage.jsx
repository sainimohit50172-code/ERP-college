import { Navigate, useParams } from 'react-router-dom';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import GenericCrudPage from '../components/ui/GenericCrudPage.jsx';

const moduleConfigFiles = import.meta.glob('../configs/feeStructure/*.config.js', { eager: true });
const feeStructureModules = Object.values(moduleConfigFiles)
  .map((module) => module.default)
  .filter((config) => config && config.key);
const feeStructureModuleMap = Object.fromEntries(feeStructureModules.map((config) => [config.key, config]));

export default function FeeStructureModulePage() {
  const { page } = useParams();
  const moduleConfig = feeStructureModuleMap[page];

  if (!moduleConfig) {
    return <Navigate to="/settings/fee-structure" replace />;
  }

  return (
    <div className="min-h-[calc(100vh-7rem)] rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-3 shadow-[0_18px_45px_rgba(15,23,42,0.06)] lg:p-5">
      <div className="rounded-[22px] border border-slate-200/70 bg-white/95 p-4 shadow-inner sm:p-6">
        <Breadcrumb
          items={moduleConfig.breadcrumbs ?? [
            { label: 'Dashboard', to: '/' },
            { label: 'Settings', to: '/settings' },
            { label: 'Fee Structure', to: '/settings/fee-structure' },
            { label: moduleConfig.title },
          ]}
        />
        <GenericCrudPage {...moduleConfig} description={moduleConfig.description} />
      </div>
    </div>
  );
}
