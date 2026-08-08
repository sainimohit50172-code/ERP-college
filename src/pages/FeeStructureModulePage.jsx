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

  const content = (
    <>
      <Breadcrumb
        items={moduleConfig.breadcrumbs ?? [
          { label: 'Dashboard', to: '/' },
          { label: 'Settings', to: '/settings' },
          { label: 'Fee Structure', to: '/settings/fee-structure' },
          { label: moduleConfig.title },
        ]}
      />
      <GenericCrudPage {...moduleConfig} description={moduleConfig.description} />
    </>
  );

  return (
    <div className="space-y-6 px-4 pb-6 sm:px-0">
      {content}
    </div>
  );
}
