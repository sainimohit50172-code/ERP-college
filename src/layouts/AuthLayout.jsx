import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="erp-content-wrapper">
      <Outlet />
    </div>
  );
}
