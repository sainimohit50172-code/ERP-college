import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import DesignationManagementPage from '../pages/DesignationManagementPage.jsx';

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../hooks/useResourceHooks', () => ({
  useResourceList: () => ({
    data: {
      items: [
        { id: 1, title: 'Chief Executive Officer', level: 1, description: 'Overall organization leadership', mobile_number: '+91 98765 43210', created_at: '2025-05-15T10:30:00Z' },
        { id: 2, title: 'Finance Manager', level: 2, description: 'Financial planning and reporting', mobile_number: '+91 98765 43211', created_at: '2025-05-13T09:45:00Z' },
      ],
    },
    isLoading: false,
  }),
  useCreateResource: () => ({ mutateAsync: vi.fn() }),
  useUpdateResource: () => ({ mutateAsync: vi.fn() }),
  useDeleteResource: () => ({ mutate: vi.fn() }),
}));

describe('DesignationManagementPage', () => {
  it('renders the premium HRM designation layout and summary cards', () => {
    render(
      <MemoryRouter>
        <DesignationManagementPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Designation/i)).toBeInTheDocument();
    expect(screen.getByText(/HRM Master Designation Setting/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add New Designation/i })).toBeInTheDocument();
    expect(screen.getByText(/Total Designations/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Designations/i)).toBeInTheDocument();
    expect(screen.getByText(/Inactive Designations/i)).toBeInTheDocument();
    expect(screen.getByText(/Last Updated/i)).toBeInTheDocument();
    expect(screen.getByText(/Designation List/i)).toBeInTheDocument();
  });
});
